import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

// --- Re-usable Icon ---
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

export default function QRScannerModal({ onClose, onScanSuccess }) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');

  /**
   * Handles QR code decoding from an uploaded image file.
   * Uses Html5Qrcode.scanFile() to decode without requiring camera access.
   * @param {Event} e - The file input change event
   */
  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    const html5Qrcode = new Html5Qrcode('qr-file-scanner');
    html5Qrcode
      .scanFile(file, /* showImage= */ false)
      .then((decodedText) => {
        try {
          const parsed = JSON.parse(decodedText);
          onScanSuccess(parsed);
        } catch {
          setUploadError('Invalid QR code format.');
        }
      })
      .catch(() => {
        setUploadError('Could not read QR code from image. Please try a clearer photo.');
      })
      .finally(() => {
        html5Qrcode.clear();
        // Reset file input so the same file can be re-selected
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  }

  useEffect(() => {
    // This function will be called when a QR code is successfully scanned
    function handleScanSuccess(decodedText, decodedResult) {
      console.log(`Scan result: ${decodedText}`, decodedResult);
      try {
        const parsed = JSON.parse(decodedText);
        onScanSuccess(parsed);
      } catch {
        onScanSuccess(null); // Invalid QR code format
      }
      scanner.clear(); // Stop the scanner
    }

    // This function can be used to handle scan errors
    function handleScanError() {
      // We can ignore errors for this prototype
    }

    // Create a new scanner instance
    const scanner = new Html5QrcodeScanner(
      'qr-reader', // The ID of the div element where the scanner will be rendered
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        // Important: Make sure the scanner only uses the back camera
        facingMode: "environment" 
      },
      false // verbose = false
    );

    // Start scanning
    scanner.render(handleScanSuccess, handleScanError);

    // Cleanup function: this will be called when the component is unmounted
    return () => {
      // Check if scanner is still active before trying to clear
      if (scanner && scanner.getState() !== 1) { // 1 is NOT_STARTED state
          scanner.clear().catch(error => {
            console.error("Failed to clear html5-qrcode scanner.", error);
          });
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 text-center relative max-w-sm w-full">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><XIcon /></button>
        <h2 className="text-xl font-bold mb-4">Scan Attendance QR Code</h2>
        {/* The scanner will be rendered inside this div */}
        <div id="qr-reader" className="w-full border-2 rounded-lg overflow-hidden"></div>
        {/* Hidden element required by Html5Qrcode for file scanning */}
        <div id="qr-file-scanner" className="hidden"></div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload QR Image
        </button>
        {uploadError && (
          <p className="mt-2 text-sm text-red-500">{uploadError}</p>
        )}
        <p className="mt-3 text-gray-600">Please point your camera at the QR code displayed by your teacher.</p>
      </div>
    </div>
  );
}

QRScannerModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onScanSuccess: PropTypes.func.isRequired,
};

