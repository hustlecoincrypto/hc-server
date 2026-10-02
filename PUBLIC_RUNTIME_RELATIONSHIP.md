# HustleCoin Public Runtime Relationship

Status date: **2026-10-01**

## Purpose

This document explains the relationship between:

1. the public GitHub reference repository (`hc-server`);
2. the protected HustleCoin hybrid development repository;
3. the protected HustleCoin chain-support repository;
4. the live gameplay backend at `https://hustlecoin-backend.fly.dev`; and
5. the live chain-support service at `https://hustlecoin-chain.fly.dev`.

It exists to prevent separate authority and deployment surfaces from being incorrectly treated as one source of truth.

## Authority Map

### Public GitHub reference — `hc-server`

Role:

- public architecture/reference surface;
- public-safe progress documentation;
- public-safe example backend code;
- public deployment-status/provenance summaries.

It is **not**:

- the authoritative gameplay backend;
- the authoritative chain-support implementation;
- the source used to determine current Admin/Game Ops behavior;
- proof of what is deployed on either Fly service;
- a place to mirror private production implementation.

The root SQLAlchemy/FastAPI implementation is a legacy/reference scaffold and does not represent the protected Mongo-backed gameplay backend.

### Protected hybrid development repository

Role:

- authoritative gameplay/backend engineering;
- Admin/Game Ops implementation;
- Mongo-backed models and services;
- gameplay, economy, SafeLock, marketplace, payout-authorization, and Web3 integration reconciliation;
- backend and APK integration testing.

Protected source remains private and must not be copied into this public repository unless explicitly approved for publication.

### Protected chain-support repository

Role:

- wallet signature verification;
- NFT/wallet asset and ownership evidence;
- chain-facing verification support;
- narrowly authorized internal payout execution support;
- health/readiness for the chain-support runtime.

It does **not** own gameplay balances, gameplay rewards, claim eligibility, weekly tracking, leaderboard authority, land economy, or Admin activation policy.

The chain-support service talks to the gameplay backend through an authenticated service boundary. This makes backend/chain compatibility a required release gate, but does not make the chain service a gameplay authority.

### Public gameplay Fly runtime

Endpoint:

`https://hustlecoin-backend.fly.dev`

Role:

- public gameplay backend contacted by the HustleCoin APK and Admin dashboard.

### Public chain-support Fly runtime

Endpoint:

`https://hustlecoin-chain.fly.dev`

Role:

- public chain-support service used for wallet/NFT evidence and approved execution-support paths.

The exact Git commit producing the currently running image for each service must be proven independently.

## Current Synchronization Gaps

There are two different synchronization problems:

```text
PROTECTED GAMEPLAY/BACKEND WORK
    !=
CURRENTLY PROVEN GAMEPLAY FLY RUNTIME
```

and

```text
PROTECTED CHAIN WORK
    !=
CURRENTLY PROVEN CHAIN FLY RUNTIME
```

In addition, related chain code exists in protected hybrid development and is not byte-identical to the dedicated chain repository. That duplication creates a drift risk.

The public `hc-server` repository must not resolve that drift by copying private source. The authoritative repositories must reconcile the service contract and deployment source privately, then publish only sanitized evidence here.

## Correct Synchronization Model

```text
                 hc-server
          public truth/reference only
                     ▲
                     │ sanitized evidence
                     │
protected gameplay/backend ───── protected chain-support
          │                              │
          │ tested contract              │ tested contract
          └────────── compatibility ─────┘
          │                              │
          ▼                              ▼
hustlecoin-backend.fly.dev      hustlecoin-chain.fly.dev
```

For gameplay/backend releases:

```text
reviewed backend candidate
→ focused + Mongo + broad regression evidence
→ immutable source SHA
→ explicit owner deployment authorization
→ Fly deployment
→ health + Admin/Game Ops + login + gameplay smoke
→ GitHub deployment evidence
→ public-safe hc-server status update
```

For chain-support releases:

```text
reviewed chain candidate
→ chain unit + Mongo + wallet + contract tests
→ backend/chain compatibility evidence
→ immutable source SHA
→ explicit owner deployment authorization
→ Fly deployment
→ health/readiness + wallet/NFT contract smoke
→ GitHub deployment evidence
→ public-safe hc-server status update
```

Do **not** synchronize by copying private backend or chain code into `hc-server`.

## Current Baseline Blocker

The clean-main gameplay baseline is currently blocked before application execution because the disposable Mongo instance becomes unreachable before replica-set initialization.

Therefore:

`CLEAN_MAIN_REACHED_TEST_BODY = NO`

`MISSION_NOT_FOUND_REPRODUCED = NO`

`PR120_REGRESSION_INTRODUCED = UNKNOWN`

This infrastructure result must not be converted into a gameplay diagnosis.

## GitHub Evidence Requirements

### Protected repository records

Successful test evidence should record:

- source SHA;
- base SHA;
- exact test commands;
- pass/fail counts;
- invariant checks;
- known unresolved failures;
- UTC timestamp;
- cross-service compatibility evidence when applicable.

Successful deployment evidence should record:

- exact deployed source SHA;
- Fly release/image identity;
- deployment UTC timestamp;
- health/readiness result;
- relevant smoke-test results;
- rollback reference.

### Public repository record

After deployment is verified, this repository may publish a sanitized summary. Do not publish secrets, private database information, private source code, signing material, or other protected implementation details.

## Truth Rule

`SOURCE_EXISTS != TEST_PROVEN != RUNTIME_READ_PROVEN != DEPLOYED_PROVEN`

A feature is public production truth only when its runtime deployment and verification are proven.
