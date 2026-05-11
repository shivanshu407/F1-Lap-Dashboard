## 2026-05-11 — Fix Events API bug + Add Position, Fuel, ERS metrics
**What**: Fixed zero-data bug, implemented 3 missing metrics, redesigned card layout
**Why**: GitHub Events API stopped including `commits` array in PushEvent payloads, causing all commit counts to be 0. Additionally, 5 metrics documented in README were never implemented.
**Impact**: Card now shows real data. Height changed from 395px to 470px. New metrics visible.
**Files Changed**: `src/fetcher.js`, `src/svg-generator.js`, `README.md`
**Commit**: `c17b839`, `7826531`

- Fixed `countCommitsFromEvent()` — counts each PushEvent as 1 when commits array is missing
- Cross-references GraphQL + REST events for today's commits using `Math.max()`
- Streak calculation now supplements GraphQL with REST event dates
- Added Position (P1-P20) based on weekly commit average (absolute scale, not leaderboard)
- Added Fuel gauge (streak / 30 days = %)
- Added ERS deployment bar (7-day vs 30-day activity burst ratio)
- Redesigned header with Position badge and enhanced Streak badge
- Added secondary row with Fuel, ERS, and expanded stats bar (now includes total commits)
- Position formula: `21 - floor(min(20, weeklyAvg * 3))` — P1=7+/day, P5≈5/day, P12≈3/day
- Moved tire wear and DRS sections down 12px for breathing room from header
- Complete README rewrite — removed 5 phantom metrics, documented all 10 real ones
- Fixed cache_seconds docs (was 14400, actually 120)
