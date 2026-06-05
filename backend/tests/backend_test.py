"""Allô Québec backend regression tests."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://community-helper-qc.preview.emergentagent.com").rstrip("/")
TOKEN = os.environ.get("TEST_SESSION_TOKEN", "test_session_1780642472979")
AUTH = {"Authorization": f"Bearer {TOKEN}"}


# ---------- Root & Guides ----------
def test_root():
    r = requests.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert "Allô Québec" in data.get("message", "")


def test_list_guides_returns_8():
    r = requests.get(f"{BASE_URL}/api/guides")
    assert r.status_code == 200
    guides = r.json()
    assert isinstance(guides, list)
    assert len(guides) >= 8
    slugs = {g["slug"] for g in guides}
    expected = {
        "ramq-carte-soleil", "saaq-permis-conduire", "gamf-medecin-famille",
        "impots-revenu-quebec", "logement-droits-locataire", "afe-aide-financiere-etudes",
        "hydro-quebec-compte", "cnesst-accident-travail",
    }
    assert expected.issubset(slugs)


def test_get_guide_detail():
    r = requests.get(f"{BASE_URL}/api/guides/ramq-carte-soleil")
    assert r.status_code == 200
    g = r.json()
    assert g["slug"] == "ramq-carte-soleil"
    assert g["title"]
    assert isinstance(g["steps"], list) and len(g["steps"]) >= 1
    assert isinstance(g["resources"], list) and len(g["resources"]) >= 1
    assert isinstance(g["faq"], list) and len(g["faq"]) >= 1


def test_get_guide_not_found():
    r = requests.get(f"{BASE_URL}/api/guides/inexistant")
    assert r.status_code == 404


# ---------- Auth ----------
def test_auth_me_unauthenticated():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


def test_auth_me_authenticated():
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=AUTH)
    assert r.status_code == 200, r.text
    user = r.json()
    assert "email" in user
    assert "user_id" in user


def test_auth_session_invalid():
    r = requests.post(f"{BASE_URL}/api/auth/session", json={"session_id": "invalid_id_xyz"})
    assert r.status_code == 401


# ---------- Reminders ----------
def test_reminders_unauthenticated():
    r = requests.get(f"{BASE_URL}/api/reminders")
    assert r.status_code == 401


def test_reminders_crud():
    # Create
    payload = {
        "title": "TEST_Renouveler carte soleil",
        "category": "ramq",
        "due_date": "2026-06-30",
        "notes": "Tester",
    }
    r = requests.post(f"{BASE_URL}/api/reminders", json=payload, headers=AUTH)
    assert r.status_code == 200, r.text
    rem = r.json()
    assert rem["title"] == payload["title"]
    assert rem["category"] == "ramq"
    rid = rem["id"]

    # List - verify persistence
    r2 = requests.get(f"{BASE_URL}/api/reminders", headers=AUTH)
    assert r2.status_code == 200
    items = r2.json()
    assert any(it["id"] == rid for it in items)

    # Delete
    r3 = requests.delete(f"{BASE_URL}/api/reminders/{rid}", headers=AUTH)
    assert r3.status_code == 200

    # Verify removed
    r4 = requests.get(f"{BASE_URL}/api/reminders", headers=AUTH)
    assert not any(it["id"] == rid for it in r4.json())

    # Delete non-existent -> 404
    r5 = requests.delete(f"{BASE_URL}/api/reminders/{rid}", headers=AUTH)
    assert r5.status_code == 404


# ---------- Chat (LLM) ----------
@pytest.fixture(scope="module")
def chat_state():
    return {}


def test_chat_unauthenticated():
    r = requests.post(f"{BASE_URL}/api/chat", json={"message": "test"})
    assert r.status_code == 401


def test_chat_first_message(chat_state):
    payload = {"message": "Comment renouveler ma carte soleil?"}
    r = requests.post(f"{BASE_URL}/api/chat", json=payload, headers=AUTH, timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("session_id")
    assert data.get("user_message_id")
    assert data.get("assistant_message_id")
    reply = data.get("reply", "")
    assert isinstance(reply, str) and len(reply) > 20
    # French content - reasonable heuristic
    lowered = reply.lower()
    assert any(w in lowered for w in ["ramq", "carte", "renouvel", "soleil", "assurance"]), f"Reply: {reply[:300]}"
    chat_state["session_id"] = data["session_id"]


def test_chat_second_message_keeps_history(chat_state):
    sid = chat_state.get("session_id")
    assert sid, "Need first message session id"
    time.sleep(1)
    payload = {"message": "Et combien de temps ça prend?", "session_id": sid}
    r = requests.post(f"{BASE_URL}/api/chat", json=payload, headers=AUTH, timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["session_id"] == sid
    assert len(data["reply"]) > 10


def test_chat_sessions_list(chat_state):
    r = requests.get(f"{BASE_URL}/api/chat/sessions", headers=AUTH)
    assert r.status_code == 200
    sessions = r.json()
    assert isinstance(sessions, list)
    sid = chat_state.get("session_id")
    if sid:
        assert any(s["session_id"] == sid for s in sessions)


def test_chat_session_messages(chat_state):
    sid = chat_state.get("session_id")
    if not sid:
        pytest.skip("no session id from prior chat tests")
    r = requests.get(f"{BASE_URL}/api/chat/sessions/{sid}/messages", headers=AUTH)
    assert r.status_code == 200
    msgs = r.json()
    assert isinstance(msgs, list)
    # 2 user + 2 assistant from two prior chat calls
    assert len(msgs) >= 4
    roles = [m["role"] for m in msgs]
    assert "user" in roles and "assistant" in roles


def test_chat_sessions_unauthenticated():
    r = requests.get(f"{BASE_URL}/api/chat/sessions")
    assert r.status_code == 401
