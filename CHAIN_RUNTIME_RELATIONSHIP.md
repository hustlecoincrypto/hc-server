# HustleCoin Chain-Support Relationship

Status date: **2026-10-01**

## Conclusion

The HustleCoin chain service is necessary to the overall HustleCoin system, but it should **not** be synchronized into `hc-server` as source code.

`hc-server` is a public reference/status repository.

The dedicated chain repository and the protected hybrid repository remain private engineering surfaces.

## What the chain service is for

The chain-support service provides:

- wallet-signature verification;
- NFT and wallet asset evidence;
- recognized ownership reference;
- chain-facing metadata/asset normalization support;
- narrowly authorized internal payout execution support;
- service health/readiness.

It is intentionally not the authority for:

- Game HC balances;
- gameplay rewards;
- mission progression;
- weekly competition state;
- leaderboard state;
- land economy;
- Admin activation;
- SafeLock eligibility;
- claim/release authorization.

## Required Authority Boundary

```text
CHAIN:
prove/support Web3 facts and execute only authorized actions

BACKEND:
decide gameplay, eligibility, entitlement, policy, and release authority
```

Therefore:

`CHAIN_EVIDENCE != GAMEPLAY_PERMISSION`

`WALLET_OWNERSHIP != ACTIVATION`

`EXECUTION_SUPPORT != PAYOUT_AUTHORIZATION`

`CHAIN_SERVICE != GAMEPLAY_BACKEND`

## Current private-source relationship

Current protected development contains two related chain-code surfaces:

1. the dedicated `hustlecoin-chain` repository;
2. a `server/` integration surface inside the protected hybrid repository.

They are not currently identical. This creates a synchronization/drift risk.

The safe long-term rule is:

- one authoritative deployment source for `hustlecoin-chain.fly.dev`;
- explicit compatibility tests between chain and backend;
- no silent two-way copying;
- no assumption that a matching filename means matching behavior;
- no chain deployment unless the exact source SHA and compatibility evidence are recorded.

Which private surface becomes the canonical chain deployment source must be established by protected-repository reconciliation and owner approval. `hc-server` must not make that choice by mirroring private code.

## Open chain work

Open protected chain work includes canonical Web3 authority-history changes and payout-authorization V2 work. These remain under review and must not be represented as deployed public truth until their review, test, deployment, and runtime evidence gates are complete.

## What hc-server should contain

This public repository should contain only sanitized relationship/provenance information:

- that a separate chain-support runtime exists;
- its public role in the architecture;
- the backend/chain authority boundary;
- whether a chain deployment is proven;
- sanitized health/compatibility status after verification.

It should not contain:

- private chain source;
- private contracts or internal authentication design beyond approved public summaries;
- secrets;
- wallet credentials;
- private payout implementation;
- private database details.

## Release Evidence

A successful chain release should produce a protected GitHub record containing:

```text
CHAIN_SOURCE_SHA=
CHAIN_BASE_SHA=
CHAIN_TESTS=
CHAIN_MONGO_TESTS=
WALLET_VERIFICATION_TESTS=
BACKEND_COMPATIBILITY=PASS/FAIL

FLY_APP=hustlecoin-chain
FLY_RELEASE=
FLY_IMAGE=
HEALTHZ=
READYZ=
WALLET_ASSET_SMOKE=
DEPLOYED_AT_UTC=
```

Only after those facts are proven should `hc-server` receive a sanitized public update.

## Public Synchronization Rule

`hc-server` synchronizes **truth and provenance**, not private implementation.
