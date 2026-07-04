# HustleCoin Matchday Events Prototype — PRD

## Scope
Standalone mobile-first Expo prototype (React Native + FastAPI + MongoDB) that
visualizes HustleCoin Matchday Events, the Game Calendar and the SafeLock Event
Governor for owner/Junie/Codex review. Isolated demo lane — no production
integration.

## Users
- Players: Portuguese UI, join live football events, complete missions/quizzes,
  see leaderboard and rewards review.
- Admins: English UI, control events, calendar, SafeLock governance, reward
  review center and abuse/audit log.

## Feature List
- Role selector entry screen.
- Player: Home Dashboard, Events list (Portuguese, PT filters), Live Match Detail
  with 6 phases, missions/quiz, leaderboard (top players + user pinned + points
  breakdown), Rewards Review (SafeLock pool banner + warning disclaimer), Profile.
- Admin: Event Control (create + score/minute/status), Calendar Control (Draft
  → Approved → Published → Live → Completed → Rewards Review → Retired), SafeLock
  Governor (fund grid + per-event decisions + recompute button), Reward Review
  Center (Approve/Reduce/Freeze/Block with audit notes and SafeLock gate), Audit
  Log (immutable-style stream with severity, actors, targets).
- Auto-tick simulator on backend advances the live match minute every 45s.
- Deterministic SafeLock rule engine covering rarity, weekly cap, reserve guard,
  activity/joined heuristics, abuse risk and admin-review states.

## Business rules
- Game HC only. No withdrawable balance, no wallet requirement.
- No betting / odds / wagering. Predictions are free quiz mechanics.
- Admins cannot bypass SafeLock caps or delete audit logs.
- All data isolated inside `mde_*` MongoDB collections.

## Verdict target
`MATCHDAY_EVENTS_PROTOTYPE_READY`.
