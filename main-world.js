// Runs in the page's MAIN world to sanitize any native clipboard writes
(function () {
  'use strict';

  // Pattern matching X/Twitter status links with tracking params
  const X_STATUS_REGEX = /^(https?:\/\/(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+)(\?[^\s#]*)?(#.*)?$/;

  function cleanUrl(text) {
    if (typeof text !== 'string') return text;
    const match = text.trim().match(X_STATUS_REGEX);
    if (match) {
      // match[1] is clean url: https://x.com/username/status/12345
      // Strip ?s=20&t=... and keep optional clean hash or drop hash
      return match[1];
    }
    return text;
  }

  // Intercept navigator.clipboard.writeText
  if (navigator.clipboard && navigator.clipboard.writeText) {
    const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = function (text) {
      const sanitized = cleanUrl(text);
      return originalWriteText(sanitized);
    };
  }
})();
