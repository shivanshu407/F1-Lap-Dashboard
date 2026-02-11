const https = require("https");

/**
 * Makes an HTTPS GET request and returns parsed JSON.
 */
function request(url, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      "User-Agent": "F1-Lap-Dashboard",
      Accept: "application/vnd.github.v3+json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers,
    };

    https
      .get(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Failed to parse response from ${url}`));
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * Fetch all GitHub data needed for the F1 dashboard.
 */
async function fetchGitHubData(username, token) {
  const [user, repos, events] = await Promise.all([
    request(`https://api.github.com/users/${username}`, token),
    request(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      token
    ),
    request(
      `https://api.github.com/users/${username}/events?per_page=100`,
      token
    ),
  ]);

  if (user.message === "Not Found") {
    throw new Error(`User "${username}" not found`);
  }

  // --- Language breakdown ---
  const languageCounts = {};
  let totalLangBytes = 0;
  if (Array.isArray(repos)) {
    for (const repo of repos) {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        totalLangBytes++;
      }
    }
  }

  // --- Commit analysis from events ---
  const pushEvents = Array.isArray(events)
    ? events.filter((e) => e.type === "PushEvent")
    : [];
  const totalRecentCommits = pushEvents.reduce(
    (sum, e) => sum + (e.payload?.commits?.length || 0),
    0
  );

  // --- Commit times (hour of day distribution) ---
  const hourDistribution = new Array(24).fill(0);
  for (const event of pushEvents) {
    const hour = new Date(event.created_at).getUTCHours();
    hourDistribution[hour]++;
  }

  // --- Streak calculation from events ---
  const commitDates = new Set();
  for (const event of pushEvents) {
    const date = event.created_at?.split("T")[0];
    if (date) commitDates.add(date);
  }
  const sortedDates = [...commitDates].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (sortedDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // --- PR merge rate ---
  const prEvents = Array.isArray(events)
    ? events.filter(
        (e) =>
          e.type === "PullRequestEvent" &&
          e.payload?.action === "closed" &&
          e.payload?.pull_request?.merged
      )
    : [];
  const totalPREvents = Array.isArray(events)
    ? events.filter((e) => e.type === "PullRequestEvent").length
    : 0;
  const prMergeRate =
    totalPREvents > 0 ? (prEvents.length / totalPREvents) * 100 : 85;

  // --- Recent activity burst (for ERS/DRS) ---
  const now = Date.now();
  const last7Days = Array.isArray(events)
    ? events.filter(
        (e) => now - new Date(e.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
      ).length
    : 0;
  const last30Days = Array.isArray(events) ? events.length : 0;
  const activityBurst = last30Days > 0 ? (last7Days / last30Days) * 100 : 0;

  // --- Account age ---
  const createdAt = new Date(user.created_at);
  const accountAgeDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
  const accountAgeYears = (accountAgeDays / 365).toFixed(1);

  // --- Stars ---
  const totalStars = Array.isArray(repos)
    ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
    : 0;

  // --- Forks ---
  const totalForks = Array.isArray(repos)
    ? repos.reduce((sum, r) => sum + (r.forks_count || 0), 0)
    : 0;

  // --- Map to F1 telemetry ---
  const speed = Math.min(350, Math.round((totalRecentCommits / 100) * 350));
  const gear = Math.min(8, Math.max(1, Math.ceil(speed / 44)));
  const lapTime = formatLapTime(streak);
  const tireWear = Math.min(100, Math.round(prMergeRate));
  const fuelLevel = Math.min(
    100,
    Math.round(
      ((Array.isArray(repos) ? repos.length : 0) /
        Math.max(1, user.public_repos)) *
        100
    )
  );
  const ersEnergy = Math.min(100, Math.round(activityBurst * 2.5));
  const drsActive = activityBurst > 30;

  // Sector times from contribution periods
  const sector1 = generateSectorTime(totalRecentCommits, 1);
  const sector2 = generateSectorTime(
    Array.isArray(repos) ? repos.length : 0,
    2
  );
  const sector3 = generateSectorTime(streak, 3);

  // Position based on relative metrics
  const position = Math.max(
    1,
    Math.min(20, 21 - Math.ceil((speed / 350) * 20))
  );

  return {
    username: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
    bio: user.bio || "",
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    accountAgeYears,
    totalStars,
    totalForks,
    totalRecentCommits,
    streak,
    languageCounts,
    hourDistribution,

    // F1 telemetry
    speed,
    gear,
    lapTime,
    tireWear,
    fuelLevel,
    ersEnergy,
    drsActive,
    sector1,
    sector2,
    sector3,
    position,
  };
}

function formatLapTime(streak) {
  const minutes = 1;
  const seconds = Math.max(5, 45 - streak);
  const ms = Math.floor(Math.random() * 999);
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(ms).padStart(
    3,
    "0"
  )}`;
}

function generateSectorTime(value, sector) {
  const base = [28, 24, 21][sector - 1];
  const variation = Math.max(0, base - Math.min(value, base - 1));
  const ms = Math.floor(Math.random() * 999);
  return `${variation}.${String(ms).padStart(3, "0")}`;
}

module.exports = { fetchGitHubData };
