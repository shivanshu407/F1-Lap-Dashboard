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
 * Makes a GitHub GraphQL API request.
 * This gives access to the contribution calendar which includes
 * BOTH public and private repository contributions.
 */
function graphqlRequest(query, variables, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });
    const options = {
      hostname: "api.github.com",
      path: "/graphql",
      method: "POST",
      headers: {
        "User-Agent": "F1-Lap-Dashboard",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        Authorization: `Bearer ${token}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Failed to parse GraphQL response"));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Fetch contribution data via GitHub GraphQL API.
 * Includes PRIVATE repo contributions (with appropriate token scope).
 */
async function fetchContributions(username, token) {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          totalCommitContributions
          restrictedContributionsCount
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalIssueContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const result = await graphqlRequest(query, { username }, token);

  if (result.errors) {
    console.error("GraphQL errors:", result.errors);
    return null;
  }

  return result.data?.user?.contributionsCollection || null;
}

/**
 * Fetch all GitHub data needed for the F1 dashboard.
 * Uses GraphQL API for contribution data (includes private repos).
 * Falls back to REST Events API if no token is provided.
 */
async function fetchGitHubData(username, token) {
  // Fetch REST API data + GraphQL contributions in parallel
  const restPromises = [
    request(`https://api.github.com/users/${username}`, token),
    request(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      token
    ),
    request(
      `https://api.github.com/users/${username}/events?per_page=100`,
      token
    ),
  ];

  // GraphQL requires a token
  const graphqlPromise = token
    ? fetchContributions(username, token)
    : Promise.resolve(null);

  const [user, repos, events, contributions] = await Promise.all([
    ...restPromises,
    graphqlPromise,
  ]);

  if (user.message === "Not Found") {
    throw new Error(`User "${username}" not found`);
  }

  // --- Language breakdown ---
  const languageCounts = {};
  if (Array.isArray(repos)) {
    for (const repo of repos) {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    }
  }

  // --- Contribution data from GraphQL (includes private commits) ---
  const todayStr = new Date().toISOString().split("T")[0];
  let todayCommits = 0;
  let yearTotalContributions = 0;
  let totalCommits = 0;
  let streak = 0;
  let hourDistribution = new Array(24).fill(0);
  let weeklyContributions = []; // last 7 days
  let monthlyContributions = []; // last 30 days

  if (contributions) {
    // --- GraphQL path: includes private repos ---
    const calendar = contributions.contributionCalendar;
    yearTotalContributions = calendar.totalContributions;
    totalCommits =
      contributions.totalCommitContributions +
      contributions.restrictedContributionsCount;

    // Flatten all contribution days
    const allDays = calendar.weeks.flatMap((w) => w.contributionDays);

    // Today's commits
    const todayEntry = allDays.find((d) => d.date === todayStr);
    todayCommits = todayEntry ? todayEntry.contributionCount : 0;

    // Last 7 days & last 30 days contributions
    const sortedDays = [...allDays].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    weeklyContributions = sortedDays.slice(0, 7);
    monthlyContributions = sortedDays.slice(0, 30);

    // Streak calculation from full calendar (accurate, includes private)
    // Walk backwards from today, counting consecutive days with contributions
    streak = 0;
    const todayDate = new Date(todayStr);
    let checkDate = new Date(todayDate);

    // Build a map for O(1) lookups
    const dayMap = {};
    for (const d of allDays) {
      dayMap[d.date] = d.contributionCount;
    }

    // If today has 0 contributions, start checking from yesterday
    // (today isn't over yet, so don't break the streak)
    if ((dayMap[todayStr] || 0) === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count consecutive days with contributions
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const count = dayMap[dateStr] || 0;
      if (count > 0) {
        streak++;
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Hour distribution: still from events API (GraphQL doesn't give times)
    const pushEvents = Array.isArray(events)
      ? events.filter((e) => e.type === "PushEvent")
      : [];
    for (const event of pushEvents) {
      const hour = new Date(event.created_at).getUTCHours();
      hourDistribution[hour]++;
    }
  } else {
    // --- Fallback: REST API only (public commits only, no token) ---
    const pushEvents = Array.isArray(events)
      ? events.filter((e) => e.type === "PushEvent")
      : [];
    totalCommits = pushEvents.reduce(
      (sum, e) => sum + (e.payload?.commits?.length || 0),
      0
    );

    // Today's commits from events
    for (const event of pushEvents) {
      const eventDate = event.created_at?.split("T")[0];
      if (eventDate === todayStr) {
        todayCommits += event.payload?.commits?.length || 0;
      }
    }

    // Hour distribution
    for (const event of pushEvents) {
      const hour = new Date(event.created_at).getUTCHours();
      hourDistribution[hour]++;
    }

    // Streak from events
    const commitDates = new Set();
    for (const event of pushEvents) {
      const date = event.created_at?.split("T")[0];
      if (date) commitDates.add(date);
    }
    const sortedDates = [...commitDates].sort().reverse();
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
    totalPREvents > 0
      ? (prEvents.length / totalPREvents) * 100
      : contributions
        ? Math.min(
            100,
            (contributions.totalPullRequestContributions /
              Math.max(1, contributions.totalPullRequestContributions + 2)) *
              100
          )
        : 85;

  // --- Account age ---
  const now = Date.now();
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

  // --- Lap time: time between commits ---
  // We use push events which have timestamps to compute gaps
  const pushEvents = Array.isArray(events)
    ? events
        .filter((e) => e.type === "PushEvent")
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    : [];

  let fastestLapMs = Infinity;
  let recentLapMs = null;
  for (let i = 0; i < pushEvents.length - 1; i++) {
    const gap =
      new Date(pushEvents[i].created_at) -
      new Date(pushEvents[i + 1].created_at);
    if (gap > 0) {
      if (recentLapMs === null) recentLapMs = gap;
      if (gap < fastestLapMs) fastestLapMs = gap;
    }
  }
  const fastestLap =
    fastestLapMs < Infinity ? formatLapTimeMs(fastestLapMs) : "--:--.---";
  const recentLap =
    recentLapMs !== null ? formatLapTimeMs(recentLapMs) : "--:--.---";

  // --- Map to F1 telemetry ---
  // Speed = today's commits (raw number, shown as cm/d — commits per day)
  const speed = todayCommits;
  // Gauge fraction: scale for the arc (0 commits = 0, 50+ = full gauge)
  const speedFraction = Math.min(1, todayCommits / 50);

  // Gear derived from speed: 0→N, 1-5→1, 6-10→2, 11-15→3, ... 30+→7/8
  const gear =
    todayCommits === 0
      ? "N"
      : Math.min(8, Math.max(1, Math.ceil(todayCommits / 5)));

  const tireWear = Math.min(100, Math.round(prMergeRate));

  // DRS: active if > 5 commits today
  const drsActive = todayCommits > 5;

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
    todayCommits,
    totalCommits,
    yearTotalContributions,
    streak,
    languageCounts,
    hourDistribution,
    hasGraphQL: !!contributions,

    // F1 telemetry
    speed,
    speedFraction,
    gear,
    fastestLap,
    recentLap,
    tireWear,
    drsActive,
  };
}

/**
 * Format milliseconds into a lap-time string M:SS.mmm
 * Cap display at 59:59.999
 */
function formatLapTimeMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const millis = ms % 1000;
  const minutes = Math.min(59, Math.floor(totalSec / 60));
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(
    Math.floor(millis)
  ).padStart(3, "0")}`;
}

module.exports = { fetchGitHubData };
