"""HustleCoin Matchday Events Prototype — backend regression tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL") or "https://safelock-events-lab.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/") + "/api"

EVT_LIVE = "evt-live-brasil-noruega"
EVT_MATCHDAY = "evt-matchday-hustle"
EVT_DERBY = "evt-derby-hustle"
EVT_CHAMPIONS = "evt-champions-hustle"
EVT_FINAL = "evt-final-hustle"
EVT_DAILY = "evt-hustle-diario"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# ── Root / verdict ─────────────────────────────────────────
def test_root(s):
    r = s.get(f"{BASE_URL}/")
    assert r.status_code == 200
    assert r.json().get("ok") is True


def test_verdict(s):
    r = s.get(f"{BASE_URL}/verdict")
    assert r.status_code == 200
    assert r.json()["verdict"] == "MATCHDAY_EVENTS_PROTOTYPE_READY"


# ── Dashboard ──────────────────────────────────────────────
def test_dashboard(s):
    r = s.get(f"{BASE_URL}/dashboard")
    assert r.status_code == 200
    data = r.json()
    assert data["player"]["display_name"] == "Tu (Você)"
    assert data["player"]["points"] >= 1450
    ae = data["active_event"]
    assert ae["id"] == EVT_LIVE
    assert ae["match"]["team_home"] == "Brasil"
    assert ae["match"]["team_away"] == "Noruega"
    assert ae["match"]["minute"] >= 67
    sl = data["safelock_summary"]
    assert sl and sl["status"] == "REDUCED_POOL"


# ── Events ─────────────────────────────────────────────────
def test_events_list(s):
    r = s.get(f"{BASE_URL}/events")
    assert r.status_code == 200
    items = r.json()
    ids = {e["id"]: e["status"] for e in items}
    for eid in (EVT_LIVE, EVT_DAILY, EVT_MATCHDAY, EVT_DERBY, EVT_CHAMPIONS, EVT_FINAL):
        assert eid in ids, f"Missing seeded event {eid}"
    assert ids[EVT_LIVE] == "LIVE"
    assert ids[EVT_DAILY] == "LIVE"
    assert ids[EVT_MATCHDAY] == "PUBLISHED"
    assert ids[EVT_DERBY] == "APPROVED"
    assert ids[EVT_CHAMPIONS] == "APPROVED"
    assert ids[EVT_FINAL] == "DRAFT"


def test_event_detail(s):
    r = s.get(f"{BASE_URL}/events/{EVT_LIVE}")
    assert r.status_code == 200
    e = r.json()
    assert e["kind"] == "LIVE_MATCH"
    m = e["match"]
    assert m["team_home"] == "Brasil"
    assert m["team_away"] == "Noruega"
    # Scores may drift only if admin updates; tick doesn't change scores
    assert isinstance(m["score_home"], int)
    assert isinstance(m["score_away"], int)


def test_event_join_increments(s):
    r0 = s.get(f"{BASE_URL}/events/{EVT_LIVE}")
    before = r0.json()["joined_users"]
    r = s.post(f"{BASE_URL}/events/{EVT_LIVE}/join")
    assert r.status_code == 200
    assert r.json()["ok"] is True
    r1 = s.get(f"{BASE_URL}/events/{EVT_LIVE}")
    after = r1.json()["joined_users"]
    assert after == before + 1


def test_event_patch_score(s):
    payload = {"score_home": 3}
    r = s.patch(f"{BASE_URL}/events/{EVT_LIVE}", json=payload)
    assert r.status_code == 200
    assert r.json()["match"]["score_home"] == 3
    # Restore
    s.patch(f"{BASE_URL}/events/{EVT_LIVE}", json={"score_home": 2})


def test_event_create(s):
    r = s.post(f"{BASE_URL}/events", json={"title": "TEST_Event_Regression"})
    assert r.status_code == 200
    data = r.json()
    assert data.get("id")
    assert data["status"] == "DRAFT"
    assert data["title"] == "TEST_Event_Regression"


# ── Missions & Quiz ────────────────────────────────────────
def test_missions_list(s):
    r = s.get(f"{BASE_URL}/missions/{EVT_LIVE}")
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 6
    kinds = {m["kind"] for m in items}
    assert kinds == {"PRE_QUIZ", "SUPPORT_TEAM", "HALFTIME_QUIZ", "FINAL_WHISTLE", "COMMUNITY_FAN", "CHECK_IN"}


def test_quiz_submit_correct(s):
    r = s.post(f"{BASE_URL}/quiz/submit", json={"mission_id": "mis-half-quiz", "selected_index": 0})
    assert r.status_code == 200
    data = r.json()
    assert data["correct"] is True
    assert data["points_awarded"] == 250


# ── Leaderboard ────────────────────────────────────────────
def test_leaderboard(s):
    r = s.get(f"{BASE_URL}/leaderboard/{EVT_LIVE}")
    assert r.status_code == 200
    entries = r.json()
    assert len(entries) == 15
    # sorted desc
    pts = [e["points"] for e in entries]
    assert pts == sorted(pts, reverse=True)
    # user at rank 12
    user_entries = [e for e in entries if e["is_user"]]
    assert len(user_entries) == 1
    assert user_entries[0]["display_name"] == "Tu (Você)"
    # index 11 = rank 12
    assert entries[11]["is_user"] is True
    assert entries[11]["points"] == 1450


# ── Rewards ────────────────────────────────────────────────
def test_rewards_list(s):
    r = s.get(f"{BASE_URL}/rewards")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 4
    user_reward = [x for x in items if x["winner_display_name"] == "Tu (Você)"]
    assert user_reward
    # status may already be updated by earlier runs; check it exists
    assert user_reward[0]["status"] in ("PENDING_REVIEW", "APPROVED", "REDUCED", "FROZEN", "BLOCKED")


def test_reward_action_approve(s):
    r = s.post(f"{BASE_URL}/reward-review/action", json={
        "reward_id": "rw-001",
        "action": "APPROVE",
        "audit_note": "ok"
    })
    assert r.status_code == 200
    assert r.json()["status"] == "APPROVED"
    # verify audit contains it
    a = s.get(f"{BASE_URL}/audit-log").json()
    assert any(x["action"] == "REWARD_APPROVE" and x["target"] == "rw-001" for x in a)


# ── Calendar ───────────────────────────────────────────────
def test_calendar_list(s):
    r = s.get(f"{BASE_URL}/calendar")
    assert r.status_code == 200
    items = r.json()
    assert len(items) == 6
    types = {i["slot_type"] for i in items}
    assert {"DAILY", "MATCHDAY", "WEEKLY", "SPECIAL"} <= types


def test_calendar_update(s):
    r = s.patch(f"{BASE_URL}/calendar/cal-derby", json={"status": "PUBLISHED"})
    assert r.status_code == 200
    assert r.json()["status"] == "PUBLISHED"


# ── SafeLock ───────────────────────────────────────────────
def test_safelock_get(s):
    r = s.get(f"{BASE_URL}/safelock")
    assert r.status_code == 200
    data = r.json()
    assert data["fund_balance"] == 925000
    assert data["weekly_cap_total"] == 60000
    assert data["weekly_cap_remaining"] == 46250
    assert len(data["decisions"]) >= 6
    live = [d for d in data["decisions"] if d["event_id"] == EVT_LIVE][0]
    assert live["status"] == "REDUCED_POOL"
    assert live["approved_pool"] == 18000
    assert live["requested_pool"] == 25000


def test_safelock_recompute(s):
    r = s.post(f"{BASE_URL}/safelock/recompute")
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert data["count"] >= 6


# ── Audit log ──────────────────────────────────────────────
def test_audit_log(s):
    r = s.get(f"{BASE_URL}/audit-log")
    assert r.status_code == 200
    items = r.json()
    assert items
    # sorted desc by at_iso
    times = [i["at_iso"] for i in items]
    assert times == sorted(times, reverse=True)
    actions = {i["action"] for i in items}
    assert "SAFELOCK_REDUCED_POOL" in actions or "SAFELOCK_RECOMPUTE" in actions
    assert "ACCOUNT_BLOCKED" in actions
    severities = {i["severity"] for i in items}
    assert "HIGH" in severities
