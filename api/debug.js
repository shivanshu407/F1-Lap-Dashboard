const { fetchGitHubData } = require("../src/fetcher");

module.exports = async (req, res) => {
  const { username = "shivanshu407" } = req.query;
  const token = process.env.GITHUB_TOKEN || process.env.PAT_1;

  try {
    // Replicate the GraphQL call to see raw contribution data
    const graphqlQuery = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
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

    const graphqlRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "F1-Dashboard-Debug",
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: { username },
      }),
    });

    const result = await graphqlRes.json();
    const calendar =
      result.data?.user?.contributionsCollection?.contributionCalendar;
    const allDays = calendar?.weeks?.flatMap((w) => w.contributionDays) || [];
    const sorted = [...allDays].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const todayStr = new Date().toISOString().split("T")[0];

    // Build dayMap
    const dayMap = {};
    for (const d of allDays) {
      dayMap[d.date] = d.contributionCount;
    }

    // Streak walk
    const todayDate = new Date(todayStr);
    let checkDate = new Date(todayDate);
    const streakLog = [];

    if ((dayMap[todayStr] || 0) === 0) {
      streakLog.push(`Today ${todayStr} has 0, starting from yesterday`);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      streakLog.push(
        `Today ${todayStr} has ${dayMap[todayStr]}, starting from today`
      );
    }

    let streak = 0;
    for (let i = 0; i < 10; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      const count = dayMap[dateStr] || 0;
      streakLog.push(`  ${dateStr}: ${count} ${count > 0 ? "✓" : "✗ BREAK"}`);
      if (count > 0) {
        streak++;
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    res.status(200).json({
      serverTime: new Date().toISOString(),
      todayStr,
      totalContributions: calendar?.totalContributions,
      last10Days: sorted.slice(0, 10),
      streakLog,
      calculatedStreak: streak,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
