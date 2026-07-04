# HustleCoin Matchday Events Prototype

**Jesus Christ is the King.**

---

## 1. Project title

**HustleCoin Matchday Events Prototype**

## 2. Status

`EMERGENT_GITHUB_PROTOTYPE_SYNC_READY`

## 3. Scope

Standalone prototype only. Covers:

- Matchday Events
- Game Calendar
- SafeLock Event Governor
- Reward Review
- GameOps Social Sync *(reference / mock surface)*
- OpenSea / NFT Reference *(reference only, no minting, no chain writes)*
- Crypto Pool Sync *(reference only, disabled/mock, SafeLock-controlled)*
- Special Football Event Lane *(mock)*

Nothing outside this scope is included, imported, wired, or invoked.

## 4. Safety confirmations

- **No production code.** No import from, or write to, the production HustleCoin backend, Flutter app, or token contracts.
- **No wallet auth.** No signing, no keys, no seed phrases, no MetaMask/WalletConnect/RainbowKit/etc.
- **No chain writes.** No RPC provider, no signer, no on-chain transactions. NFT and OpenSea surfaces are visual reference only.
- **No payout logic.** No withdrawable balance. Game HC is display-only, in-game only.
- **No claim button.** No claim endpoint, no claim UI, no reward release surface that leaves SafeLock's mock envelope.
- **No deploy.** No GitHub Actions, no CI/CD workflows, no build-and-ship pipeline, no store submission.
- **No betting, odds, wagering, staking, or buy-in language.** Predictions exist only as free fan quiz mechanics.
- **Web2 lane remains wallet-free.** Player flow never requires a wallet, address, or chain connection.
- **Crypto lane remains future / disabled / SafeLock-controlled.** Any crypto-facing panel is a mock and gated by SafeLock's governance states.

## 5. GitHub sync instruction

- **Target repo:** `hustlecoin-matchday-events-prototype`
- **Branch:** `prototype/matchday-events-visual-handoff`
- **PR title:** `Prototype only: Matchday Events Visual Handoff`
- **PR description (verbatim):**
  > This is standalone mock/demo only. No production code. No wallet auth. No chain writes. No payout logic. No deploy.

Use the Emergent **"Save to GitHub"** button (top-right) to perform the push against the standalone prototype repo above. Do not select or target any production HustleCoin repo.

## 6. Runtime note

This prototype uses **demo MongoDB collections prefixed `mde_*`** (exact — verified against `/app/backend/server.py`).

Namespaced collections:

- `mde_events`
- `mde_missions`
- `mde_leaderboard`
- `mde_rewards_review`
- `mde_calendar_slots`
- `mde_safelock_decisions`
- `mde_audit_log`
- `mde_player_state`
- `mde_quiz_answers`
- `mde_meta` *(seed marker)*

Seed is idempotent and lives only under this prefix. No production Mongo schema is touched.

## 7. Verdict endpoint

Backend endpoint `GET /api/verdict` returns exactly:

```json
{ "verdict": "MATCHDAY_EVENTS_PROTOTYPE_READY", "at": "<iso timestamp>" }
```

Aligned wording across the app, README, and this handoff: **`MATCHDAY_EVENTS_PROTOTYPE_READY`**.

This is **not** a production-readiness claim. The prototype is a visual/reference build only.

## 8. Handoff note for Junie

> This is visual/reference only. Do **not** copy directly into HustleCoin production. Rebuild carefully in small backend-authoritative lanes:
> - Lane authority stays in the production backend (SafeLock, Game Calendar read model, Reward Review, audit log) — not in a mock/demo layer.
> - Any behaviour surfaced here (event lifecycle, SafeLock decisions, reward pool governance, audit stream) must be re-derived from production truth, not lifted from this repo.
> - Language, safety copy, and Portuguese disclaimers can be reused as UX reference; the underlying data plane must be rebuilt server-authoritative.
> - No wallet, chain, payout, claim, or deploy surface from this prototype is safe to port.

---

**Final verdict:** `HANDOFF_MD_READY_FOR_GITHUB_SAVE`

**Jesus Christ is the King.**
