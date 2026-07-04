"""
HustleCoin Matchday Events Prototype — FastAPI backend.

SAFETY: This is a demo-only prototype. No production connections. All data lives
in an isolated MongoDB DB with the `mde_` collection prefix and is seeded from
this file. Game HC values are cosmetic; there is no real payout, no wallet
integration, no betting/odds.
"""
from __future__ import annotations

import asyncio
import logging
import os
import random
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collection namespace to keep prototype isolated
C_EVENTS = db["mde_events"]
C_MISSIONS = db["mde_missions"]
C_LEADERBOARD = db["mde_leaderboard"]
C_REWARDS = db["mde_rewards_review"]
C_CALENDAR = db["mde_calendar_slots"]
C_SAFELOCK = db["mde_safelock_decisions"]
C_AUDIT = db["mde_audit_log"]
C_PLAYER = db["mde_player_state"]
C_QUIZ_ANSWERS = db["mde_quiz_answers"]

app = FastAPI(title="HustleCoin Matchday Events Prototype")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("mde")


# ────────────────────────────────────────────────────────────────────────────
# Utility
# ────────────────────────────────────────────────────────────────────────────
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def strip_id(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


# ────────────────────────────────────────────────────────────────────────────
# Pydantic models (response shapes)
# ────────────────────────────────────────────────────────────────────────────
EventPhase = Literal["PRE_MATCH", "FIRST_HALF", "HALFTIME", "SECOND_HALF", "FULLTIME", "REWARDS_REVIEW"]
EventStatus = Literal["DRAFT", "APPROVED", "PUBLISHED", "LIVE", "COMPLETED", "REWARDS_REVIEW", "RETIRED"]
Rarity = Literal["COMMON", "RARE", "EPIC", "LEGENDARY"]
SafeLockStatus = Literal[
    "APPROVED",
    "REDUCED_POOL",
    "WAITING_FOR_ACTIVITY",
    "BLOCKED_LOW_RESERVE",
    "BLOCKED_WEEKLY_CAP",
    "BLOCKED_ABUSE_RISK",
    "ADMIN_REVIEW_REQUIRED",
]


class MatchState(BaseModel):
    team_home: str
    team_away: str
    score_home: int
    score_away: int
    minute: int
    phase: EventPhase


class RewardTier(BaseModel):
    rank: int
    game_hc: int


class Event(BaseModel):
    id: str
    slug: str
    title: str
    subtitle: str
    kind: Literal["LIVE_MATCH", "DAILY_HUSTLE"]
    status: EventStatus
    rarity: Rarity
    region: str
    kickoff_iso: str
    match: Optional[MatchState] = None
    reward_tiers: List[RewardTier] = []
    requested_pool: int = 0
    approved_pool: int = 0
    joined_users: int = 0
    total_players_display: int = 0
    activity_level: Literal["LOW", "MEDIUM", "HIGH"] = "MEDIUM"
    risk_level: Literal["LOW", "MEDIUM", "HIGH"] = "LOW"
    created_at: str = Field(default_factory=now_iso)


class Mission(BaseModel):
    id: str
    event_id: str
    kind: Literal["PRE_QUIZ", "SUPPORT_TEAM", "HALFTIME_QUIZ", "FINAL_WHISTLE", "COMMUNITY_FAN", "CHECK_IN"]
    title_pt: str
    description_pt: str
    points: int
    question: Optional[str] = None
    options: List[str] = []
    correct_index: Optional[int] = None
    status: Literal["OPEN", "LOCKED", "COMPLETED"] = "OPEN"


class LeaderboardEntry(BaseModel):
    id: str
    event_id: str
    display_name: str
    country: str
    points: int
    is_user: bool = False


class RewardReviewItem(BaseModel):
    id: str
    event_id: str
    event_title: str
    winner_display_name: str
    rank: int
    points: int
    game_hc: int
    status: Literal["PENDING_REVIEW", "APPROVED", "REDUCED", "FROZEN", "BLOCKED"]
    reason: Optional[str] = None
    audit_note: Optional[str] = None


class CalendarSlot(BaseModel):
    id: str
    slot_type: Literal["DAILY", "WEEKLY", "MATCHDAY", "SPECIAL"]
    title_pt: str
    starts_iso: str
    ends_iso: str
    status: EventStatus
    countdown_seconds: int = 0


class SafeLockDecision(BaseModel):
    id: str
    event_id: str
    event_title: str
    rarity: Rarity
    requested_pool: int
    approved_pool: int
    fund_balance: int
    weekly_cap_remaining: int
    eligible_users_estimate: int
    joined_users: int
    activity_level: str
    risk_level: str
    status: SafeLockStatus
    reason: str
    updated_at: str


class AuditLogItem(BaseModel):
    id: str
    at_iso: str
    actor: str
    action: str
    target: str
    severity: Literal["INFO", "WARN", "HIGH"]
    detail: str


# ────────────────────────────────────────────────────────────────────────────
# Seeding
# ────────────────────────────────────────────────────────────────────────────
SEED_MARKER = "mde_seed_v1"

# Fixed IDs so links resolve deterministically
EVT_LIVE = "evt-live-brasil-noruega"
EVT_MATCHDAY = "evt-matchday-hustle"
EVT_DERBY = "evt-derby-hustle"
EVT_CHAMPIONS = "evt-champions-hustle"
EVT_FINAL = "evt-final-hustle"
EVT_DAILY = "evt-hustle-diario"


def seed_events() -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return [
        Event(
            id=EVT_LIVE,
            slug="global-football-cup-2026-r16",
            title="Global Football Cup 2026",
            subtitle="Oitavos de Final",
            kind="LIVE_MATCH",
            status="LIVE",
            rarity="LEGENDARY",
            region="GLOBAL",
            kickoff_iso=(now - timedelta(minutes=67)).isoformat(),
            match=MatchState(
                team_home="Brasil",
                team_away="Noruega",
                score_home=2,
                score_away=1,
                minute=67,
                phase="SECOND_HALF",
            ),
            reward_tiers=[
                RewardTier(rank=1, game_hc=10000),
                RewardTier(rank=2, game_hc=5000),
                RewardTier(rank=3, game_hc=2500),
            ],
            requested_pool=25000,
            approved_pool=18000,
            joined_users=3842,
            total_players_display=3842,
            activity_level="HIGH",
            risk_level="LOW",
        ).dict(),
        Event(
            id=EVT_DAILY,
            slug="hustle-diario",
            title="Hustle Diário",
            subtitle="Missão diária de fãs",
            kind="DAILY_HUSTLE",
            status="LIVE",
            rarity="COMMON",
            region="GLOBAL",
            kickoff_iso=now.isoformat(),
            reward_tiers=[RewardTier(rank=1, game_hc=800)],
            requested_pool=2000,
            approved_pool=2000,
            joined_users=612,
            total_players_display=612,
            activity_level="MEDIUM",
            risk_level="LOW",
        ).dict(),
        Event(
            id=EVT_MATCHDAY,
            slug="matchday-hustle",
            title="Matchday Hustle",
            subtitle="Ganha pontos durante o dia de jogo",
            kind="DAILY_HUSTLE",
            status="PUBLISHED",
            rarity="RARE",
            region="AFRICA",
            kickoff_iso=(now + timedelta(hours=3)).isoformat(),
            reward_tiers=[
                RewardTier(rank=1, game_hc=3000),
                RewardTier(rank=2, game_hc=1500),
            ],
            requested_pool=8000,
            approved_pool=8000,
            joined_users=940,
            total_players_display=940,
            activity_level="MEDIUM",
            risk_level="LOW",
        ).dict(),
        Event(
            id=EVT_DERBY,
            slug="derby-hustle",
            title="Derby Hustle",
            subtitle="Rivalidade local — pontos em dobro",
            kind="DAILY_HUSTLE",
            status="APPROVED",
            rarity="RARE",
            region="EUROPE",
            kickoff_iso=(now + timedelta(days=1)).isoformat(),
            reward_tiers=[RewardTier(rank=1, game_hc=4000)],
            requested_pool=10000,
            approved_pool=6500,
            joined_users=0,
            total_players_display=0,
            activity_level="LOW",
            risk_level="MEDIUM",
        ).dict(),
        Event(
            id=EVT_CHAMPIONS,
            slug="champions-hustle",
            title="Champions Hustle",
            subtitle="Noite de champions — quiz especial",
            kind="DAILY_HUSTLE",
            status="APPROVED",
            rarity="EPIC",
            region="GLOBAL",
            kickoff_iso=(now + timedelta(days=2)).isoformat(),
            reward_tiers=[
                RewardTier(rank=1, game_hc=6000),
                RewardTier(rank=2, game_hc=3000),
                RewardTier(rank=3, game_hc=1500),
            ],
            requested_pool=15000,
            approved_pool=0,
            joined_users=0,
            total_players_display=0,
            activity_level="LOW",
            risk_level="LOW",
        ).dict(),
        Event(
            id=EVT_FINAL,
            slug="final-hustle",
            title="Final Hustle",
            subtitle="Grande final — recompensa máxima",
            kind="DAILY_HUSTLE",
            status="DRAFT",
            rarity="LEGENDARY",
            region="GLOBAL",
            kickoff_iso=(now + timedelta(days=6)).isoformat(),
            reward_tiers=[
                RewardTier(rank=1, game_hc=20000),
                RewardTier(rank=2, game_hc=10000),
                RewardTier(rank=3, game_hc=5000),
            ],
            requested_pool=60000,
            approved_pool=0,
            joined_users=0,
            total_players_display=0,
            activity_level="LOW",
            risk_level="HIGH",
        ).dict(),
    ]


def seed_missions() -> List[Dict[str, Any]]:
    return [
        Mission(
            id="mis-pre-quiz",
            event_id=EVT_LIVE,
            kind="PRE_QUIZ",
            title_pt="Quiz pré-jogo",
            description_pt="Responde às 3 perguntas de conhecimento de futebol antes do apito inicial.",
            points=150,
            question="Quantas vezes Brasil venceu o Mundial de Futebol?",
            options=["3", "4", "5", "6"],
            correct_index=2,
            status="COMPLETED",
        ).dict(),
        Mission(
            id="mis-support",
            event_id=EVT_LIVE,
            kind="SUPPORT_TEAM",
            title_pt="Apoia a tua equipa",
            description_pt="Escolhe uma equipa e ganha pontos por cada golo marcado.",
            points=200,
            status="COMPLETED",
        ).dict(),
        Mission(
            id="mis-half-quiz",
            event_id=EVT_LIVE,
            kind="HALFTIME_QUIZ",
            title_pt="Quiz do intervalo",
            description_pt="Responde ao quiz relâmpago durante o intervalo.",
            points=250,
            question="Quem marcou o primeiro golo da partida?",
            options=["Vinícius Jr.", "Rodrygo", "Haaland", "Ødegaard"],
            correct_index=0,
            status="OPEN",
        ).dict(),
        Mission(
            id="mis-final",
            event_id=EVT_LIVE,
            kind="FINAL_WHISTLE",
            title_pt="Desafio do apito final",
            description_pt="Acerta no resultado final para ganhar pontos bónus.",
            points=400,
            question="Qual será o resultado final?",
            options=["Brasil ganha", "Empate", "Noruega ganha", "Prolongamento"],
            correct_index=0,
            status="LOCKED",
        ).dict(),
        Mission(
            id="mis-community",
            event_id=EVT_LIVE,
            kind="COMMUNITY_FAN",
            title_pt="Missão de fã comunitário",
            description_pt="Partilha o teu apoio no fórum da comunidade.",
            points=100,
            status="OPEN",
        ).dict(),
        Mission(
            id="mis-checkin",
            event_id=EVT_LIVE,
            kind="CHECK_IN",
            title_pt="Check-in num negócio local",
            description_pt="Faz check-in num café ou bar parceiro (demo).",
            points=80,
            status="OPEN",
        ).dict(),
    ]


def seed_leaderboard() -> List[Dict[str, Any]]:
    top_names = [
        ("Kaya_Angola", "AO", 2410),
        ("MessiFan10", "AR", 2260),
        ("LusoStriker", "PT", 2115),
        ("SambaKing", "BR", 2080),
        ("VikingRoar", "NO", 1995),
        ("EagleEye", "NG", 1930),
        ("BantuBoss", "AO", 1870),
        ("PitchGuru", "PT", 1802),
        ("GoalMachine", "BR", 1750),
        ("NorthStar", "NO", 1690),
        ("MidfieldMaestro", "AO", 1520),
        ("Tu (Você)", "AO", 1450),  # user @ 12º
        ("HalfSpaceHero", "PT", 1382),
        ("BackHeelBoi", "BR", 1290),
        ("CleanSheetCzar", "NO", 1245),
    ]
    entries = []
    for i, (name, country, points) in enumerate(top_names):
        entries.append(
            LeaderboardEntry(
                id=f"lb-{i+1:03d}",
                event_id=EVT_LIVE,
                display_name=name,
                country=country,
                points=points,
                is_user=(i == 11),
            ).dict()
        )
    return entries


def seed_rewards() -> List[Dict[str, Any]]:
    return [
        RewardReviewItem(
            id="rw-001",
            event_id=EVT_LIVE,
            event_title="Global Football Cup 2026 — Oitavos",
            winner_display_name="Kaya_Angola",
            rank=1,
            points=2410,
            game_hc=10000,
            status="PENDING_REVIEW",
            reason="Aguarda apito final e verificação SafeLock.",
        ).dict(),
        RewardReviewItem(
            id="rw-002",
            event_id=EVT_LIVE,
            event_title="Global Football Cup 2026 — Oitavos",
            winner_display_name="MessiFan10",
            rank=2,
            points=2260,
            game_hc=5000,
            status="PENDING_REVIEW",
        ).dict(),
        RewardReviewItem(
            id="rw-003",
            event_id=EVT_LIVE,
            event_title="Global Football Cup 2026 — Oitavos",
            winner_display_name="LusoStriker",
            rank=3,
            points=2115,
            game_hc=2500,
            status="PENDING_REVIEW",
        ).dict(),
        RewardReviewItem(
            id="rw-user",
            event_id=EVT_LIVE,
            event_title="Global Football Cup 2026 — Oitavos",
            winner_display_name="Tu (Você)",
            rank=12,
            points=1450,
            game_hc=200,
            status="PENDING_REVIEW",
            reason="Pool reduzido pelo SafeLock — em revisão.",
        ).dict(),
    ]


def seed_calendar() -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return [
        CalendarSlot(
            id="cal-daily",
            slot_type="DAILY",
            title_pt="Hustle Diário",
            starts_iso=now.replace(hour=0, minute=0).isoformat(),
            ends_iso=now.replace(hour=23, minute=59).isoformat(),
            status="LIVE",
            countdown_seconds=3600 * 8,
        ).dict(),
        CalendarSlot(
            id="cal-live",
            slot_type="MATCHDAY",
            title_pt="Global Football Cup — Oitavos",
            starts_iso=(now - timedelta(minutes=67)).isoformat(),
            ends_iso=(now + timedelta(minutes=30)).isoformat(),
            status="LIVE",
            countdown_seconds=1800,
        ).dict(),
        CalendarSlot(
            id="cal-matchday",
            slot_type="MATCHDAY",
            title_pt="Matchday Hustle",
            starts_iso=(now + timedelta(hours=3)).isoformat(),
            ends_iso=(now + timedelta(hours=6)).isoformat(),
            status="PUBLISHED",
            countdown_seconds=3 * 3600,
        ).dict(),
        CalendarSlot(
            id="cal-derby",
            slot_type="MATCHDAY",
            title_pt="Derby Hustle",
            starts_iso=(now + timedelta(days=1)).isoformat(),
            ends_iso=(now + timedelta(days=1, hours=3)).isoformat(),
            status="APPROVED",
            countdown_seconds=86400,
        ).dict(),
        CalendarSlot(
            id="cal-champ",
            slot_type="WEEKLY",
            title_pt="Champions Hustle",
            starts_iso=(now + timedelta(days=2)).isoformat(),
            ends_iso=(now + timedelta(days=2, hours=4)).isoformat(),
            status="APPROVED",
            countdown_seconds=2 * 86400,
        ).dict(),
        CalendarSlot(
            id="cal-final",
            slot_type="SPECIAL",
            title_pt="Final Hustle",
            starts_iso=(now + timedelta(days=6)).isoformat(),
            ends_iso=(now + timedelta(days=6, hours=5)).isoformat(),
            status="DRAFT",
            countdown_seconds=6 * 86400,
        ).dict(),
    ]


def seed_audit() -> List[Dict[str, Any]]:
    now = datetime.now(timezone.utc)
    return [
        AuditLogItem(
            id="aud-001",
            at_iso=(now - timedelta(minutes=45)).isoformat(),
            actor="admin@matchday",
            action="EVENT_PUBLISHED",
            target="evt-live-brasil-noruega",
            severity="INFO",
            detail="Global Football Cup 2026 — Oitavos published (LIVE).",
        ).dict(),
        AuditLogItem(
            id="aud-002",
            at_iso=(now - timedelta(minutes=30)).isoformat(),
            actor="safelock@engine",
            action="SAFELOCK_REDUCED_POOL",
            target="evt-live-brasil-noruega",
            severity="WARN",
            detail="Requested 25000 → Approved 18000 (reserve protection).",
        ).dict(),
        AuditLogItem(
            id="aud-003",
            at_iso=(now - timedelta(minutes=15)).isoformat(),
            actor="abuse@monitor",
            action="SUSPICIOUS_JOIN_PATTERN",
            target="user:acct-9821",
            severity="HIGH",
            detail="10 joins from same IP in 4 minutes — flagged.",
        ).dict(),
        AuditLogItem(
            id="aud-004",
            at_iso=(now - timedelta(minutes=10)).isoformat(),
            actor="admin@matchday",
            action="ACCOUNT_BLOCKED",
            target="user:acct-9821",
            severity="HIGH",
            detail="Blocked pending manual review.",
        ).dict(),
        AuditLogItem(
            id="aud-005",
            at_iso=(now - timedelta(minutes=5)).isoformat(),
            actor="admin@matchday",
            action="CALENDAR_SLOT_APPROVED",
            target="cal-champ",
            severity="INFO",
            detail="Champions Hustle window approved.",
        ).dict(),
    ]


async def ensure_seed():
    if await db.mde_meta.find_one({"_id": SEED_MARKER}):
        return
    logger.info("Seeding MDE prototype data...")

    await C_EVENTS.delete_many({})
    await C_MISSIONS.delete_many({})
    await C_LEADERBOARD.delete_many({})
    await C_REWARDS.delete_many({})
    await C_CALENDAR.delete_many({})
    await C_SAFELOCK.delete_many({})
    await C_AUDIT.delete_many({})
    await C_PLAYER.delete_many({})

    await C_EVENTS.insert_many(seed_events())
    await C_MISSIONS.insert_many(seed_missions())
    await C_LEADERBOARD.insert_many(seed_leaderboard())
    await C_REWARDS.insert_many(seed_rewards())
    await C_CALENDAR.insert_many(seed_calendar())
    await C_AUDIT.insert_many(seed_audit())

    # player state (single demo user)
    await C_PLAYER.insert_one(
        {
            "id": "player-me",
            "display_name": "Tu (Você)",
            "country": "AO",
            "level": 14,
            "activity_status": "ATIVO",
            "eligibility_notes": "Elegível para eventos LIVE e DAILY. Sem carteira obrigatória.",
            "wallet_connected": False,
            "joined_event_ids": [EVT_LIVE, EVT_DAILY],
            "rank": 12,
            "points": 1450,
        }
    )

    await db.mde_meta.insert_one({"_id": SEED_MARKER, "at": now_iso()})

    # Run initial SafeLock computation
    await recompute_safelock()

    logger.info("Seed complete.")


# ────────────────────────────────────────────────────────────────────────────
# SafeLock decision engine
# ────────────────────────────────────────────────────────────────────────────
DEMO_FUND_BALANCE = 925_000
WEEKLY_CAP_TOTAL = 60_000
WEEKLY_CAP_REMAINING_DEFAULT = 46_250


def compute_decision_for_event(evt: Dict[str, Any], fund_balance: int, weekly_cap_remaining: int) -> Dict[str, Any]:
    requested = evt.get("requested_pool", 0)
    rarity = evt.get("rarity", "COMMON")
    joined = evt.get("joined_users", 0)
    activity = evt.get("activity_level", "MEDIUM")
    risk = evt.get("risk_level", "LOW")

    approved = requested
    status: SafeLockStatus = "APPROVED"
    reason = "Requested pool fits reserve, activity healthy."

    # Rule 1: abuse risk hard block
    if risk == "HIGH":
        status = "BLOCKED_ABUSE_RISK"
        approved = 0
        reason = "Abuse/risk signals too high — blocked pending review."
    # Rule 2: weekly cap
    elif requested > weekly_cap_remaining:
        if weekly_cap_remaining <= 0:
            status = "BLOCKED_WEEKLY_CAP"
            approved = 0
            reason = "Weekly HC cap exhausted."
        else:
            status = "REDUCED_POOL"
            approved = weekly_cap_remaining
            reason = f"Weekly cap tight — reduced to remaining {weekly_cap_remaining} HC."
    # Rule 3: low reserve (guard 5% of fund)
    elif requested > fund_balance * 0.05:
        status = "REDUCED_POOL"
        approved = int(fund_balance * 0.05 * 0.9)
        reason = "Requested pool exceeds 5% reserve guard — reduced for protection."
    # Rule 4: low activity / high rarity
    elif rarity in ("EPIC", "LEGENDARY") and activity == "LOW" and joined < 500:
        status = "WAITING_FOR_ACTIVITY"
        approved = int(requested * 0.4)
        reason = "High-rarity event with low activity — waiting for engagement."
    elif rarity == "LEGENDARY" and joined == 0 and evt.get("status") == "DRAFT":
        status = "ADMIN_REVIEW_REQUIRED"
        approved = 0
        reason = "Legendary event in draft — admin review required before publish."
    else:
        # small reduction demo: featured LIVE evt matches Owner spec: 25000 → 18000
        if evt["id"] == EVT_LIVE and requested == 25000:
            approved = 18000
            status = "REDUCED_POOL"
            reason = "Activity healthy, reserve protection triggered demo reduction."

    return {"status": status, "approved": approved, "reason": reason}


async def recompute_safelock() -> List[Dict[str, Any]]:
    events = await C_EVENTS.find({}, {"_id": 0}).to_list(200)
    fund_balance = DEMO_FUND_BALANCE
    weekly_cap_remaining = WEEKLY_CAP_REMAINING_DEFAULT

    decisions: List[Dict[str, Any]] = []
    for evt in events:
        result = compute_decision_for_event(evt, fund_balance, weekly_cap_remaining)
        decision = SafeLockDecision(
            id=f"sl-{evt['id']}",
            event_id=evt["id"],
            event_title=f"{evt['title']} — {evt['subtitle']}",
            rarity=evt["rarity"],
            requested_pool=evt["requested_pool"],
            approved_pool=result["approved"],
            fund_balance=fund_balance,
            weekly_cap_remaining=weekly_cap_remaining,
            eligible_users_estimate=max(evt["joined_users"], 500) if evt["kind"] == "LIVE_MATCH" else max(evt["joined_users"], 100),
            joined_users=evt["joined_users"],
            activity_level=evt["activity_level"],
            risk_level=evt["risk_level"],
            status=result["status"],
            reason=result["reason"],
            updated_at=now_iso(),
        ).dict()

        # Persist approved pool back into event
        await C_EVENTS.update_one({"id": evt["id"]}, {"$set": {"approved_pool": result["approved"]}})
        await C_SAFELOCK.update_one({"id": decision["id"]}, {"$set": decision}, upsert=True)
        decisions.append(decision)

    await C_AUDIT.insert_one(
        AuditLogItem(
            id=new_id(),
            at_iso=now_iso(),
            actor="safelock@engine",
            action="SAFELOCK_RECOMPUTE",
            target="all_events",
            severity="INFO",
            detail=f"Recomputed {len(decisions)} decisions.",
        ).dict()
    )
    return decisions


# ────────────────────────────────────────────────────────────────────────────
# Auto-tick simulator: advances live match minute every 45s
# ────────────────────────────────────────────────────────────────────────────
_tick_task: Optional[asyncio.Task] = None


async def match_tick_loop():
    while True:
        try:
            evt = await C_EVENTS.find_one({"id": EVT_LIVE}, {"_id": 0})
            if evt and evt.get("status") == "LIVE" and evt.get("match"):
                match = evt["match"]
                phase = match["phase"]
                minute = match["minute"]

                if phase == "FIRST_HALF":
                    minute = min(45, minute + 1)
                    if minute >= 45:
                        match["phase"] = "HALFTIME"
                elif phase == "HALFTIME":
                    match["phase"] = "SECOND_HALF"
                elif phase == "SECOND_HALF":
                    minute = min(90, minute + 1)
                    if minute >= 90:
                        match["phase"] = "FULLTIME"
                elif phase == "PRE_MATCH":
                    match["phase"] = "FIRST_HALF"
                    minute = 1

                match["minute"] = minute
                await C_EVENTS.update_one({"id": EVT_LIVE}, {"$set": {"match": match}})
        except Exception as e:
            logger.warning("tick error: %s", e)
        await asyncio.sleep(45)


# ────────────────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {"app": "hustlecoin-matchday-events-prototype", "ok": True, "at": now_iso()}


@api_router.get("/dashboard")
async def dashboard():
    active = await C_EVENTS.find_one({"id": EVT_LIVE}, {"_id": 0})
    upcoming = await C_EVENTS.find_one({"id": EVT_MATCHDAY}, {"_id": 0})
    safelock = await C_SAFELOCK.find_one({"event_id": EVT_LIVE}, {"_id": 0})
    player = await C_PLAYER.find_one({"id": "player-me"}, {"_id": 0})
    rewards = await C_REWARDS.find({"winner_display_name": "Tu (Você)"}, {"_id": 0}).to_list(10)
    return {
        "player": player,
        "active_event": active,
        "next_event": upcoming,
        "safelock_summary": safelock,
        "reward_status": rewards[0] if rewards else None,
        "activity_status": player["activity_status"] if player else "ATIVO",
    }


@api_router.get("/events")
async def list_events(status: Optional[str] = None):
    query: Dict[str, Any] = {}
    if status:
        query["status"] = status
    items = await C_EVENTS.find(query, {"_id": 0}).to_list(200)
    return items


@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    evt = await C_EVENTS.find_one({"id": event_id}, {"_id": 0})
    if not evt:
        raise HTTPException(404, "Event not found")
    return evt


class EventCreate(BaseModel):
    title: str
    subtitle: str = ""
    team_home: Optional[str] = None
    team_away: Optional[str] = None
    kickoff_iso: Optional[str] = None
    region: str = "GLOBAL"
    rarity: Rarity = "COMMON"
    requested_pool: int = 1000


@api_router.post("/events")
async def create_event(payload: EventCreate):
    now = datetime.now(timezone.utc)
    evt = Event(
        id=new_id(),
        slug=payload.title.lower().replace(" ", "-")[:40],
        title=payload.title,
        subtitle=payload.subtitle,
        kind="LIVE_MATCH" if payload.team_home else "DAILY_HUSTLE",
        status="DRAFT",
        rarity=payload.rarity,
        region=payload.region,
        kickoff_iso=payload.kickoff_iso or (now + timedelta(hours=1)).isoformat(),
        match=MatchState(
            team_home=payload.team_home or "TBD",
            team_away=payload.team_away or "TBD",
            score_home=0,
            score_away=0,
            minute=0,
            phase="PRE_MATCH",
        ) if payload.team_home else None,
        reward_tiers=[RewardTier(rank=1, game_hc=1000)],
        requested_pool=payload.requested_pool,
        approved_pool=0,
        joined_users=0,
        total_players_display=0,
        activity_level="LOW",
        risk_level="LOW",
    ).dict()
    await C_EVENTS.insert_one(evt.copy())
    strip_id(evt)
    await C_AUDIT.insert_one(
        AuditLogItem(
            id=new_id(),
            at_iso=now_iso(),
            actor="admin@matchday",
            action="EVENT_CREATED",
            target=evt["id"],
            severity="INFO",
            detail=f"Created {evt['title']}",
        ).dict()
    )
    await recompute_safelock()
    return evt


class EventUpdate(BaseModel):
    status: Optional[EventStatus] = None
    score_home: Optional[int] = None
    score_away: Optional[int] = None
    minute: Optional[int] = None
    phase: Optional[EventPhase] = None


@api_router.patch("/events/{event_id}")
async def update_event(event_id: str, payload: EventUpdate):
    evt = await C_EVENTS.find_one({"id": event_id}, {"_id": 0})
    if not evt:
        raise HTTPException(404, "Event not found")

    updates: Dict[str, Any] = {}
    if payload.status:
        updates["status"] = payload.status
    match = evt.get("match")
    if match:
        if payload.score_home is not None:
            match["score_home"] = payload.score_home
        if payload.score_away is not None:
            match["score_away"] = payload.score_away
        if payload.minute is not None:
            match["minute"] = payload.minute
        if payload.phase:
            match["phase"] = payload.phase
        updates["match"] = match

    if updates:
        await C_EVENTS.update_one({"id": event_id}, {"$set": updates})

    await C_AUDIT.insert_one(
        AuditLogItem(
            id=new_id(),
            at_iso=now_iso(),
            actor="admin@matchday",
            action="EVENT_UPDATED",
            target=event_id,
            severity="INFO",
            detail=f"Updated: {list(updates.keys())}",
        ).dict()
    )
    return await C_EVENTS.find_one({"id": event_id}, {"_id": 0})


@api_router.post("/events/{event_id}/join")
async def join_event(event_id: str):
    evt = await C_EVENTS.find_one({"id": event_id}, {"_id": 0})
    if not evt:
        raise HTTPException(404, "Event not found")
    await C_PLAYER.update_one(
        {"id": "player-me"}, {"$addToSet": {"joined_event_ids": event_id}}
    )
    await C_EVENTS.update_one({"id": event_id}, {"$inc": {"joined_users": 1, "total_players_display": 1}})
    return {"ok": True, "event_id": event_id, "message": "Participação confirmada."}


@api_router.get("/missions/{event_id}")
async def list_missions(event_id: str):
    items = await C_MISSIONS.find({"event_id": event_id}, {"_id": 0}).to_list(200)
    return items


class QuizSubmit(BaseModel):
    mission_id: str
    selected_index: int


@api_router.post("/quiz/submit")
async def submit_quiz(payload: QuizSubmit):
    mis = await C_MISSIONS.find_one({"id": payload.mission_id}, {"_id": 0})
    if not mis:
        raise HTTPException(404, "Mission not found")
    correct = mis.get("correct_index") == payload.selected_index
    await C_MISSIONS.update_one(
        {"id": payload.mission_id}, {"$set": {"status": "COMPLETED"}}
    )
    if correct:
        await C_PLAYER.update_one({"id": "player-me"}, {"$inc": {"points": mis["points"]}})
    return {"correct": correct, "points_awarded": mis["points"] if correct else 0, "correct_index": mis.get("correct_index")}


@api_router.get("/leaderboard/{event_id}")
async def get_leaderboard(event_id: str):
    entries = await C_LEADERBOARD.find({"event_id": event_id}, {"_id": 0}).sort("points", -1).to_list(200)
    return entries


@api_router.get("/rewards")
async def list_rewards():
    items = await C_REWARDS.find({}, {"_id": 0}).to_list(200)
    return items


class RewardAction(BaseModel):
    reward_id: str
    action: Literal["APPROVE", "REDUCE", "FREEZE", "BLOCK"]
    audit_note: Optional[str] = None
    reduced_amount: Optional[int] = None


@api_router.post("/reward-review/action")
async def reward_action(payload: RewardAction):
    reward = await C_REWARDS.find_one({"id": payload.reward_id}, {"_id": 0})
    if not reward:
        raise HTTPException(404, "Reward not found")
    new_status = {
        "APPROVE": "APPROVED",
        "REDUCE": "REDUCED",
        "FREEZE": "FROZEN",
        "BLOCK": "BLOCKED",
    }[payload.action]
    updates = {"status": new_status, "audit_note": payload.audit_note}
    if payload.action == "REDUCE" and payload.reduced_amount is not None:
        updates["game_hc"] = payload.reduced_amount
    await C_REWARDS.update_one({"id": payload.reward_id}, {"$set": updates})
    await C_AUDIT.insert_one(
        AuditLogItem(
            id=new_id(),
            at_iso=now_iso(),
            actor="admin@matchday",
            action=f"REWARD_{payload.action}",
            target=payload.reward_id,
            severity="INFO" if payload.action == "APPROVE" else "WARN",
            detail=payload.audit_note or f"Reward {payload.action.lower()}d",
        ).dict()
    )
    return await C_REWARDS.find_one({"id": payload.reward_id}, {"_id": 0})


@api_router.get("/calendar")
async def list_calendar():
    items = await C_CALENDAR.find({}, {"_id": 0}).to_list(200)
    return items


class CalendarUpdate(BaseModel):
    status: EventStatus


@api_router.patch("/calendar/{slot_id}")
async def update_calendar(slot_id: str, payload: CalendarUpdate):
    slot = await C_CALENDAR.find_one({"id": slot_id}, {"_id": 0})
    if not slot:
        raise HTTPException(404, "Slot not found")
    await C_CALENDAR.update_one({"id": slot_id}, {"$set": {"status": payload.status}})
    await C_AUDIT.insert_one(
        AuditLogItem(
            id=new_id(),
            at_iso=now_iso(),
            actor="admin@matchday",
            action=f"CALENDAR_SLOT_{payload.status}",
            target=slot_id,
            severity="INFO",
            detail=f"Slot {slot['title_pt']} → {payload.status}",
        ).dict()
    )
    return await C_CALENDAR.find_one({"id": slot_id}, {"_id": 0})


@api_router.get("/safelock")
async def get_safelock():
    decisions = await C_SAFELOCK.find({}, {"_id": 0}).to_list(200)
    return {
        "fund_balance": DEMO_FUND_BALANCE,
        "weekly_cap_total": WEEKLY_CAP_TOTAL,
        "weekly_cap_remaining": WEEKLY_CAP_REMAINING_DEFAULT,
        "active_today": sum(1 for d in decisions if d["status"] in ("APPROVED", "REDUCED_POOL")),
        "scheduled_this_week": len(decisions),
        "decisions": decisions,
    }


@api_router.post("/safelock/recompute")
async def safelock_recompute():
    decisions = await recompute_safelock()
    return {"ok": True, "count": len(decisions), "decisions": decisions}


@api_router.get("/audit-log")
async def get_audit_log():
    items = await C_AUDIT.find({}, {"_id": 0}).sort("at_iso", -1).to_list(500)
    return items


@api_router.get("/verdict")
async def verdict():
    return {"verdict": "MATCHDAY_EVENTS_PROTOTYPE_READY", "at": now_iso()}


# ────────────────────────────────────────────────────────────────────────────
# App wiring
# ────────────────────────────────────────────────────────────────────────────
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    await ensure_seed()
    global _tick_task
    _tick_task = asyncio.create_task(match_tick_loop())


@app.on_event("shutdown")
async def on_shutdown():
    if _tick_task:
        _tick_task.cancel()
    client.close()
