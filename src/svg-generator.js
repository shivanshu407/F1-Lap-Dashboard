const { getTheme } = require("./themes");

/**
 * Generates the full F1 Telemetry Dashboard SVG.
 */
function generateSVG(data, options = {}) {
  const theme = getTheme(options.theme || "dark");
  const hideBorder = options.hide_border === "true";
  const hideGear = options.hide_gear === "true";
  const width = 850;
  const height = 420;

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

  <!-- Top red accent stripe -->
  <rect x="0" y="0" width="${width}" height="4" rx="0" fill="url(#topStripe)" ${hideBorder ? "" : 'clip-path="inset(0 round 12px 12px 0 0)"'} />

  <!-- Header Panel -->
  ${renderHeader(data, theme)}

  <!-- Speedometer (Center piece) -->
  ${renderSpeedometer(data, theme)}

  <!-- Gear Indicator -->
  ${hideGear ? "" : renderGearIndicator(data, theme)}

  <!-- Lap Time Panel -->
  ${renderLapTimePanel(data, theme)}

  <!-- Sector Times -->
  ${renderSectorTimes(data, theme)}

  <!-- Tire Wear -->
  ${renderTireWear(data, theme)}

  <!-- ERS Bar -->
  ${renderERSBar(data, theme)}

  <!-- Fuel Gauge -->
  ${renderFuelGauge(data, theme)}

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

    <linearGradient id="ersGradient" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.ersColor}" />
      <stop offset="100%" stop-color="${theme.ersColor}99" />
    </linearGradient>

    <linearGradient id="fuelGradient" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="${theme.fuelColor}" />
      <stop offset="100%" stop-color="${theme.fuelColor}66" />
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
      <rect width="850" height="420" rx="12" />
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
    @keyframes dashScroll {
      0% { stroke-dashoffset: 8; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes needleSweep {
      0% { transform: rotate(-135deg); }
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
    .lap-time { font: bold 20px 'Consolas', 'Courier New', monospace; fill: ${theme.text}; }
    .sector-best { fill: ${theme.sectorBest}; }
    .sector-personal { fill: ${theme.sectorPersonal}; }
    .sector-normal { fill: ${theme.sectorNormal}; }
    .drs-active { fill: ${theme.drsActive}; animation: drsBlink 1s ease-in-out infinite; }
    .drs-inactive { fill: ${theme.drsInactive}; }
    .panel { fill: ${theme.bgPanel}; rx: 8; }
    .stat-label { font: 500 9px 'Segoe UI', Ubuntu, Helvetica, Arial, sans-serif; fill: ${theme.textSecondary}; }
    .stat-value { font: bold 12px 'Consolas', 'Courier New', monospace; fill: ${theme.text}; }
    .position { font: bold 28px 'Consolas', 'Courier New', monospace; fill: ${theme.accent}; }
    .position-label { font: 600 8px 'Segoe UI', Ubuntu, Helvetica, Arial, sans-serif; fill: ${theme.textSecondary}; text-transform: uppercase; letter-spacing: 1px; }
    .animate-fade { animation: fadeInUp 0.6s ease-out both; }
    .animate-fade-d1 { animation: fadeInUp 0.6s ease-out 0.1s both; }
    .animate-fade-d2 { animation: fadeInUp 0.6s ease-out 0.2s both; }
    .animate-fade-d3 { animation: fadeInUp 0.6s ease-out 0.3s both; }
    .animate-fade-d4 { animation: fadeInUp 0.6s ease-out 0.4s both; }
  `;
}

// ─── HEADER ────────────────────────────────────────────────────
function renderHeader(data, theme) {
  const positionSuffix = getOrdinalSuffix(data.position);
  return `
    <g class="animate-fade">
      <!-- Position badge -->
      <rect x="20" y="16" width="52" height="34" rx="6" fill="${theme.accent}" />
      <text x="46" y="32" text-anchor="middle" class="position" style="fill:#fff;font-size:18px;">P${data.position}</text>

      <!-- Driver name -->
      <text x="82" y="30" class="title" style="font-size:15px;">${escapeXml(data.name)}</text>
      <text x="82" y="44" class="label" style="font-size:9px;letter-spacing:1.5px;">@${escapeXml(data.username)} · ${data.accountAgeYears} SEASONS</text>

      <!-- Interval / Gap indicator -->
      <text x="${830}" y="30" text-anchor="end" class="label" style="font-size:8px;">INTERVAL</text>
      <text x="${830}" y="44" text-anchor="end" class="value" style="fill:${theme.accent};font-size:12px;">+${(data.position * 0.847).toFixed(3)}s</text>
    </g>
  `;
}

// ─── SPEEDOMETER ───────────────────────────────────────────────
function renderSpeedometer(data, theme) {
  const cx = 190;
  const cy = 185;
  const r = 95;
  const startAngle = -225;
  const endAngle = 45;
  const totalAngle = endAngle - startAngle; // 270 degrees
  const speedFraction = data.speed / 350;
  const activeAngle = startAngle + totalAngle * speedFraction;

  // Build arc segments for the gauge track
  const trackPath = describeArc(cx, cy, r, startAngle, endAngle);
  const activePath = describeArc(cx, cy, r, startAngle, activeAngle);

  // Tick marks
  const ticks = [];
  for (let i = 0; i <= 7; i++) {
    const angle = startAngle + (totalAngle / 7) * i;
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
    const speedLabel = Math.round((350 / 7) * i);
    ticks.push(`
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${theme.textSecondary}" stroke-width="2" />
      <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" style="font:600 7px 'Consolas',monospace;fill:${theme.textSecondary};">${speedLabel}</text>
    `);
  }

  // Minor ticks
  for (let i = 0; i <= 35; i++) {
    const angle = startAngle + (totalAngle / 35) * i;
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
      <rect x="${cx - 118}" y="60" width="236" height="225" rx="10" fill="${theme.bgPanel}" opacity="0.5" />

      <!-- Label -->
      <text x="${cx}" y="78" text-anchor="middle" class="label">COMMIT VELOCITY</text>

      <!-- Gauge track -->
      <path d="${trackPath}" fill="none" stroke="${theme.gaugeTrack}" stroke-width="12" stroke-linecap="round" />

      <!-- Active gauge -->
      <path d="${activePath}" fill="none" stroke="url(#speedGradient)" stroke-width="12" stroke-linecap="round" filter="url(#glow)" />

      <!-- Tick marks -->
      ${ticks.join("")}

      <!-- Speed value -->
      <text x="${cx}" y="${cy + 8}" text-anchor="middle" class="speed-val">${data.speed}</text>
      <text x="${cx}" y="${cy + 26}" text-anchor="middle" class="unit" style="font-size:10px;">KM/H</text>

      <!-- Commits label below -->
      <text x="${cx}" y="${cy + 82}" text-anchor="middle" class="stat-label">${data.totalRecentCommits} COMMITS (RECENT)</text>
    </g>
  `;
}

// ─── GEAR INDICATOR ────────────────────────────────────────────
function renderGearIndicator(data, theme) {
  return `
    <g class="animate-fade-d2">
      <rect x="310" y="95" width="60" height="75" rx="8" fill="${theme.bgPanel}" stroke="${theme.border}" stroke-width="1" />
      <text x="340" y="113" text-anchor="middle" class="label" style="font-size:8px;">GEAR</text>
      <text x="340" y="157" text-anchor="middle" class="value-xl" style="fill:${theme.speed};filter:url(#glow);">${data.gear}</text>
    </g>
  `;
}

// ─── LAP TIME ──────────────────────────────────────────────────
function renderLapTimePanel(data, theme) {
  return `
    <g class="animate-fade-d2">
      <rect x="310" y="180" width="160" height="60" rx="8" fill="${theme.bgPanel}" stroke="${theme.border}" stroke-width="1" />
      <text x="320" y="198" class="label" style="font-size:8px;">LAP TIME</text>
      <text x="320" y="225" class="lap-time" filter="url(#glow)">${data.lapTime}</text>

      <!-- Streak badge -->
      <rect x="420" y="188" width="42" height="18" rx="4" fill="${theme.accent}22" stroke="${theme.accent}" stroke-width="0.5" />
      <text x="441" y="200" text-anchor="middle" style="font:bold 8px 'Consolas',monospace;fill:${theme.accent};">${data.streak}🔥</text>

      <text x="320" y="235" class="stat-label">${data.streak}-DAY STREAK · CURRENT LAP</text>
    </g>
  `;
}

// ─── SECTOR TIMES ──────────────────────────────────────────────
function renderSectorTimes(data, theme) {
  const sectors = [
    { label: "S1", time: data.sector1, class: "sector-best" },
    { label: "S2", time: data.sector2, class: "sector-personal" },
    { label: "S3", time: data.sector3, class: "sector-normal" },
  ];

  const sectorItems = sectors
    .map((s, i) => {
      const x = 310 + i * 54;
      return `
      <g>
        <rect x="${x}" y="250" width="50" height="38" rx="4" fill="${theme.bgSecondary}" stroke="${theme.border}" stroke-width="0.5" />
        <text x="${x + 25}" y="263" text-anchor="middle" class="label" style="font-size:7px;">${s.label}</text>
        <text x="${x + 25}" y="280" text-anchor="middle" class="${s.class}" style="font:bold 10px 'Consolas',monospace;">${s.time}</text>
      </g>
    `;
    })
    .join("");

  return `
    <g class="animate-fade-d3">
      ${sectorItems}
    </g>
  `;
}

// ─── TIRE WEAR ─────────────────────────────────────────────────
function renderTireWear(data, theme) {
  const wear = data.tireWear;
  const tireColor =
    wear > 70 ? "#00cc44" : wear > 40 ? "#ffcc00" : "#ff3333";

  // 4 tire indicators
  const tires = [
    { label: "FL", x: 515, y: 68, wear: Math.min(100, wear + 5) },
    { label: "FR", x: 575, y: 68, wear: Math.min(100, wear + 2) },
    { label: "RL", x: 515, y: 120, wear: Math.max(0, wear - 3) },
    { label: "RR", x: 575, y: 120, wear: Math.max(0, wear - 8) },
  ];

  const tireElements = tires
    .map((t) => {
      const fillH = (32 * t.wear) / 100;
      const tColor =
        t.wear > 70 ? "#00cc44" : t.wear > 40 ? "#ffcc00" : "#ff3333";
      return `
      <g>
        <rect x="${t.x}" y="${t.y}" width="40" height="38" rx="6" fill="${theme.bgSecondary}" stroke="${theme.border}" stroke-width="0.5" />
        <!-- Wear fill from bottom -->
        <rect x="${t.x + 4}" y="${t.y + 3 + (32 - fillH)}" width="32" height="${fillH}" rx="3" fill="${tColor}" opacity="0.3" />
        <text x="${t.x + 20}" y="${t.y + 16}" text-anchor="middle" class="label" style="font-size:7px;">${t.label}</text>
        <text x="${t.x + 20}" y="${t.y + 30}" text-anchor="middle" style="font:bold 10px 'Consolas',monospace;fill:${tColor};">${t.wear}%</text>
      </g>
    `;
    })
    .join("");

  return `
    <g class="animate-fade-d2">
      <rect x="505" y="53" width="120" height="118" rx="8" fill="${theme.bgPanel}" opacity="0.5" />
      <text x="565" y="66" text-anchor="middle" class="label" style="font-size:8px;">TIRE WEAR (PR MERGE RATE)</text>
      ${tireElements}
    </g>
  `;
}

// ─── ERS BAR ───────────────────────────────────────────────────
function renderERSBar(data, theme) {
  const barWidth = 200;
  const filled = (barWidth * data.ersEnergy) / 100;
  const segments = 20;
  const segWidth = barWidth / segments;

  const segmentBars = [];
  for (let i = 0; i < segments; i++) {
    const x = 640 + i * segWidth;
    const active = i < Math.ceil((segments * data.ersEnergy) / 100);
    segmentBars.push(
      `<rect x="${x}" y="72" width="${segWidth - 1.5}" height="16" rx="1.5" fill="${active ? theme.ersColor : theme.gaugeTrack}" opacity="${active ? 0.9 : 0.4}" />`
    );
  }

  return `
    <g class="animate-fade-d2">
      <rect x="630" y="53" width="210" height="50" rx="8" fill="${theme.bgPanel}" opacity="0.5" />
      <text x="640" y="66" class="label" style="font-size:8px;">ERS DEPLOY (ACTIVITY BURST)</text>
      ${segmentBars.join("")}
      <text x="835" y="85" text-anchor="end" style="font:bold 9px 'Consolas',monospace;fill:${theme.ersColor};">${data.ersEnergy}%</text>
    </g>
  `;
}

// ─── FUEL GAUGE ────────────────────────────────────────────────
function renderFuelGauge(data, theme) {
  const barHeight = 90;
  const filledH = (barHeight * data.fuelLevel) / 100;

  return `
    <g class="animate-fade-d3">
      <rect x="640" y="110" width="50" height="118" rx="8" fill="${theme.bgPanel}" opacity="0.5" />
      <text x="665" y="126" text-anchor="middle" class="label" style="font-size:7px;">FUEL</text>

      <!-- Fuel bar track -->
      <rect x="652" y="132" width="26" height="${barHeight}" rx="4" fill="${theme.gaugeTrack}" />
      <!-- Fuel bar fill -->
      <rect x="652" y="${132 + (barHeight - filledH)}" width="26" height="${filledH}" rx="4" fill="url(#fuelGradient)" />

      <text x="665" y="230" text-anchor="middle" style="font:bold 10px 'Consolas',monospace;fill:${theme.fuelColor};">${data.fuelLevel}%</text>
      <text x="665" y="225" text-anchor="middle" class="stat-label" style="font-size:6px;">REPOS</text>
    </g>
  `;
}

// ─── DRS ───────────────────────────────────────────────────────
function renderDRSIndicator(data, theme) {
  const active = data.drsActive;
  return `
    <g class="animate-fade-d3">
      <rect x="700" y="110" width="60" height="45" rx="8" fill="${theme.bgPanel}" opacity="0.5" />
      <text x="730" y="125" text-anchor="middle" class="label" style="font-size:7px;">DRS</text>
      <rect x="710" y="130" width="40" height="18" rx="4" fill="${active ? theme.drsActive : theme.drsInactive}" opacity="${active ? 1 : 0.5}" ${active ? 'class="drs-active"' : ""} />
      <text x="730" y="143" text-anchor="middle" style="font:bold 9px 'Segoe UI',sans-serif;fill:${active ? theme.bg : theme.textSecondary};">${active ? "OPEN" : "OFF"}</text>
    </g>
  `;
}

// ─── STATS BAR ─────────────────────────────────────────────────
function renderStatsBar(data, theme) {
  const stats = [
    { icon: "★", label: "STARS", value: data.totalStars },
    { icon: "⑂", label: "FORKS", value: data.totalForks },
    { icon: "📦", label: "REPOS", value: data.publicRepos },
    { icon: "👥", label: "FOLLOWERS", value: data.followers },
  ];

  const items = stats
    .map((s, i) => {
      const x = 510 + i * 84;
      return `
      <g>
        <text x="${x}" y="260" class="stat-label">${s.label}</text>
        <text x="${x}" y="278" class="stat-value" style="fill:${theme.accent};">${formatNumber(s.value)}</text>
      </g>
    `;
    })
    .join("");

  return `
    <g class="animate-fade-d3">
      <rect x="500" y="245" width="340" height="46" rx="8" fill="${theme.bgPanel}" opacity="0.4" />
      ${items}
    </g>
  `;
}

// ─── MINI TELEMETRY CHART ──────────────────────────────────────
function renderMiniTelemetry(data, theme) {
  const chartX = 25;
  const chartY = 310;
  const chartW = 800;
  const chartH = 80;

  // Use hour distribution to draw a telemetry-style trace
  const hours = data.hourDistribution;
  const maxH = Math.max(...hours, 1);

  // Generate smooth points
  const points = hours.map((val, i) => {
    const x = chartX + (i / 23) * chartW;
    const y = chartY + chartH - (val / maxH) * chartH;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  // Fill area
  const fillPoints = `${chartX},${chartY + chartH} ${polyline} ${chartX + chartW},${chartY + chartH}`;

  // Hour labels
  const hourLabels = [0, 3, 6, 9, 12, 15, 18, 21].map((h) => {
    const x = chartX + (h / 23) * chartW;
    return `<text x="${x}" y="${chartY + chartH + 14}" text-anchor="middle" style="font:500 7px 'Consolas',monospace;fill:${theme.textSecondary};">${String(h).padStart(2, "0")}:00</text>`;
  });

  // Grid lines
  const gridLines = [0, 6, 12, 18].map((h) => {
    const x = chartX + (h / 23) * chartW;
    return `<line x1="${x}" y1="${chartY}" x2="${x}" y2="${chartY + chartH}" stroke="${theme.gridLine}" stroke-width="0.5" stroke-dasharray="3,3" />`;
  });

  return `
    <g class="animate-fade-d4">
      <rect x="15" y="${chartY - 18}" width="${chartW + 20}" height="${chartH + 42}" rx="8" fill="${theme.bgPanel}" opacity="0.3" />

      <text x="25" y="${chartY - 4}" class="label" style="font-size:8px;">TELEMETRY · COMMIT TIME DISTRIBUTION (UTC)</text>

      ${gridLines.join("")}

      <!-- Fill area -->
      <polygon points="${fillPoints}" fill="${theme.accent}" opacity="0.08" />

      <!-- Telemetry line -->
      <polyline points="${polyline}" fill="none" stroke="${theme.accent}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" filter="url(#glow)" />

      <!-- Data points -->
      ${hours
        .map((val, i) => {
          if (val === 0) return "";
          const x = chartX + (i / 23) * chartW;
          const y = chartY + chartH - (val / maxH) * chartH;
          return `<circle cx="${x}" cy="${y}" r="2.5" fill="${theme.accent}" opacity="0.8" />`;
        })
        .join("")}

      ${hourLabels.join("")}

      <!-- Peak hour indicator -->
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

function getOrdinalSuffix(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
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
