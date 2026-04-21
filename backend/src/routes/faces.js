const { Router } = require('express');
const multer = require('multer');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = Router();

// Memory storage so we can forward the buffer directly to the Flask AI service.
const upload = multer({ storage: multer.memoryStorage() });
const uploadSingleImage = upload.single('image');

// RFC 4122 uuid validator — keeps dependencies lean vs pulling in a uuid lib.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Admin authorization guard — matches the pattern in routes/admin.js.
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

/**
 * Conditionally run multer only for multipart requests. JSON bodies are left
 * untouched so `req.body.image_base64` is available downstream.
 */
function maybeMultipart(req, res, next) {
  if (req.is('multipart/form-data')) {
    return uploadSingleImage(req, res, next);
  }
  next();
}

/**
 * POST /api/faces/enroll
 * Admin-only. Accepts multipart/form-data with `student_id` and `image`,
 * forwards the image to the Flask AI service to produce a 128-float encoding,
 * then upserts the encoding JSON into face_encodings keyed by student_id.
 */
router.post(
  '/enroll',
  authMiddleware,
  requireAdmin,
  maybeMultipart,
  async (req, res, next) => {
    try {
      const { student_id } = req.body;

      if (!student_id || typeof student_id !== 'string') {
        return res.status(400).json({ success: false, error: 'student_id is required' });
      }
      if (!UUID_RE.test(student_id)) {
        return res.status(400).json({ success: false, error: 'student_id must be a valid uuid' });
      }

      // Resolve the image as base64 from whichever request shape was used.
      let imageBase64;
      if (req.file && req.file.buffer) {
        imageBase64 = req.file.buffer.toString('base64');
      } else if (typeof req.body.image_base64 === 'string' && req.body.image_base64.length > 0) {
        imageBase64 = req.body.image_base64;
      } else {
        return res.status(400).json({
          success: false,
          error: 'image is required (multipart `image` file or JSON `image_base64`)',
        });
      }

      // Confirm the target is an actual student user so we don't write orphan rows.
      const studentRes = await db.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'student'",
        [student_id],
      );
      if (studentRes.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Student not found' });
      }

      // Forward the image to the Flask AI service as JSON with base64.
      let aiRes;
      try {
        aiRes = await fetch(`${process.env.AI_SERVICE_URL}/api/v1/face-recognition/encode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: imageBase64 }),
        });
      } catch (_networkErr) {
        return res.status(502).json({ success: false, error: 'AI service unavailable' });
      }

      if (!aiRes.ok) {
        return res.status(502).json({ success: false, error: 'AI service unavailable' });
      }

      const aiBody = await aiRes.json();
      const encoding = aiBody && aiBody.data && aiBody.data.encoding;
      if (!Array.isArray(encoding) || encoding.length === 0) {
        return res.status(502).json({ success: false, error: 'AI service returned invalid encoding' });
      }

      const encodingJson = JSON.stringify(encoding);

      await db.query(
        `INSERT INTO face_encodings (student_id, encoding_json)
         VALUES ($1, $2)
         ON CONFLICT (student_id)
         DO UPDATE SET encoding_json = EXCLUDED.encoding_json, updated_at = now()`,
        [student_id, encodingJson],
      );

      res.json({ success: true, data: { student_id, enrolled: true } });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/faces/encodings
 * Internal endpoint (no auth) — the Flask AI service calls this at startup to
 * load every student face encoding into memory. Joins users to include name.
 */
router.get('/encodings', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT fe.student_id, u.name, fe.encoding_json
         FROM face_encodings fe
         JOIN users u ON u.id = fe.student_id
        WHERE u.role = 'student'`,
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
