## Decision: Cross-reference GraphQL + REST for commit counts
**Date**: 2026-05-11
**Status**: Accepted
**Context**: GitHub's Events API stopped including the `commits` array in PushEvent payloads (only returns push_id, ref, head, before). The GraphQL contribution calendar lags behind real-time by hours. Either source alone gives inaccurate "today" data.
**Decision**: Use `Math.max(graphqlCount, eventsCount)` for today's commits. For streak, merge both data sources into a single dayMap. Count each PushEvent as 1 commit when the commits array is missing.
**Alternatives Considered**: (1) Use only GraphQL — rejected because it lags behind. (2) Use only REST — rejected because commits array is missing. (3) Use commit API per-repo — rejected because too many API calls.
**Consequences**: Commit counts may be slightly inflated (each push counted as 1 even if it had 0 or multiple commits), but this is far better than showing 0.

## Decision: Position as absolute scale, not leaderboard
**Date**: 2026-05-11
**Status**: Accepted
**Context**: Position (P1-P20) needs a reference point. Options: (1) compare against other dashboard users, (2) compare against global GitHub averages, (3) use absolute activity thresholds.
**Decision**: Use absolute scale based on weekly commit average. Formula: `21 - floor(min(20, weeklyAvg * 3))`. P1=7+/day, P5≈5/day, P20=0.
**Alternatives Considered**: (1) Leaderboard against other users — rejected because requires a database. (2) Global percentiles — rejected because requires crawling GitHub.
**Consequences**: Position is always relative to fixed thresholds. A very active developer will always be P1-P3 regardless of how many people use the dashboard. Interval gap is cosmetic (position × 0.847s).

## Decision: Card height 470px (from 395px)
**Date**: 2026-05-11
**Status**: Accepted
**Context**: Adding Fuel, ERS, and expanded stats bar required more vertical space.
**Decision**: Increased card height to 470px. Added a secondary row (y=275-317) for Fuel gauge, ERS bar, and stats.
**Alternatives Considered**: (1) Keep 395px and shrink existing elements — rejected because it would make text unreadable. (2) Make card wider — rejected because 850px is already near GitHub's max render width.
**Consequences**: Card takes slightly more vertical space in READMEs. All element Y positions above the telemetry chart remain unchanged.
