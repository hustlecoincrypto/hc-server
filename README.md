# HustleCoin Public Reference Repository

HustleCoin is a gameplay-first economy game with optional Web3/NFT participation.

> **Runtime notice - review date 2026-10-10**
>
> This repository is a **public reference surface**. It is **not** the authoritative deployment source for the live gameplay backend at `https://hustlecoin-backend.fly.dev` or the chain-support runtime at `https://hustlecoin-chain.fly.dev`.
>
> The root FastAPI/SQLAlchemy code in this repository is an executable legacy/public reference scaffold. Running it locally can create SQLite tables and expose legacy auth, user, and transaction routes. It must not be used as proof of production Admin/Game Ops, Mongo models, SafeLock authority, payout authority, marketplace behavior, gameplay behavior, wallet verification, or Web3 settlement behavior.

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

See `PUBLIC_RUNTIME_RELATIONSHIP.md`, `CHAIN_RUNTIME_RELATIONSHIP.md`, and `PUBLIC_REFERENCE_INFLUENCE_MAP.md` for synchronization, provenance, and legacy-scaffold influence rules.

## Current Direction

The active architecture separates gameplay truth from chain evidence and execution support:

- Backend gameplay decides player progression, eligibility, balances, rewards, missions, leaderboard state, land economy, Admin activation, and SafeLock policy.
- Chain-support services provide wallet-signature verification, NFT/wallet asset evidence, and narrowly authorized Web3 execution support.
- Chain evidence never grants gameplay benefits by itself.
- NFT identity must be bound to a backend-controlled exact-token mapping before it can affect gameplay.
- Job and Key NFT ownership does not automatically activate benefits.
- Services marketplace and NFT marketplace are separate lanes.
- OpenSea/IPFS metadata is display enrichment, not ownership, gameplay, payment, or settlement authority.

## Repository Role

This public repository exists to provide safe public architecture, reference code, progress wording, and deployment-status documentation.

It does **not** expose private credentials, signing material, private user data, private production code, or unpublished security implementation details.

Agents and contributors should read `AGENTS.md` and `PUBLIC_REFERENCE_INFLUENCE_MAP.md` before changing this repository.

## Truth Rule

`SOURCE_EXISTS != TEST_PROVEN != RUNTIME_READ_PROVEN != DEPLOYED_PROVEN`

A feature is public production truth only when its runtime deployment and verification are proven.
