## ISSUE-001: Events API Missing Commits Array
**Status**: Resolved
**Severity**: Critical
**Discovered**: 2026-05-11
**Resolved**: 2026-05-11
**Symptom**: Dashboard shows 0 commits, Gear N, 0-day streak, DRS CLOSED despite user having recent push activity.
**Root Cause**: GitHub changed PushEvent payload format — `payload.commits` array is no longer included. Only `push_id`, `ref`, `head`, `before` are returned. The old code used `event.payload.commits.length` which returned undefined → 0.
**Workaround**: N/A (was a permanent bug)
**Fix**: Added `countCommitsFromEvent()` helper that counts each PushEvent as 1 commit when the commits array is missing. Cross-references GraphQL + REST using `Math.max()`.

## ISSUE-002: GraphQL Contribution Calendar Lag
**Status**: Accepted Risk
**Severity**: Medium
**Discovered**: 2026-05-11
**Symptom**: Today's commits show 0 in GraphQL contribution calendar even though user just pushed.
**Root Cause**: GitHub's contribution calendar updates asynchronously, can lag by hours.
**Workaround**: REST Events API is used as a real-time supplement. `Math.max(graphql, events)` ensures the higher count is always used.
**Fix**: Mitigated but not fully resolved — the REST Events API only returns the last 90 days / 300 events, so very old activity may still lag.
