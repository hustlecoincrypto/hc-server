# HustleCoin Public Reference Repository

HustleCoin is a gameplay-first economy game with optional Web3/NFT participation.

> **Runtime notice — 2026-10-01**
>
> This repository is a **public reference surface**. It is **not** the authoritative deployment source for the live gameplay backend at `https://hustlecoin-backend.fly.dev` or the chain-support runtime at `https://hustlecoin-chain.fly.dev`.
>
> The root FastAPI/SQLAlchemy code in this repository is a legacy/public reference scaffold. It must not be used to infer the current production gameplay implementation, Admin/Game Ops behavior, Mongo models, SafeLock authority, payout authority, wallet verification behavior, or Web3 settlement behavior.

## Runtime Relationship

Current public truth:

- Public gameplay API/runtime: `https://hustlecoin-backend.fly.dev`
- Public chain-support runtime: `https://hustlecoin-chain.fly.dev`
- Public reference repository: `hustlecoincrypto/hc-server`
- Authoritative gameplay/backend development: protected HustleCoin hybrid repository
- Chain-support development: protected HustleCoin chain repository, with related integration code also present in protected hybrid development
- `hc-server` is **not** a deployment source for either Fly service
- The exact Git source revision currently running on each Fly service must be proven independently
- Newer Admin/Game Ops, gameplay, payout, wallet, or chain-support work must not be described as deployed until a reviewed candidate is tested, deployed, and verified

See `PUBLIC_RUNTIME_RELATIONSHIP.md` and `CHAIN_RUNTIME_RELATIONSHIP.md` for the synchronization and provenance rules.

## Current Direction

The active architecture separates gameplay truth from chain evidence and execution support:

- Backend gameplay decides player progression, eligibility, balances, rewards, missions, leaderboard state, land economy, Admin activation, and SafeLock policy.
- Chain-support services provide wallet-signature verification, NFT/wallet asset evidence, and narrowly authorized Web3 execution support.
- Chain evidence never grants gameplay benefits by itself.
- NFT identity must be bound to a backend-controlled exact-token mapping before it can affect gameplay.
- Job and Key NFT ownership does not automatically activate benefits.
- Services marketplace and NFT marketplace are separate lanes.
- OpenSea/IPFS metadata is display enrichment, not ownership, gameplay, payment, or settlement authority.

## NFT Gameplay Model

`recognized contract + exact token + verified ownership -> canonical backend identity -> active activation when required -> gameplay policy`

Land NFTs additionally remain subject to tile compatibility, level, district access, land capacity, active-Key requirements, and other backend gameplay rules.

## Current Progress

Protected development has established tested foundations for canonical NFT listings, identity provenance, Admin-configured HC Crypto activation policy, and newer Admin/Game Ops authority work.

However, public production synchronization is still in progress. The broad gameplay/backend baseline is currently blocked by a disposable-Mongo test-harness startup failure on clean main, so an earlier application-level mission failure has not yet been classified as pre-existing or reconciliation-introduced.

The following must **not** be described as production-ready unless separately proven:

- newly reconciled Admin/Game Ops behavior;
- newly synchronized gameplay behavior;
- NFT purchase settlement;
- NFT transfer settlement;
- HC Crypto activation payment settlement;
- end-to-end live NFT marketplace reconciliation;
- chain payout-authorization changes still under review;
- any protected change that has not been tied to a verified production deployment.

## Repository Role

This public repository exists to provide safe public architecture, reference code, progress wording, and deployment-status documentation.

It does **not** expose private credentials, signing material, private user data, private production code, or unpublished security implementation details.

Agents and contributors should read `AGENTS.md` before changing this repository.
