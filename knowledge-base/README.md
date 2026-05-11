# F1 Lap Dashboard
> GitHub stats visualized as a live F1 telemetry dashboard SVG card.

## Tech Stack
| Layer        | Technology           |
|--------------|----------------------|
| Language     | JavaScript (Node.js) |
| Framework    | Vercel Serverless    |
| API          | GitHub REST + GraphQL|
| Rendering    | Pure SVG generation  |
| Hosting      | Vercel               |

## Directory Structure
```
F1-Lap-Dashboard/
├── api/
│   ├── card.js          # Main SVG endpoint
│   └── preview.js       # Interactive preview page
├── src/
│   ├── fetcher.js       # GitHub API data fetching & metric computation
│   ├── svg-generator.js # SVG rendering engine (850x470)
│   └── themes.js        # 10 F1 team color themes (25+ tokens each)
├── vercel.json          # Serverless config
└── package.json         # Zero dependencies
```

## Critical Rules
- **Zero dependencies** — all HTTP calls use native `https` module
- **SVG-only output** — no HTML, no canvas, no external fonts loaded at runtime
- **Events API payloads are unreliable** — `PushEvent.payload.commits` array is often missing. Always use `countCommitsFromEvent()` helper.
- **GraphQL contribution calendar lags** — can take hours to update. Always cross-reference with REST Events API using `Math.max()`.
- **Card dimensions** — 850x470px. Do not change without updating all element positions.
- **Themes** — every theme needs 25+ color tokens. Check `themes.js` for the full list.

## Quick Facts
| Key          | Value                                    |
|--------------|------------------------------------------|
| Repo         | github.com/shivanshu407/F1-Lap-Dashboard |
| Prod URL     | f1-lap-dashboard.vercel.app              |
| API Endpoint | /api/card?username=...                   |
| Preview      | /api/preview                             |
| CI/CD        | Vercel auto-deploy on push to main       |

## Reading Order
| File                    | When to Read                          |
|-------------------------|---------------------------------------|
| README.md               | Always first                          |
| decisions.md            | Before changing architecture          |
| known-issues.md         | Before debugging                      |
| active-context.md       | Every session start                   |
| changelog.md            | When tracing history                  |
| fetcher.md              | When working on data fetching         |
| svg-layout.md           | When working on visual layout         |
