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
    streak = 0;
    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];
      // Skip today if 0 (day isn't over yet)
      if (i === 0 && day.contributionCount === 0) continue;
      if (day.contributionCount > 0) {
        streak++;
      } else {
        break;
      }
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

  // --- Activity burst (for ERS/DRS) ---
  const now = Date.now();
  let activityBurst = 0;
  if (contributions) {
    const weekTotal = weeklyContributions.reduce(
      (s, d) => s + d.contributionCount,
      0
    );
    const monthTotal = monthlyContributions.reduce(
      (s, d) => s + d.contributionCount,
      0
    );
    activityBurst = monthTotal > 0 ? (weekTotal / monthTotal) * 100 : 0;
  } else {
    const last7Days = Array.isArray(events)
      ? events.filter(
          (e) =>
            now - new Date(e.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
        ).length
      : 0;
    const last30Days = Array.isArray(events) ? events.length : 0;
    activityBurst = last30Days > 0 ? (last7Days / last30Days) * 100 : 0;
  }

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
  // Speed: today's commits drive the speedometer (0 commits = 0, 30+ = max)
  const speed = Math.min(350, Math.round((todayCommits / 30) * 350));
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
  const sector1 = generateSectorTime(todayCommits, 1);
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
    todayCommits,
    totalCommits,
    yearTotalContributions,
    streak,
    languageCounts,
    hourDistribution,
    hasGraphQL: !!contributions,

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
