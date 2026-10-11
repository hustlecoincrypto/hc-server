# Public Reference Influence Map

Review date: 2026-10-10

## Purpose

This repository is a public reference and provenance surface. It is not the authoritative source for the live gameplay backend or chain-support runtime.

## What currently influences work

| Surface | Current influence | Safe interpretation |
| --- | --- | --- |
| `AGENTS.md` | Governs agent behavior in this repository | Read first. It defines public-safety, authority, and evidence rules. |
| `README.md` | First user-facing orientation | Use for repository role and public wording, not production implementation claims. |
| `PUBLIC_RUNTIME_RELATIONSHIP.md` | Explains service boundaries and deployment evidence | Use to prevent public mirror, protected source, and Fly runtime conflation. |
| `CHAIN_RUNTIME_RELATIONSHIP.md` | Explains chain-support boundaries | Use to keep chain evidence and execution support subordinate to gameplay authority. |
| Root Python files and `routers/` | Executable legacy/reference scaffold | They can influence local demos, imports, tests, and agent assumptions if run. They do not prove current gameplay, Mongo, Admin, SafeLock, payout, marketplace, or chain behavior. |
| `requirements.txt` | Defines dependencies for the legacy scaffold | It does not define the protected gameplay or chain runtime environment. |
| `.gitignore` | Protects local environment and database artifacts | It does not prove that runtime secrets, databases, or deployment state are safe elsewhere. |

## Legacy scaffold effects

If someone runs the root FastAPI application locally, it:

- imports the SQLAlchemy models and routers;
- creates database tables through `Base.metadata.create_all`;
- defaults to a local SQLite database when `DATABASE_URL` is absent;
- exposes legacy `/users`, `/auth`, and `/transactions` routes;
- defaults JWT signing to a development value when `SECRET_KEY` is absent;
- is not an approved production deployment path.

These effects are local reference behavior only. Do not connect the production APK, Admin dashboard, production database, or live Fly services to this scaffold.

## Current authority map

- Gameplay balances, rewards, missions, progression, leaderboard, Land, eligibility, entitlement, Admin policy, SafeLock, and release/claim authorization remain backend-authoritative in protected development.
- Chain-support services provide wallet/NFT evidence and narrowly authorized execution support.
- Chain evidence does not grant gameplay benefits by itself.
- `hc-server` publishes sanitized truth and provenance only.

## Outdated or time-sensitive material

The relationship documents previously used a 2026-10-01 status date. Date-sensitive statements must be reverified before being repeated as current. A status sentence is historical unless it includes current evidence for source SHA, test evidence, runtime read evidence, deployment identity, and timestamp.

Do not update public progress from local tests alone. Do not copy protected implementation into this repository to make the documents look synchronized.

## Required review sequence

1. Read `AGENTS.md` and this map.
2. Identify whether the requested work is public documentation, legacy scaffold maintenance, protected gameplay work, or protected chain work.
3. Verify the current protected source, contract, runtime, and deployment evidence before making a public claim.
4. Keep legacy scaffold changes separate from public status updates.
5. Report `SOURCE_EXISTS`, `TEST_PROVEN`, `RUNTIME_READ_PROVEN`, and `DEPLOYED_PROVEN` independently.
