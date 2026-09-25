# HustleCoin Public Backend Reference

HustleCoin is a gameplay-first economy game with optional Web3/NFT participation.

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

As of 2026-09-25, protected development work has established tested foundations for canonical NFT listings, identity provenance, and Admin-configured HC Crypto activation policy. Live runtime reconciliation is still being completed.

The following must **not** be described as production-ready yet:

- NFT purchase settlement;
- NFT transfer settlement;
- HC Crypto activation payment settlement;
- end-to-end live NFT marketplace reconciliation.

## Repository Role

This public repository is a reference surface. It does not expose private credentials, signing material, private user data, or unpublished production internals.

Agents and contributors should read `AGENTS.md` before changing this repository.
