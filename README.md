<div align="center">

# 🏎️ F1 Lap Dashboard

### Your GitHub stats, reimagined as a Formula 1 telemetry dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshivanshu407%2FF1-Lap-Dashboard&env=GITHUB_TOKEN&envDescription=A%20GitHub%20Personal%20Access%20Token%20for%20higher%20API%20rate%20limits&envLink=https%3A%2F%2Fdocs.github.com%2Fen%2Fauthentication%2Fkeeping-your-account-and-data-secure%2Fcreating-a-personal-access-token)
&nbsp;&nbsp;
![GitHub stars](https://img.shields.io/github/stars/shivanshu407/F1-Lap-Dashboard?style=flat-square&color=e63946)
![GitHub forks](https://img.shields.io/github/forks/shivanshu407/F1-Lap-Dashboard?style=flat-square&color=00d2be)
![License](https://img.shields.io/github/license/shivanshu407/F1-Lap-Dashboard?style=flat-square)

<br />

![F1 Lap Dashboard Demo](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=dark)

<br />

*Commits become speed. Streaks become lap times. Pull requests become tire wear.*
*Your entire GitHub activity — rendered as a live F1 cockpit.*

</div>

---

## ⚡ Quick Start

**Just paste this into your GitHub profile README:**

```markdown
![F1 Lap Dashboard](https://f1-lap-dashboard.vercel.app/api/card?username=YOUR_GITHUB_USERNAME)
```

> Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

**Example:**
```markdown
![F1 Lap Dashboard](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407)
```

That's it! 🏁 No setup, no deployment, no API keys needed.

---

## 🎨 Themes

Every F1 team has their colors. Pick yours.

| Theme | Preview |
|:---:|:---:|
| `dark` (default) | ![dark](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=dark) |
| `ferrari` | ![ferrari](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=ferrari) |
| `mercedes` | ![mercedes](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=mercedes) |
| `redbull` | ![redbull](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=redbull) |
| `mclaren` | ![mclaren](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=mclaren) |
| `alpine` | ![alpine](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=alpine) |
| `aston_martin` | ![aston_martin](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=aston_martin) |
| `williams` | ![williams](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=williams) |
| `haas` | ![haas](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=haas) |
| `sauber` | ![sauber](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=sauber) |

**Usage with theme:**
```markdown
![F1 Lap Dashboard](https://f1-lap-dashboard.vercel.app/api/card?username=YOUR_USERNAME&theme=ferrari)
```

---

## 📊 What Each Metric Means

Your GitHub data is mapped to real F1 telemetry metrics:

| F1 Metric | GitHub Data | How It's Calculated |
|---|---|---|
| 🏎️ **Speed (km/h)** | Recent commits | Commits in last 90 events → mapped to 0-350 km/h |
| ⚙️ **Gear (1-8)** | Commit intensity | Derived from speed tier |
| ⏱️ **Lap Time** | Current streak | Streak days → shorter lap time = better |
| 🏁 **Position (P1-P20)** | Overall activity | Speed-based ranking on a 20-driver grid |
| 🛞 **Tire Wear** | PR merge rate | % of PRs successfully merged (FL, FR, RL, RR) |
| ⛽ **Fuel Level** | Repository count | Number of public repos as fuel % |
| ⚡ **ERS Deploy** | Activity burst | Last 7 days vs last 30 days activity ratio |
| 🟢 **DRS** | Hot streak | Open = high recent activity, Off = cool period |
| 📈 **Telemetry Chart** | Commit times | When you code (hour-by-hour UTC distribution) |
| 📊 **Sector Times** | Mixed metrics | S1: commits, S2: repos, S3: streak |
| **Interval** | Gap to P1 | Position × 0.847s (the classic F1 gap) |

---

## ⚙️ All Parameters

| Parameter | Description | Default | Options |
|---|---|---|---|
| `username` | **Required.** GitHub username | — | Any valid username |
| `theme` | Color theme | `dark` | `dark`, `ferrari`, `mercedes`, `redbull`, `mclaren`, `alpine`, `aston_martin`, `williams`, `haas`, `sauber` |
| `hide_border` | Remove card border | `false` | `true` / `false` |
| `hide_gear` | Hide the gear indicator | `false` | `true` / `false` |
| `cache_seconds` | Cache duration | `14400` (4h) | `1800` – `86400` |

**Full example with all params:**
```markdown
![F1 Lap Dashboard](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=ferrari&hide_border=true&cache_seconds=7200)
```

---

## 🚀 Deploy Your Own Instance

Deploying your own gives you **higher API rate limits** (with a GitHub token) and a **custom URL**.

### Option 1: One-Click Deploy (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshivanshu407%2FF1-Lap-Dashboard&env=GITHUB_TOKEN&envDescription=A%20GitHub%20Personal%20Access%20Token%20for%20higher%20API%20rate%20limits&envLink=https%3A%2F%2Fdocs.github.com%2Fen%2Fauthentication%2Fkeeping-your-account-and-data-secure%2Fcreating-a-personal-access-token)

1. Click the button above
2. Sign in with your GitHub account
3. Set the `GITHUB_TOKEN` environment variable (see below)
4. Deploy! 🏁

### Option 2: Manual Deploy

```bash
# 1. Fork this repository
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/F1-Lap-Dashboard.git
cd F1-Lap-Dashboard

# 3. Install Vercel CLI
npm i -g vercel

# 4. Login to Vercel
vercel login

# 5. Deploy
vercel --prod
```

### Setting Up GitHub Token (Recommended)

Without a token, the GitHub API limits you to **60 requests/hour**. With a token, you get **5,000 requests/hour**.

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Click **"Generate new token"**
3. Give it a name like `f1-dashboard`
4. Set expiration as you prefer
5. Under **Permissions**, select:
   - `public_repo` (read-only access to public repos)
6. Generate and copy the token
7. In your Vercel project dashboard:
   - Go to **Settings → Environment Variables**
   - Add `GITHUB_TOKEN` with the token value
   - Redeploy

---

## 🖼️ Embedding Examples

### In GitHub Profile README

```markdown
<!-- Basic -->
![F1 Lap Dashboard](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407)

<!-- With theme -->
![F1 Lap Dashboard](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=ferrari)

<!-- Centered -->
<div align="center">
  <img src="https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=redbull" alt="F1 Lap Dashboard" />
</div>

<!-- As a link to your profile -->
[![F1 Lap Dashboard](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=mclaren)](https://github.com/shivanshu407)
```

### In HTML

```html
<img src="https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=dark" alt="F1 Lap Dashboard" width="850" />
```

### In a Website / Blog

```html
<a href="https://github.com/shivanshu407">
  <img src="https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=mercedes" alt="GitHub F1 Dashboard" style="max-width:100%;" />
</a>
```

---

## 🏗️ Project Structure

```
F1-Lap-Dashboard/
├── api/
│   ├── card.js          # Main SVG endpoint (/api/card?username=...)
│   └── preview.js       # Live preview page (/api/preview)
├── src/
│   ├── fetcher.js       # GitHub API data fetching & stat computation
│   ├── svg-generator.js # Full SVG rendering engine
│   └── themes.js        # 10 F1 team color themes
├── package.json
├── vercel.json          # Vercel serverless config
└── README.md
```

---

## 🔧 How It Works

1. **Request** → Your GitHub README loads `<img src="...your-vercel-app.../api/card?username=...">`.
2. **Fetch** → The serverless function calls the GitHub REST API to get your profile, repos, and recent events.
3. **Compute** → Raw data is mapped to F1 telemetry metrics (speed, tire wear, fuel, etc.).
4. **Render** → A beautiful SVG string is generated with CSS animations, gradients, and glow effects.
5. **Cache** → Response is cached (default 4 hours) so it doesn't spam the GitHub API.
6. **Display** → GitHub renders the SVG as an image in your profile. 🏁

---

## 🎯 Live Preview

Visit the interactive preview page to test different usernames and themes in real-time:

**→ [f1-lap-dashboard.vercel.app/api/preview](https://f1-lap-dashboard.vercel.app/api/preview)**

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Ideas for contributions:
- 🎨 **New team themes** — Add a new F1 team color scheme in `src/themes.js`
- 📊 **New metrics** — Map additional GitHub data to F1 telemetry
- ✨ **Animations** — Add more CSS animations (within SVG constraints)
- 🏎️ **Custom layouts** — Different dashboard layouts (steering wheel view, pit wall, etc.)

```bash
# Clone
git clone https://github.com/shivanshu407/F1-Lap-Dashboard.git
cd F1-Lap-Dashboard

# Run locally
npx vercel dev

# Open http://localhost:3000/api/card?username=shivanshu407
```

---

## 📝 License

[MIT](./LICENSE) — do whatever you want with it. If you use it, a ⭐ would be appreciated!

---

## 💡 Inspiration

- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) by Anurag Hazra
- [github-profile-trophy](https://github.com/ryo-ma/github-profile-trophy) by ryo-ma
- The entire Formula 1 telemetry aesthetic 🏎️

---

<div align="center">

**Made with ❤️ and racing fuel by [@shivanshu407](https://github.com/shivanshu407)**

*If you like this project, please consider giving it a ⭐ — it's free and means a lot!*

![F1 Lap Dashboard](https://f1-lap-dashboard.vercel.app/api/card?username=shivanshu407&theme=ferrari)

</div>
