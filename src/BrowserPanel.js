import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

const isLikelyUrl = (value) => {
  if (!value) return false;
  try {
    // If it parses as URL with protocol, it's fine
    const u = new URL(value);
    return !!u.protocol && !!u.host;
  } catch (_) {
    // Fallback: if missing protocol, try adding https:// and re-parse
    try {
      const u2 = new URL(`https://${value}`);
      return !!u2.protocol && !!u2.host;
    } catch {
      return false;
    }
  }
};

const normalizeUrl = (value) => {
  if (!value) return '';
  try {
    // Already a proper absolute URL
    // eslint-disable-next-line no-new
    new URL(value);
    return value;
  } catch {
    return `https://${value}`;
  }
};

const BrowserPanel = () => {
  const [address, setAddress] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');
  const iframeRef = useRef(null);

  const handleGo = () => {
    if (!address) return;
    if (!isLikelyUrl(address)) return;
    const next = normalizeUrl(address.trim());
    setCurrentUrl(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGo();
    }
  };

  useEffect(() => {
    // Optionally, sync address bar when URL changes externally (not applicable here)
  }, [currentUrl]);

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="p-2 border-b border-gray-700 flex items-center gap-2">
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter website URL (e.g. https://example.com or example.com)"
          className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-400"
        />
        <Button size="sm" variant="outline" onClick={handleGo} className="shrink-0">
          Go
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-black">
        <iframe
          ref={iframeRef}
          title="browser"
          src={currentUrl}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-modals allow-presentation allow-top-navigation-by-user-activation"
        />
      </div>
    </div>
  );
};

export default BrowserPanel;


