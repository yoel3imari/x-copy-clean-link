// Clean Link for X - Content Script
(function () {
  'use strict';

  // SVG Icons matching Twitter/X 24x24 viewBox aesthetic
  const ICONS = {
    // Interlocking link icon
    link: `<svg viewBox="0 0 24 24" aria-hidden="true" class="clean-copy-icon link">
      <g>
        <path d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a3.003 3.003 0 0 0 0-4.24 3.003 3.003 0 0 0-4.24 0l-3.53 3.53a3.003 3.003 0 0 0 0 4.24zm2.82-2.82c-.41-.39-.41-1.03 0-1.42.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.42l-.47.48a3.003 3.003 0 0 0 0 4.24 3.003 3.003 0 0 0 4.24 0l3.53-3.53a3.003 3.003 0 0 0 0-4.24z"/>
      </g>
    </svg>`,
    // Checkmark icon for copied state
    check: `<svg viewBox="0 0 24 24" aria-hidden="true" class="clean-copy-icon check">
      <g>
        <path d="M9.64 18.952l-5.55-5.55 1.414-1.414 4.136 4.136 10.076-10.075 1.414 1.414z"/>
      </g>
    </svg>`,
    // Toast checkmark
    toastCheck: `<svg viewBox="0 0 24 24" class="clean-link-toast-icon">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>`
  };

  // Default configuration
  let config = {
    domain: 'x.com', // 'x.com', 'twitter.com', 'fixupx.com', 'fxtwitter.com', 'vxtwitter.com'
    format: 'url',   // 'url' or 'markdown'
    shiftDomain: 'fixupx.com',
    showToast: true
  };

  // Load configuration from storage
  function loadConfig() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const storageArea = chrome.storage.sync || chrome.storage.local;
      storageArea.get(['domain', 'format', 'shiftDomain', 'showToast'], (items) => {
        if (items) {
          config = { ...config, ...items };
        }
      });
    }
  }

  // Listen for config changes from popup
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      for (const key of Object.keys(changes)) {
        if (key in config) {
          config[key] = changes[key].newValue;
        }
      }
    });
  }

  loadConfig();

  // Toast notification manager
  let toastEl = null;
  let toastTimer = null;

  function showToast(message, url) {
    if (!config.showToast) return;

    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'clean-link-toast';
      document.body.appendChild(toastEl);
    }

    toastEl.innerHTML = `
      ${ICONS.toastCheck}
      <span class="clean-link-toast-text">
        ${message}
        ${url ? `<span class="clean-link-toast-url">${escapeHtml(url)}</span>` : ''}
      </span>
    `;

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.classList.add('visible');
    });

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toastEl) {
        toastEl.classList.remove('visible');
      }
    }, 2200);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return m;
      }
    });
  }

  // Reliable clipboard writer
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fall back below if clipboard API fails
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();

    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (e) {
      console.error('[CleanLink] execCommand copy failed:', e);
    }
    document.body.removeChild(textarea);
    return success;
  }

  // Extract clean post username and status ID from a tweet article
  function extractPostInfo(article) {
    // 1. Check timestamp permalink (X's standard)
    const timeEl = article.querySelector('time');
    if (timeEl) {
      const link = timeEl.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        const match = href.match(/\/([A-Za-z0-9_]+)\/status\/(\d+)/);
        if (match) {
          return { username: match[1], statusId: match[2] };
        }
      }
    }

    // 2. Check direct status links in the article, ignoring nested articles (e.g. quote tweets)
    const links = article.querySelectorAll('a[href*="/status/"]');
    for (const link of links) {
      if (link.closest('article') !== article) continue;
      const href = link.getAttribute('href') || '';
      const match = href.match(/\/([A-Za-z0-9_]+)\/status\/(\d+)/);
      if (match) {
        return { username: match[1], statusId: match[2] };
      }
    }

    // 3. Fallback: if user is viewing a single tweet page
    const pathname = window.location.pathname;
    const pageMatch = pathname.match(/\/([A-Za-z0-9_]+)\/status\/(\d+)/);
    if (pageMatch) {
      return { username: pageMatch[1], statusId: pageMatch[2] };
    }

    return null;
  }

  // Find the tweet's own action group [role="group"]
  function findActionGroup(article) {
    const groups = article.querySelectorAll('[role="group"]');
    for (const group of groups) {
      // Must belong directly to this article, not a nested article
      if (group.closest('article') === article) {
        // Confirm this is an action row (contains reply, retweet, like, or share)
        if (
          group.querySelector('[data-testid="reply"]') ||
          group.querySelector('[data-testid="retweet"]') ||
          group.querySelector('[data-testid="like"]') ||
          group.querySelector('[data-testid="share"]') ||
          group.querySelector('[data-testid="bookmark"]') ||
          group.querySelector('[aria-label*="Reply" i]') ||
          group.querySelector('[aria-label*="Share" i]')
        ) {
          return group;
        }
      }
    }
    return null;
  }

  // Create clean copy button element
  function createButton(postInfo, article) {
    const wrapper = document.createElement('div');
    wrapper.className = 'clean-copy-wrapper';
    wrapper.setAttribute('role', 'presentation');

    const button = document.createElement('button');
    button.className = 'clean-copy-btn';
    button.type = 'button';
    button.setAttribute('aria-label', 'Copy clean link');
    button.title = 'Copy clean link\n• Shift+Click: Copy embed link\n• Alt+Click: Copy Markdown format';

    button.innerHTML = `
      <div class="clean-copy-icon-container">
        ${ICONS.link}
        ${ICONS.check}
      </div>
    `;

    // Click handler
    let resetTimer = null;
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Dynamic re-extraction in case of SPA update
      const latestInfo = extractPostInfo(article) || postInfo;
      if (!latestInfo) return;

      // Determine domain & format based on modifiers
      let domain = config.domain || 'x.com';
      let format = config.format || 'url';

      if (e.shiftKey) {
        // Shift+Click: use shiftDomain (e.g. fixupx.com for Discord/Slack embeds)
        domain = config.shiftDomain || 'fixupx.com';
      }

      if (e.altKey) {
        // Alt+Click: force markdown format
        format = 'markdown';
      }

      const cleanUrl = `https://${domain}/${latestInfo.username}/status/${latestInfo.statusId}`;
      let textToCopy = cleanUrl;

      if (format === 'markdown') {
        textToCopy = `[Post by @${latestInfo.username}](${cleanUrl})`;
      }

      const success = await copyToClipboard(textToCopy);
      if (success) {
        // Visual button state
        button.classList.add('copied');
        button.setAttribute('aria-label', 'Link copied!');

        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          button.classList.remove('copied');
          button.setAttribute('aria-label', 'Copy clean link');
        }, 1800);

        // Toast feedback
        const label = format === 'markdown' ? 'Markdown copied:' : 'Clean link copied:';
        showToast(label, cleanUrl);
      }
    });

    wrapper.appendChild(button);
    return wrapper;
  }

  // Inject the button into a tweet article
  function injectButton(article) {
    if (article.dataset.cleanCopyInjected === 'true') return;

    const actionGroup = findActionGroup(article);
    if (!actionGroup) return;

    if (actionGroup.querySelector('.clean-copy-wrapper')) {
      article.dataset.cleanCopyInjected = 'true';
      return;
    }

    const postInfo = extractPostInfo(article);
    if (!postInfo) return;

    const btnWrapper = createButton(postInfo, article);

    // Locate the best position in the action row (before Share button or at end)
    const shareBtn = actionGroup.querySelector(
      '[data-testid="share"], [data-testid="share-action"], button[aria-label*="Share" i], [aria-label*="share" i]'
    );

    let targetChild = null;
    if (shareBtn) {
      let curr = shareBtn;
      while (curr && curr.parentElement !== actionGroup) {
        curr = curr.parentElement;
      }
      targetChild = curr;
    }

    if (targetChild && targetChild.parentElement === actionGroup) {
      actionGroup.insertBefore(btnWrapper, targetChild);
    } else {
      actionGroup.appendChild(btnWrapper);
    }

    article.dataset.cleanCopyInjected = 'true';
  }

  // Scan current DOM for tweets
  let isScanning = false;
  function scanTimeline() {
    if (isScanning) return;
    isScanning = true;

    requestAnimationFrame(() => {
      const articles = document.querySelectorAll('article[data-testid="tweet"], article[role="article"]');
      for (let i = 0; i < articles.length; i++) {
        injectButton(articles[i]);
      }
      isScanning = false;
    });
  }

  // Set up MutationObserver to handle dynamically added tweets during scrolling
  const observer = new MutationObserver((mutations) => {
    let hasNewNodes = false;
    for (let i = 0; i < mutations.length; i++) {
      const added = mutations[i].addedNodes;
      if (added && added.length > 0) {
        hasNewNodes = true;
        break;
      }
    }
    if (hasNewNodes) {
      scanTimeline();
    }
  });

  function init() {
    scanTimeline();

    // Observe body for timeline updates
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        scanTimeline();
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    }

    // Handle SPA navigation (History API and hash changes)
    let lastUrl = location.href;
    setInterval(() => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        scanTimeline();
      }
    }, 600);
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
