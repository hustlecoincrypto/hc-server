# HustleCoin Public Reference Repository

HustleCoin is a gameplay-first economy game with optional Web3/NFT participation.

> **Runtime notice — 2026-10-01**
>
> This repository is a **public reference surface**. It is **not** the authoritative deployment source for the live backend at `https://hustlecoin-backend.fly.dev`.
>
> The root FastAPI/SQLAlchemy code in this repository is a legacy/public reference scaffold. It must not be used to infer the current production gameplay implementation, Admin/Game Ops behavior, Mongo models, SafeLock authority, payout authority, or Web3 settlement behavior.

## Runtime Relationship

Current public truth:

- Public gameplay API/runtime endpoint: `https://hustlecoin-backend.fly.dev`
- Public reference repository: `hustlecoincrypto/hc-server`
- Authoritative gameplay/backend development: protected HustleCoin hybrid repository
- `hc-server` is **not** the Fly deployment source
- The exact Git source revision currently running on Fly has not yet been publicly proven
- Newer Admin/Game Ops and gameplay reconciliation work in protected development must not be described as deployed until a reviewed candidate is tested, deployed, and verified

See `PUBLIC_RUNTIME_RELATIONSHIP.md` for the synchronization and provenance rules.

## Current Direction

The active architecture separates gameplay truth, NFT ownership, NFT activation, and marketplace settlement:

- Backend gameplay decides player progression, eligibility, and benefits.
- Chain evidence proves recognized NFT ownership.
- NFT identity must be bound to a backend-controlled exact-token mapping before it can affect gameplay.
- Job and Key NFT ownership does not automatically activate benefits.
- Services marketplace and NFT marketplace are separate lanes.
- OpenSea/IPFS metadata is display enrichment, not ownership, gameplay, payment, or settlement authority.

## NFT Gameplay Model

`recognized contract + exact token + verified ownership -> canonical backend identity -> active activation when required -> gameplay policy`

Land NFTs additionally remain subject to tile compatibility, level, district access, land capacity, active-Key requirements, and other backend gameplay rules.

## Current Progress

Protected development has established tested foundations for canonical NFT listings, identity provenance, Admin-configured HC Crypto activation policy, and newer Admin/Game Ops authority work.

However, public production synchronization is still in progress. A broad backend regression gate remains under investigation, so the newer protected backend work must not yet be described as production-deployed.

The following must **not** be described as production-ready unless separately proven:

- newly reconciled Admin/Game Ops behavior;
- NFT purchase settlement;
- NFT transfer settlement;
- HC Crypto activation payment settlement;
- end-to-end live NFT marketplace reconciliation;
- any protected gameplay change that has not been tied to a verified production deployment.

## Repository Role

This public repository exists to provide safe public architecture, reference code, progress wording, and deployment-status documentation.

It does **not** expose private credentials, signing material, private user data, private production code, or unpublished security implementation details.

Agents and contributors should read `AGENTS.md` before changing this repository.
