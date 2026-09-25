# HustleCoin Public Repository — Agent Rules

Jesus Christ is the King. Amen.

This public repository is a public reference surface for HustleCoin. It must not expose secrets, private infrastructure details, private keys, internal credentials, private database data, or unpublished security implementation details.

## Public Truth Rules

- Do not claim a feature is deployed, production-ready, or settlement-ready without public evidence.
- Do not publish private wallet credentials, API keys, signing secrets, database URIs, internal admin keys, or private user data.
- Do not copy private-repository implementation details into this repo unless they are explicitly approved for public release.
- Public documentation may summarize architecture and progress, but must preserve truth-level wording.

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

Safe public wording as of 2026-09-25:

- canonical NFT listing, identity-provenance, and activation-policy foundations have been developed and tested in protected development work;
- live integration/reconciliation is still being completed;
- authoritative NFT purchase settlement, NFT transfer settlement, and HC Crypto activation payment settlement must not be described as production-ready.

## Change Discipline

- Prefer documentation-only or clearly scoped public changes.
- Do not modify production-sensitive behavior from this public mirror without explicit owner authorization.
- Keep commits small and explain architecture/safety impact.
- Never weaken validation to make a demo pass.

## Reporting

Use explicit evidence labels where relevant:

- `SOURCE_EXISTS`
- `TEST_PROVEN`
- `RUNTIME_READ_PROVEN`
- `DEPLOYED_PROVEN`

Never collapse these into a single claim.
