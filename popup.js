// Clean Link for X - Popup Logic
(function () {
  'use strict';

  // UI Elements
  const domainSelect = document.getElementById('domain-select');
  const shiftDomainSelect = document.getElementById('shift-domain-select');
  const formatButtons = document.querySelectorAll('#format-group .pill');
  const showToastToggle = document.getElementById('show-toast-toggle');
  const previewOutput = document.getElementById('preview-output');

  let currentSettings = {
    domain: 'x.com',
    format: 'url',
    shiftDomain: 'fixupx.com',
    showToast: true
  };

  const storage = (typeof chrome !== 'undefined' && chrome.storage && (chrome.storage.sync || chrome.storage.local)) || null;

  function updatePreview() {
    const domain = currentSettings.domain || 'x.com';
    const cleanUrl = `https://${domain}/username/status/1234567890`;

    if (currentSettings.format === 'markdown') {
      previewOutput.textContent = `[Post by @username](${cleanUrl})`;
    } else {
      previewOutput.textContent = cleanUrl;
    }
  }

  function saveSettings() {
    if (storage) {
      storage.set(currentSettings, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.error('[CleanLink] Storage save error:', chrome.runtime.lastError);
        }
      });
    }
    updatePreview();
  }

  function loadSettings() {
    if (storage) {
      storage.get(['domain', 'format', 'shiftDomain', 'showToast'], (items) => {
        if (items) {
          currentSettings = { ...currentSettings, ...items };
        }
        applySettingsToUI();
      });
    } else {
      applySettingsToUI();
    }
  }

  function applySettingsToUI() {
    if (domainSelect) {
      domainSelect.value = currentSettings.domain;
    }
    if (shiftDomainSelect) {
      shiftDomainSelect.value = currentSettings.shiftDomain;
    }
    if (showToastToggle) {
      showToastToggle.checked = currentSettings.showToast;
    }

    formatButtons.forEach((btn) => {
      const val = btn.getAttribute('data-value');
      if (val === currentSettings.format) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    updatePreview();
  }

  // Event Listeners
  if (domainSelect) {
    domainSelect.addEventListener('change', (e) => {
      currentSettings.domain = e.target.value;
      saveSettings();
    });
  }

  if (shiftDomainSelect) {
    shiftDomainSelect.addEventListener('change', (e) => {
      currentSettings.shiftDomain = e.target.value;
      saveSettings();
    });
  }

  if (showToastToggle) {
    showToastToggle.addEventListener('change', (e) => {
      currentSettings.showToast = e.target.checked;
      saveSettings();
    });
  }

  formatButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      formatButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentSettings.format = btn.getAttribute('data-value');
      saveSettings();
    });
  });

  // Initial load
  loadSettings();
})();
