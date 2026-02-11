const { getTheme } = require("./themes");

/**
 * Generates the F1 Telemetry Dashboard SVG.
 *
 * Layout:
 *   Row 1: Header (driver name, username, seasons, streak badge)
 *   Row 2: Speedometer (cm/d) | Gear | Lap Times (fastest + recent)
 *   Row 3: Tire Wear | DRS | Stats bar
 *   Row 4: Mini Telemetry chart
 */
function generateSVG(data, options = {}) {
  const theme = getTheme(options.theme || "dark");
  const hideBorder = options.hide_border === "true";
  const hideGear = options.hide_gear === "true";
  const width = 850;
  const height = 395;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    ${renderDefs(theme)}
  </defs>
  <style>
    ${renderCSS(theme)}
  </style>

  <!-- Background -->
  <rect width="${width}" height="${height}" rx="${hideBorder ? 0 : 12}" fill="${theme.bg}" ${hideBorder ? "" : `stroke="${theme.border}" stroke-width="1.5"`} />

  <!-- Carbon fiber pattern overlay -->
  <rect width="${width}" height="${height}" rx="${hideBorder ? 0 : 12}" fill="url(#carbonPattern)" opacity="0.03" />

  <!-- Top accent stripe -->
  <rect x="0" y="0" width="${width}" height="4" rx="0" fill="url(#topStripe)" ${hideBorder ? "" : 'clip-path="inset(0 round 12px 12px 0 0)"'} />

  <!-- Header -->
  ${renderHeader(data, theme)}

  <!-- Speedometer (cm/d — commits today) -->
  ${renderSpeedometer(data, theme)}

  <!-- Gear Indicator -->
  ${hideGear ? "" : renderGearIndicator(data, theme)}

  <!-- Lap Time Panel (fastest + recent) -->
  ${renderLapTimePanel(data, theme)}

  <!-- Tire Wear -->
  ${renderTireWear(data, theme)}

  <!-- DRS Indicator -->
  ${renderDRSIndicator(data, theme)}

  <!-- Stats Bar -->
  ${renderStatsBar(data, theme)}

  <!-- Mini Telemetry Chart -->
  ${renderMiniTelemetry(data, theme)}

</svg>`.trim();
}

// ─── DEFS ──────────────────────────────────────────────────────
function renderDefs(theme) {
  return `
    <linearGradient id="topStripe" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.gradientStart}" />
      <stop offset="100%" stop-color="${theme.gradientEnd}" />
    </linearGradient>

    <linearGradient id="speedGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00cc44" />
      <stop offset="50%" stop-color="#ffcc00" />
      <stop offset="100%" stop-color="#ff2200" />
    </linearGradient>

    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="glowStrong">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <pattern id="carbonPattern" patternUnits="userSpaceOnUse" width="4" height="4">
      <rect width="4" height="4" fill="${theme.bgSecondary}" />
      <rect width="2" height="2" fill="${theme.bgPanel}" />
      <rect x="2" y="2" width="2" height="2" fill="${theme.bgPanel}" />
    </pattern>

    <clipPath id="roundedCard">
      <rect width="850" height="395" rx="12" />
    </clipPath>
  `;
}

// ─── CSS ───────────────────────────────────────────────────────
function renderCSS(theme) {
  return `
    @keyframes speedPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes drsBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes gearShift {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes barGrow {
      0% { width: 0; }
    }

    .title { font: bold 14px 'Segoe UI', Ubuntu, Helvetica, Arial, sans-serif; fill: ${theme.title}; }
    .label { font: 600 10px 'Segoe UI', Ubuntu, Helvetica, Arial, sans-serif; fill: ${theme.textSecondary}; text-transform: uppercase; letter-spacing: 1.2px; }
    .value { font: bold 13px 'Consolas', 'Courier New', monospace; fill: ${theme.text}; }
    .value-lg { font: bold 22px 'Consolas', 'Courier New', monospace; fill: ${theme.speed}; }
    .value-xl { font: bold 56px 'Consolas', 'Courier New', monospace; fill: ${theme.gear}; }
    .unit { font: 600 9px 'Segoe UI', Ubuntu, Helvetica, Arial, sans-serif; fill: ${theme.textSecondary}; }
    .speed-val { font: bold 38px 'Consolas', 'Courier New', monospace; fill: ${theme.speed}; filter: url(#glow); animation: speedPulse 2s ease-in-out infinite; }
    .lap-time { font: bold 18px 'Consolas', 'Courier New', monospace; fill: ${theme.text}; }
    .lap-time-fastest { font: bold 18px 'Consolas', 'Courier New', monospace; fill: ${theme.sectorBest || theme.accent}; filter: url(#glow); }
    .drs-active { fill: ${theme.drsActive}; animation: drsBlink 1s ease-in-out infinite; }
    .drs-inactive { fill: ${theme.drsInactive}; }
    .panel { fill: ${theme.bgPanel}; rx: 8; }
    .stat-label { font: 500 9px 'Segoe UI', Ubuntu, Helvetica, Arial, sans-serif; fill: ${theme.textSecondary}; }
    .stat-value { font: bold 12px 'Consolas', 'Courier New', monospace; fill: ${theme.text}; }
    .animate-fade { animation: fadeInUp 0.6s ease-out both; }
    .animate-fade-d1 { animation: fadeInUp 0.6s ease-out 0.1s both; }
    .animate-fade-d2 { animation: fadeInUp 0.6s ease-out 0.2s both; }
    .animate-fade-d3 { animation: fadeInUp 0.6s ease-out 0.3s both; }
    .animate-fade-d4 { animation: fadeInUp 0.6s ease-out 0.4s both; }
  `;
}

// ─── HEADER ────────────────────────────────────────────────────
function renderHeader(data, theme) {
  return `
    <g class="animate-fade">
      <!-- Driver name -->
      <text x="24" y="30" class="title" style="font-size:15px;">${escapeXml(data.name)}</text>
      <text x="24" y="44" class="label" style="font-size:9px;letter-spacing:1.5px;">@${escapeXml(data.username)} · ${data.accountAgeYears} SEASONS</text>

      <!-- Streak badge (top-right) -->
      <rect x="710" y="14" width="126" height="30" rx="6" fill="${theme.accent}22" stroke="${theme.accent}" stroke-width="0.5" />
      <text x="773" y="34" text-anchor="middle" style="font:bold 12px 'Consolas',monospace;fill:${theme.accent};">${data.streak}🔥 ${data.streak}-DAY STREAK</text>
    </g>
  `;
}

// ─── SPEEDOMETER ───────────────────────────────────────────────
function renderSpeedometer(data, theme) {
  const cx = 170;
  const cy = 175;
  const r = 90;
  const startAngle = -225;
  const endAngle = 45;
  const totalAngle = endAngle - startAngle; // 270 degrees
  const speedFraction = data.speedFraction;
  const activeAngle = startAngle + totalAngle * speedFraction;

  const trackPath = describeArc(cx, cy, r, startAngle, endAngle);
  const activePath = describeArc(cx, cy, r, startAngle, activeAngle);

  // Major tick marks (0 to 50)
  const maxGauge = 50;
  const majorSteps = 5;
  const ticks = [];
  for (let i = 0; i <= majorSteps; i++) {
    const angle = startAngle + (totalAngle / majorSteps) * i;
    const rad = (angle * Math.PI) / 180;
    const innerR = r - 10;
    const outerR = r + 2;
    const x1 = cx + innerR * Math.cos(rad);
    const y1 = cy + innerR * Math.sin(rad);
    const x2 = cx + outerR * Math.cos(rad);
    const y2 = cy + outerR * Math.sin(rad);
    const labelR = r - 22;
    const lx = cx + labelR * Math.cos(rad);
    const ly = cy + labelR * Math.sin(rad);
    const speedLabel = Math.round((maxGauge / majorSteps) * i);
    ticks.push(`
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${theme.textSecondary}" stroke-width="2" />
      <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" style="font:600 7px 'Consolas',monospace;fill:${theme.textSecondary};">${speedLabel}</text>
    `);
  }

  // Minor ticks
  for (let i = 0; i <= 25; i++) {
    const angle = startAngle + (totalAngle / 25) * i;
    const rad = (angle * Math.PI) / 180;
    const innerR = r - 4;
    const outerR = r + 1;
    const x1 = cx + innerR * Math.cos(rad);
    const y1 = cy + innerR * Math.sin(rad);
    const x2 = cx + outerR * Math.cos(rad);
    const y2 = cy + outerR * Math.sin(rad);
    ticks.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${theme.gridLine}" stroke-width="1" />`
    );
  }

  return `
    <g class="animate-fade-d1">
      <!-- Speedometer background -->
      <rect x="${cx - 112}" y="55" width="224" height="215" rx="10" fill="${theme.bgPanel}" opacity="0.5" />

      <!-- Label -->
      <text x="${cx}" y="73" text-anchor="middle" class="label">COMMITS TODAY</text>

      <!-- Gauge track -->
      <path d="${trackPath}" fill="none" stroke="${theme.gaugeTrack}" stroke-width="12" stroke-linecap="round" />

      <!-- Active gauge -->
      <path d="${activePath}" fill="none" stroke="url(#speedGradient)" stroke-width="12" stroke-linecap="round" filter="url(#glow)" />

      <!-- Tick marks -->
      ${ticks.join("")}

      <!-- Speed value — raw commit count -->
      <text x="${cx}" y="${cy + 8}" text-anchor="middle" class="speed-val">${data.speed}</text>
      <text x="${cx}" y="${cy + 26}" text-anchor="middle" class="unit" style="font-size:10px;">cm/d</text>

      <!-- Year total below -->
      <text x="${cx}" y="${cy + 78}" text-anchor="middle" class="stat-label">${data.hasGraphQL ? data.yearTotalContributions + " THIS YEAR" : ""}</text>
    </g>
  `;
}

// ─── GEAR INDICATOR ────────────────────────────────────────────
function renderGearIndicator(data, theme) {
  return `
    <g class="animate-fade-d2">
      <rect x="290" y="88" width="60" height="75" rx="8" fill="${theme.bgPanel}" stroke="${theme.border}" stroke-width="1" />
      <text x="320" y="106" text-anchor="middle" class="label" style="font-size:8px;">GEAR</text>
      <text x="320" y="150" text-anchor="middle" class="value-xl" style="fill:${theme.speed};filter:url(#glow);">${data.gear}</text>
    </g>
  `;
}

// ─── LAP TIME ──────────────────────────────────────────────────
function renderLapTimePanel(data, theme) {
  return `
    <g class="animate-fade-d2">
      <rect x="290" y="172" width="200" height="98" rx="8" fill="${theme.bgPanel}" stroke="${theme.border}" stroke-width="1" />

      <!-- Fastest Lap -->
      <text x="300" y="192" class="label" style="font-size:8px;">⚡ FASTEST LAP</text>
      <text x="300" y="214" class="lap-time-fastest">${data.fastestLap}</text>

      <!-- Divider -->
      <line x1="300" y1="222" x2="480" y2="222" stroke="${theme.border}" stroke-width="0.5" opacity="0.4" />

      <!-- Recent Lap -->
      <text x="300" y="240" class="label" style="font-size:8px;">🏁 RECENT LAP</text>
      <text x="300" y="262" class="lap-time">${data.recentLap}</text>
    </g>
  `;
}

// ─── TIRE WEAR ─────────────────────────────────────────────────
function renderTireWear(data, theme) {
  const wear = data.tireWear;

  const tires = [
    { label: "FL", x: 520, y: 63, wear: Math.min(100, wear + 5) },
    { label: "FR", x: 580, y: 63, wear: Math.min(100, wear + 2) },
    { label: "RL", x: 520, y: 115, wear: Math.max(0, wear - 3) },
    { label: "RR", x: 580, y: 115, wear: Math.max(0, wear - 8) },
  ];

  const tireElements = tires
    .map((t) => {
      const fillH = (32 * t.wear) / 100;
      const tColor =
        t.wear > 70 ? "#00cc44" : t.wear > 40 ? "#ffcc00" : "#ff3333";
      return `
      <g>
        <rect x="${t.x}" y="${t.y}" width="40" height="38" rx="6" fill="${theme.bgSecondary}" stroke="${theme.border}" stroke-width="0.5" />
        <rect x="${t.x + 4}" y="${t.y + 3 + (32 - fillH)}" width="32" height="${fillH}" rx="3" fill="${tColor}" opacity="0.3" />
        <text x="${t.x + 20}" y="${t.y + 16}" text-anchor="middle" class="label" style="font-size:7px;">${t.label}</text>
        <text x="${t.x + 20}" y="${t.y + 30}" text-anchor="middle" style="font:bold 10px 'Consolas',monospace;fill:${tColor};">${t.wear}%</text>
      </g>
    `;
    })
    .join("");

  return `
    <g class="animate-fade-d2">
      <rect x="510" y="48" width="120" height="118" rx="8" fill="${theme.bgPanel}" opacity="0.5" />
      <text x="570" y="61" text-anchor="middle" class="label" style="font-size:8px;">TIRE WEAR (PR MERGE RATE)</text>
      ${tireElements}
    </g>
  `;
}

// ─── DRS ───────────────────────────────────────────────────────
function renderDRSIndicator(data, theme) {
  const active = data.drsActive;
  return `
    <g class="animate-fade-d3">
      <rect x="645" y="48" width="100" height="118" rx="8" fill="${theme.bgPanel}" opacity="0.5" />
      <text x="695" y="66" text-anchor="middle" class="label" style="font-size:8px;">DRS</text>

      <!-- DRS Zone indicator -->
      <rect x="660" y="75" width="70" height="28" rx="6" fill="${active ? theme.drsActive : theme.drsInactive}" opacity="${active ? 1 : 0.4}" ${active ? 'class="drs-active"' : ""} />
      <text x="695" y="94" text-anchor="middle" style="font:bold 12px 'Segoe UI',sans-serif;fill:${active ? theme.bg : theme.textSecondary};">${active ? "OPEN" : "CLOSED"}</text>

      <!-- Threshold label -->
      <text x="695" y="120" text-anchor="middle" class="stat-label" style="font-size:7px;">${active ? "5+ COMMITS TODAY" : "NEED 5+ COMMITS"}</text>

      <!-- Commit count badge -->
      <rect x="672" y="132" width="46" height="16" rx="4" fill="${active ? theme.accent + "33" : theme.bgSecondary}" />
      <text x="695" y="144" text-anchor="middle" style="font:bold 9px 'Consolas',monospace;fill:${active ? theme.accent : theme.textSecondary};">${data.todayCommits}/5</text>
    </g>
  `;
}

// ─── STATS BAR ─────────────────────────────────────────────────
function renderStatsBar(data, theme) {
  const stats = [
    { label: "STARS", value: data.totalStars },
    { label: "FORKS", value: data.totalForks },
    { label: "REPOS", value: data.publicRepos },
    { label: "FOLLOWERS", value: data.followers },
  ];

  const barWidth = 340;
  const itemW = barWidth / stats.length;

  const items = stats
    .map((s, i) => {
      const x = 510 + i * itemW;
      return `
      <g>
        <text x="${x + 8}" y="195" class="stat-label">${s.label}</text>
        <text x="${x + 8}" y="212" class="stat-value" style="fill:${theme.accent};">${formatNumber(s.value)}</text>
      </g>
    `;
    })
    .join("");

  return `
    <g class="animate-fade-d3">
      <rect x="500" y="175" width="${barWidth + 10}" height="46" rx="8" fill="${theme.bgPanel}" opacity="0.4" />
      ${items}
    </g>
  `;
}

// ─── MINI TELEMETRY CHART ──────────────────────────────────────
function renderMiniTelemetry(data, theme) {
  const chartX = 25;
  const chartY = 290;
  const chartW = 800;
  const chartH = 70;

  const hours = data.hourDistribution;
  const maxH = Math.max(...hours, 1);

  const points = hours.map((val, i) => {
    const x = chartX + (i / 23) * chartW;
    const y = chartY + chartH - (val / maxH) * chartH;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const fillPoints = `${chartX},${chartY + chartH} ${polyline} ${chartX + chartW},${chartY + chartH}`;

  const hourLabels = [0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
    const x = chartX + (h / 23) * chartW;
    return `<text x="${x}" y="${chartY + chartH + 14}" text-anchor="middle" style="font:500 7px 'Consolas',monospace;fill:${theme.textSecondary};">${String(h).padStart(2, "0")}:00</text>`;
  });

  const gridLines = [0, 6, 12, 18].map((h) => {
    const x = chartX + (h / 23) * chartW;
    return `<line x1="${x}" y1="${chartY}" x2="${x}" y2="${chartY + chartH}" stroke="${theme.gridLine}" stroke-width="0.5" stroke-dasharray="3,3" />`;
  });

  return `
    <g class="animate-fade-d4">
      <rect x="15" y="${chartY - 18}" width="${chartW + 20}" height="${chartH + 42}" rx="8" fill="${theme.bgPanel}" opacity="0.3" />

      <text x="25" y="${chartY - 4}" class="label" style="font-size:8px;">TELEMETRY · COMMIT TIME DISTRIBUTION (UTC)</text>

      ${gridLines.join("")}

      <polygon points="${fillPoints}" fill="${theme.accent}" opacity="0.08" />

      <polyline points="${polyline}" fill="none" stroke="${theme.accent}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" filter="url(#glow)" />

      ${hours
        .map((val, i) => {
          if (val === 0) return "";
          const x = chartX + (i / 23) * chartW;
          const y = chartY + chartH - (val / maxH) * chartH;
          return `<circle cx="${x}" cy="${y}" r="2.5" fill="${theme.accent}" opacity="0.8" />`;
        })
        .join("")}

      ${hourLabels.join("")}

      ${(() => {
        const peakHour = hours.indexOf(Math.max(...hours));
        if (Math.max(...hours) === 0) return "";
        const px = chartX + (peakHour / 23) * chartW;
        const py = chartY + chartH - (hours[peakHour] / maxH) * chartH;
        return `
          <circle cx="${px}" cy="${py}" r="4" fill="${theme.accent}" filter="url(#glowStrong)" />
          <text x="${px}" y="${py - 8}" text-anchor="middle" style="font:bold 7px 'Consolas',monospace;fill:${theme.accent};">PEAK ${String(peakHour).padStart(2, "0")}:00</text>
        `;
      })()}
    </g>
  `;
}

// ─── HELPERS ───────────────────────────────────────────────────
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function formatNumber(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return String(num);
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

module.exports = { generateSVG };
