# HustleCoin Public Runtime Relationship

Status date: **2026-10-01**

## Purpose

This document explains the relationship between:

1. the public GitHub reference repository (`hc-server`);
2. the protected HustleCoin hybrid development repository; and
3. the live public backend at `https://hustlecoin-backend.fly.dev`.

It exists to prevent three different systems from being incorrectly treated as one source of truth.

## Authority Map

### Public GitHub reference — `hc-server`

Role:

- public architecture/reference surface;
- public-safe progress documentation;
- public-safe example backend code;
- public deployment-status/provenance summaries.

It is **not**:

- the authoritative gameplay backend;
- the source used to determine current Admin/Game Ops behavior;
- proof of what is deployed on Fly;
- a place to mirror private production implementation.

The root SQLAlchemy/FastAPI implementation is a legacy/reference scaffold and does not represent the protected Mongo-backed gameplay backend.

### Protected hybrid development repository

Role:

- authoritative gameplay/backend engineering;
- Admin/Game Ops implementation;
- Mongo-backed models and services;
- gameplay, economy, SafeLock, marketplace, payout, and Web3 authority reconciliation;
- backend and APK integration testing.

Protected source remains private and must not be copied into this public repository unless explicitly approved for publication.

### Public Fly runtime

Endpoint:

`https://hustlecoin-backend.fly.dev`

Role:

- public backend actually contacted by the HustleCoin APK and Admin dashboard.

Current evidence confirms that the service is live and healthy, but the exact Git commit that produced the currently running Fly image has not yet been proven through a complete source-to-image provenance chain.

Therefore:

`LIVE_RUNTIME_IDENTIFIED = YES`

`LIVE_SOURCE_SHA_PROVEN = NO`

## Current Synchronization Gap

The key synchronization problem is **not** that `hc-server` is missing private source files.

The actual gap is:

`PROTECTED_BACKEND_WORK != CURRENTLY_PROVEN_PUBLIC_RUNTIME`

Newer Admin/Game Ops and gameplay reconciliation work exists in protected development, while production deployment provenance and broad gameplay regression reconciliation are still incomplete.

The public repository must therefore not claim that those newer features are deployed.

## Correct Synchronization Model

The correct sequence is:

```text
protected gameplay/backend source
        ↓
reviewed candidate
        ↓
focused + Mongo + broad regression evidence
        ↓
immutable source SHA
        ↓
explicit owner deployment authorization
        ↓
Fly deployment
        ↓
health + Admin/Game Ops + login + gameplay smoke tests
        ↓
GitHub deployment evidence
        ↓
public-safe status update in hc-server
```

Do **not** synchronize by copying private backend code into `hc-server`.

## GitHub Evidence Requirements

### Protected repository record

Successful test evidence should record:

- source SHA;
- base SHA;
- exact test commands;
- pass/fail counts;
- invariant checks;
- known unresolved failures;
- UTC timestamp.

Successful deployment evidence should record:

- exact deployed source SHA;
- Fly release/image identity;
- deployment UTC timestamp;
- health result;
- Admin dashboard result;
- Game Ops result;
- normal login result;
- gameplay smoke result;
- rollback reference.

### Public repository record

After deployment is verified, this repository may publish a sanitized summary such as:

```text
DEPLOYED_PROVEN=YES
PUBLIC_BACKEND=https://hustlecoin-backend.fly.dev
ADMIN_GAME_OPS=PASS
NORMAL_LOGIN=PASS
GAMEPLAY_SMOKE=PASS
DEPLOYED_AT_UTC=<timestamp>
```

Do not publish secrets, private database information, private source code, signing material, or other protected implementation details.

## Truth Rule

`SOURCE_EXISTS != TEST_PROVEN != RUNTIME_READ_PROVEN != DEPLOYED_PROVEN`

A feature is public production truth only when its runtime deployment and verification are proven.
