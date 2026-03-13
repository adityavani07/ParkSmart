import React, { useEffect, useRef, useState } from 'react';

const QRScanner = ({ onScan }) => {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let scanner = null;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        
        scanner = new Html5QrcodeScanner('qr-reader', {
          qrbox: { width: 250, height: 250 },
          fps: 10,
          rememberLastUsedCamera: true,
          aspectRatio: 1.0
        });

        scanner.render(
          (decodedText) => {
            scanner.clear().catch(() => {});
            if (onScan) onScan(decodedText);
          },
          (err) => {
            // Ignore continuous scan errors (normal behavior)
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error('Scanner init error:', err);
        setError('Failed to initialize camera scanner');
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-xl">
        <p className="text-red-600 mb-4">❌ {error}</p>
        <ManualEntry onScan={onScan} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" ref={containerRef} className="rounded-xl overflow-hidden"></div>
      <div className="mt-4 border-t pt-4">
        <ManualEntry onScan={onScan} />
      </div>
    </div>
  );
};

// Manual QR Data Entry (Backup if camera doesn't work)
const ManualEntry = ({ onScan }) => {
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-500 text-center mb-2">
        Or paste QR data manually:
      </p>
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Paste QR code data here..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default QRScanner;