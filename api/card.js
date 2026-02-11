const { fetchGitHubData } = require("../src/fetcher");
const { generateSVG } = require("../src/svg-generator");
const { getAvailableThemes } = require("../src/themes");

module.exports = async (req, res) => {
  const {
    username,
    theme = "dark",
    hide_border = "false",
    hide_gear = "false",
    cache_seconds,
  } = req.query;

  // --- Validation ---
  if (!username) {
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(400).send(generateErrorSVG("Missing ?username= parameter"));
    return;
  }

  try {
    const token = process.env.GITHUB_TOKEN || process.env.PAT_1;
    const data = await fetchGitHubData(username, token);

    const svg = generateSVG(data, {
      theme,
      hide_border,
      hide_gear,
    });

    // --- Caching ---
    // Default: 120s (2 min) for near real-time updates
    // Min: 60s, Max: 86400s (24h)
    const cacheSeconds = Math.min(
      Math.max(parseInt(cache_seconds) || 120, 60),
      86400
    );
    res.setHeader(
      "Cache-Control",
      `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=60`
    );
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  } catch (error) {
    console.error("Error generating card:", error);
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(500).send(
      generateErrorSVG(error.message || "Something went wrong")
    );
  }
};

function generateErrorSVG(message) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="120" viewBox="0 0 500 120">
  <rect width="500" height="120" rx="12" fill="#0d1117" stroke="#e63946" stroke-width="2" />
  <text x="250" y="40" text-anchor="middle" fill="#e63946" font-family="'Segoe UI', sans-serif" font-weight="bold" font-size="16">🏎️ F1 Lap Dashboard — Error</text>
  <text x="250" y="70" text-anchor="middle" fill="#c9d1d9" font-family="'Consolas', monospace" font-size="12">${escapeXml(message)}</text>
  <text x="250" y="100" text-anchor="middle" fill="#8b949e" font-family="'Segoe UI', sans-serif" font-size="10">Available themes: ${getAvailableThemes().join(", ")}</text>
</svg>`.trim();
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
