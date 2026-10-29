# Clean Link for X (Twitter)

A lightweight, zero-dependency browser extension for [x.com](https://x.com) and [twitter.com](https://twitter.com) that adds a dedicated **1-click Copy button** to every post, instantly copying clean links with **zero tracking or referral parameters** (`?s=...`, `&t=...`, `ref_src=...`, etc.).

---

## ✨ Features

- **⚡ 1-Click Copy**: Injects a clean copy button directly into each post's action bar (next to Reply, Repost, Like, Bookmark, and Share).
- **🛡️ Strips All Tracking Parameters**: Eliminates annoying telemetry parameters:
  - `?s=20`, `?s=46`, `?s=19`
  - `&t=...`
  - `ref_src=...`, `ref_url=...`
  - `utm_source=...`, `utm_medium=...`, `utm_campaign=...`
  - `fbclid=...`, `gclid=...`
- **🚀 Keyboard Shortcuts**:
  - **Normal Click**: Copies clean canonical link (e.g. `https://x.com/username/status/1234567890`).
  - **Shift + Click**: Copies embed-friendly link (e.g. `https://fixupx.com/...` or `fxtwitter.com` for perfect Discord, Slack, and Telegram video/photo embeds).
  - **Alt + Click**: Copies formatted Markdown link (`[Post by @username](https://x.com/...)`).
- **⚙️ Configurable via Popup**:
  - Choose default domain (`x.com`, `twitter.com`, `fixupx.com`, `fxtwitter.com`, `vxtwitter.com`).
  - Choose default format (Plain URL vs. Markdown).
  - Toggle toast notifications on/off.
- **🎨 100% Native Look & Feel**:
  - Matches X's exact SVG icon size, alignment, and circular hover backdrop.
  - Automatically adapts to X's Dark, Dim, and Light themes.
  - Smooth animation morphing the link icon into a green checkmark upon copying.
- **🪄 Native Share Sanitizer**:
  - Automatically intercepts and strips tracking tags even if you use X's built-in "Share → Copy link" menu!
- **⚡ High Performance & Low Overhead**:
  - Pure vanilla JavaScript & CSS.
  - MutationObserver debounced with `requestAnimationFrame` for stutter-free scrolling on infinite timelines.

---

## 📦 How to Install

### Chrome / Brave / Edge / Opera

1. Open your browser's extension settings:
   - **Chrome**: Navigate to `chrome://extensions`
   - **Brave**: Navigate to `brave://extensions`
   - **Edge**: Navigate to `edge://extensions`
2. Toggle on **Developer mode** (usually a switch in the top-right corner).
3. Click the **Load unpacked** button in the top-left corner.
4. Select this project directory (`/home/xozev/projects/x-copy-link-ext`).
5. Open [x.com](https://x.com) or refresh any open tabs to start using it!

### Mozilla Firefox

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select the `manifest.json` file inside this directory.

---

## 🛠️ Project Structure

```
x-copy-link-ext/
├── manifest.json       # Manifest V3 extension configuration
├── content.js          # Content script: DOM observer, button injection, click handler
├── content.css         # Button styling, animations, and toast notification
├── main-world.js       # Page context script: sanitizes native clipboard writes
├── popup.html          # Extension options popup UI
├── popup.css           # Modern dark UI for options popup
├── popup.js            # Settings controller and live URL preview
└── icons/              # Extension icons in 16x16, 32x32, 48x48, and 128x128
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## 💡 Keyboard Modifiers

| Action | Result |
| :--- | :--- |
| **Click** | Copies `https://x.com/user/status/12345` (or configured default) |
| **Shift + Click** | Copies `https://fixupx.com/user/status/12345` (ideal for Discord/Telegram/Slack) |
| **Alt + Click** | Copies `[Post by @user](https://x.com/user/status/12345)` |
# x-copy-clean-link
