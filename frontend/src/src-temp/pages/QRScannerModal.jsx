import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// --- Re-usable Icon ---
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;

export default function QRScannerModal({ onClose, onScanSuccess }) {
  useEffect(() => {
    // This function will be called when a QR code is successfully scanned
    function handleScanSuccess(decodedText, decodedResult) {
      console.log(`Scan result: ${decodedText}`, decodedResult);
      onScanSuccess(decodedText); // Pass the result back to the dashboard
      scanner.clear(); // Stop the scanner
    }

    // This function can be used to handle scan errors
    function handleScanError(errorMessage) {
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
        <p className="mt-4 text-gray-600">Please point your camera at the QR code displayed by your teacher.</p>
      </div>
    </div>
  );
}

