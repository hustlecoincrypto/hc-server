# HustleCoin Matchday Events Prototype

Standalone mobile-first Expo prototype visualizing HustleCoin Matchday Events + Game
Calendar + SafeLock Event Control. Isolated demo lane — no production repo,
deployment, wallet auth, payout, contract or SafeLock backend logic was modified.

## Safety Notes (Prototype-Only)
- Game HC is in-game only. No withdrawable balance, no real crypto payout, no contract,
  no token claim, no wallet auth rewrite.
- No betting, no odds, no wagering. Predictions are free fan quiz mechanics.
- SafeLock always governs final event pool. Admins cannot bypass caps or delete
  audit logs.
- Ads never grant HC or leaderboard points.
- Mock APIs live under `/api/*` and all Mongo collections are prefixed with `mde_`
  so no production schema is touched.

## Language
- Player-facing UI in **Portuguese (Angola-friendly)**.
- Admin UI in **English**.

## Tech
- Frontend: React Native (Expo Router) + TypeScript.
- Backend: FastAPI + MongoDB (isolated `mde_*` collections).
- Auto-tick simulator advances the live match minute every 45s while status=LIVE.

## Screens
### Player (Portuguese)
- Home Dashboard, Events (`EVENTOS` / `CORRIDAS AO VIVO`), Live Match Detail,
  Missions & Quiz, Leaderboard, Rewards Review, Profile.

### Admin (English)
- Admin Event Control, Game Calendar Control, SafeLock Event Governor,
  Reward Review Center, Abuse Monitor / Audit Log.

## Demo data
- Live event: Global Football Cup 2026, Oitavos de Final, Brasil 2–1 Noruega, 67'.
- Players: 3 842. User rank: 12º. User points: 1 450.
- Reward preview: Top 1 = 10 000 HC · Top 2 = 5 000 HC · Top 3 = 2 500 HC.
- SafeLock: Fund 925 000 HC · Weekly cap remaining 46 250 HC · Requested 25 000 →
  Approved 18 000 (REDUCED_POOL — reserve protection).

## Verdict
`MATCHDAY_EVENTS_PROTOTYPE_READY`
