const { getAvailableThemes } = require("../src/themes");

module.exports = async (req, res) => {
  const themes = getAvailableThemes();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🏎️ F1 Lap Dashboard — Live Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; }
    h1 { font-size: 2rem; margin-bottom: 8px; background: linear-gradient(135deg, #e63946, #ff6b6b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { color: #8b949e; margin-bottom: 30px; }
    .controls { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; align-items: center; }
    input, select { background: #161b22; border: 1px solid #30363d; color: #c9d1d9; padding: 10px 14px; border-radius: 8px; font-size: 14px; }
    input:focus, select:focus { outline: none; border-color: #e63946; }
    button { background: #e63946; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; }
    button:hover { background: #ff6b6b; }
    .preview { margin: 20px 0; max-width: 900px; width: 100%; }
    .preview img { width: 100%; border-radius: 12px; }
    .code-block { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-top: 16px; max-width: 900px; width: 100%; font-family: 'Consolas', monospace; font-size: 13px; color: #79c0ff; word-break: break-all; position: relative; }
    .copy-btn { position: absolute; top: 8px; right: 8px; background: #30363d; border: none; color: #c9d1d9; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; }
    .copy-btn:hover { background: #e63946; }
    .footer { margin-top: 40px; color: #484f58; font-size: 12px; }
    a { color: #e63946; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>🏎️ F1 Lap Dashboard</h1>
  <p class="subtitle">Generate your GitHub stats as an F1 telemetry dashboard</p>

  <div class="controls">
    <input type="text" id="username" placeholder="GitHub username" value="shivanshu407" />
    <select id="theme">
      ${themes.map((t) => `<option value="${t}">${t}</option>`).join("")}
    </select>
    <label style="display:flex;align-items:center;gap:4px;color:#8b949e;font-size:13px;">
      <input type="checkbox" id="hideBorder" /> Hide border
    </label>
    <button onclick="generatePreview()">Generate 🏁</button>
  </div>

  <div class="preview" id="preview"></div>

  <div class="code-block" id="codeBlock" style="display:none;">
    <button class="copy-btn" onclick="copyCode()">Copy</button>
    <div id="codeContent"></div>
  </div>

  <div class="footer">
    Made with ❤️ by <a href="https://github.com/shivanshu407">@shivanshu407</a>
    · <a href="https://github.com/shivanshu407/F1-Lap-Dashboard">Star on GitHub ⭐</a>
  </div>

  <script>
    function generatePreview() {
      const u = document.getElementById('username').value.trim();
      const t = document.getElementById('theme').value;
      const hb = document.getElementById('hideBorder').checked;
      if (!u) return alert('Enter a GitHub username');
      const baseUrl = window.location.origin;
      const url = baseUrl + '/api/card?username=' + u + '&theme=' + t + (hb ? '&hide_border=true' : '');
      document.getElementById('preview').innerHTML = '<img src="' + url + '" alt="F1 Lap Dashboard" />';
      const md = '![F1 Lap Dashboard](' + url + ')';
      document.getElementById('codeContent').textContent = md;
      document.getElementById('codeBlock').style.display = 'block';
    }
    function copyCode() {
      navigator.clipboard.writeText(document.getElementById('codeContent').textContent);
      document.querySelector('.copy-btn').textContent = 'Copied!';
      setTimeout(() => document.querySelector('.copy-btn').textContent = 'Copy', 2000);
    }
    generatePreview();
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
};
