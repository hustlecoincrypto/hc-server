# HustleCoin Public Repository — Agent Rules

Jesus Christ is the King. Amen.

This public repository is a public reference surface for HustleCoin. It must not expose secrets, private infrastructure details, private keys, internal credentials, private database data, private production source, or unpublished security implementation details.

## Public Truth Rules

- Do not claim a feature is deployed, production-ready, or settlement-ready without public evidence.
- Do not publish private wallet credentials, API keys, signing secrets, database URIs, internal admin keys, or private user data.
- Do not copy private-repository implementation details into this repo unless they are explicitly approved for public release.
- Public documentation may summarize architecture and progress, but must preserve truth-level wording.
- The root FastAPI/SQLAlchemy code in this repository is reference/legacy code and is not the authoritative Fly production backend.

## Runtime Relationship Rules

- Public runtime endpoint: `https://hustlecoin-backend.fly.dev`.
- This repository (`hc-server`) is **not** the authoritative Fly deployment source.
- Authoritative gameplay/backend implementation and reconciliation occur in protected HustleCoin development.
- Never infer the live Fly source SHA from this repository.
- Never describe protected Admin/Game Ops or gameplay changes as deployed until production deployment evidence exists.
- Do not synchronize production by copying private backend source into this public repository. Synchronization here means public truth/status/provenance documentation only.

## Required GitHub Evidence Discipline

For every successful backend candidate:

1. The protected GitHub PR must record the exact candidate SHA, base SHA, test commands, test counts, invariant status, and known failures.
2. After an authorized Fly deployment, the protected GitHub PR must record the exact deployed source SHA, Fly release/image identity, deployment timestamp, health result, and production smoke-test result.
3. This public repository may then receive a sanitized status update that does not expose secrets or private implementation details.
4. `DEPLOYED_PROVEN` must never be set from local tests alone.

Required truth labels:

- `SOURCE_EXISTS`
- `TEST_PROVEN`
- `RUNTIME_READ_PROVEN`
- `DEPLOYED_PROVEN`

Never collapse these into one claim.

## Current Architecture Direction

HustleCoin is gameplay-first with optional Web3/NFT participation.

Core separation:

- gameplay progression and player eligibility are backend-authoritative;
- NFT ownership is chain evidence, not automatic gameplay privilege;
- NFT identity must be backend-controlled and bound to recognized contract + exact token;
- Job/Key ownership is separate from activation;
- Web3 Job/Key activation is intended to use HC Crypto policy, not Game HC;
- services marketplace and NFT marketplace are separate authority lanes;
- OpenSea/IPFS metadata is display enrichment only, not gameplay or settlement authority.

## NFT / Gameplay Safety

Agents must preserve:

`recognized contract + exact token + verified ownership -> canonical backend identity -> active activation when required -> gameplay policy`

Do not allow metadata alone to grant:

- land capacity;
- district access;
- Job effects;
- Key tier benefits;
- SafeLock status;
- competition status;
- speedups;
- ad-free access;
- claim authority.

## Public Progress Wording

Safe public wording as of 2026-10-01:

- protected gameplay/Admin reconciliation is active;
- focused and disposable-Mongo validation has passed for the current Admin/Game Ops reconciliation lane;
- the broader backend regression gate is still being reconciled;
- the newer protected backend work is not yet proven deployed to the public Fly runtime;
- authoritative NFT purchase settlement, NFT transfer settlement, and HC Crypto activation payment settlement must not be described as production-ready.

## Change Discipline

- Prefer documentation-only or clearly scoped public changes.
- Do not modify production-sensitive behavior from this public mirror without explicit owner authorization.
- Keep commits small and explain architecture/safety impact.
- Never weaken validation to make a demo pass.
- Never make this repository a second gameplay authority.

## Reporting

Always distinguish:

`SOURCE_EXISTS != TEST_PROVEN != RUNTIME_READ_PROVEN != DEPLOYED_PROVEN`
