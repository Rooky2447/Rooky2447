"""Allô Québec - Premium / Stripe / free-tier limit backend tests."""
import os
import time
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")


def _mk_user(prefix="prem", premium_until=None, n_user_msgs=0):
    """Insert a fresh test user + session in MongoDB, return (token, user_id)."""
    mc = MongoClient(MONGO_URL)
    db = mc[DB_NAME]
    uid = f"TEST_{prefix}_{uuid.uuid4().hex[:8]}"
    token = f"TEST_tok_{uuid.uuid4().hex[:16]}"
    user_doc = {
        "user_id": uid,
        "email": f"{uid}@allo.test",
        "name": "QA Premium",
        "picture": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if premium_until:
        user_doc["premium_until"] = premium_until
    db.users.insert_one(user_doc)
    db.user_sessions.insert_one({
        "user_id": uid,
        "session_token": token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Inject N "user"-role chat_messages in current month
    if n_user_msgs > 0:
        now_iso = datetime.now(timezone.utc).isoformat()
        sid = f"chat_{uuid.uuid4().hex[:12]}"
        db.chat_sessions.insert_one({
            "session_id": sid, "user_id": uid, "title": "seed",
            "created_at": now_iso, "updated_at": now_iso,
        })
        docs = [{
            "id": str(uuid.uuid4()),
            "session_id": sid,
            "user_id": uid,
            "role": "user",
            "content": f"seed {i}",
            "created_at": now_iso,
        } for i in range(n_user_msgs)]
        db.chat_messages.insert_many(docs)
    mc.close()
    return token, uid


def _cleanup(uid):
    mc = MongoClient(MONGO_URL)
    db = mc[DB_NAME]
    db.users.delete_many({"user_id": uid})
    db.user_sessions.delete_many({"user_id": uid})
    db.chat_messages.delete_many({"user_id": uid})
    db.chat_sessions.delete_many({"user_id": uid})
    db.payment_transactions.delete_many({"user_id": uid})
    mc.close()


# ---------- Packages (public) ----------
def test_packages_public_no_auth():
    r = requests.get(f"{BASE_URL}/api/payments/packages")
    assert r.status_code == 200
    data = r.json()
    assert "premium_monthly" in data
    pkg = data["premium_monthly"]
    assert pkg["amount"] == 4.99
    assert pkg["currency"] == "cad"
    assert pkg["days"] == 30
    assert "label" in pkg and pkg["label"]


# ---------- Usage ----------
def test_me_usage_requires_auth():
    r = requests.get(f"{BASE_URL}/api/me/usage")
    assert r.status_code == 401


def test_me_usage_free_user_defaults():
    tok, uid = _mk_user("usage")
    try:
        r = requests.get(f"{BASE_URL}/api/me/usage",
                         headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["premium"] is False
        assert d["used"] == 0
        assert d["limit"] == 10
        assert d["remaining"] == 10
    finally:
        _cleanup(uid)


def test_auth_me_includes_premium_flag():
    tok, uid = _mk_user("premflag")
    try:
        r = requests.get(f"{BASE_URL}/api/auth/me",
                         headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 200
        u = r.json()
        assert "premium" in u
        assert u["premium"] is False
    finally:
        _cleanup(uid)


# ---------- Checkout ----------
def test_checkout_requires_auth():
    r = requests.post(f"{BASE_URL}/api/payments/checkout", json={
        "package_id": "premium_monthly",
        "origin_url": BASE_URL,
    })
    assert r.status_code == 401


def test_checkout_invalid_package():
    tok, uid = _mk_user("badpkg")
    try:
        r = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            headers={"Authorization": f"Bearer {tok}"},
            json={"package_id": "totally_fake", "origin_url": BASE_URL},
        )
        assert r.status_code == 400, r.text
    finally:
        _cleanup(uid)


def test_checkout_success_creates_transaction():
    tok, uid = _mk_user("co")
    try:
        r = requests.post(
            f"{BASE_URL}/api/payments/checkout",
            headers={"Authorization": f"Bearer {tok}"},
            json={"package_id": "premium_monthly", "origin_url": BASE_URL},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert "url" in body and body["url"].startswith("http")
        assert "session_id" in body and body["session_id"]

        # Verify DB record
        mc = MongoClient(MONGO_URL)
        tx = mc[DB_NAME].payment_transactions.find_one(
            {"session_id": body["session_id"]}
        )
        mc.close()
        assert tx is not None
        assert tx["status"] == "initiated"
        assert tx["payment_status"] == "pending"
        assert tx["premium_granted"] is False
        assert tx["amount"] == 4.99
        assert tx["currency"] == "cad"
        assert tx["user_id"] == uid

        # Status endpoint - should return unpaid since session never paid
        rs = requests.get(
            f"{BASE_URL}/api/payments/status/{body['session_id']}",
            headers={"Authorization": f"Bearer {tok}"},
            timeout=30,
        )
        assert rs.status_code == 200, rs.text
        st = rs.json()
        assert "status" in st
        assert "payment_status" in st
        assert st["payment_status"] in ("unpaid", "no_payment_required", "pending")
        assert st["premium_granted"] is False
    finally:
        _cleanup(uid)


def test_payment_status_requires_auth():
    r = requests.get(f"{BASE_URL}/api/payments/status/cs_test_fake_id_xyz")
    assert r.status_code == 401


# ---------- Free tier chat limit (402) ----------
def test_chat_free_tier_blocked_at_limit():
    # Seed user with 10 prior user-role messages this month -> next chat must 402
    tok, uid = _mk_user("limit", n_user_msgs=10)
    try:
        r = requests.post(
            f"{BASE_URL}/api/chat",
            headers={"Authorization": f"Bearer {tok}"},
            json={"message": "Une question de plus"},
            timeout=30,
        )
        assert r.status_code == 402, f"Expected 402, got {r.status_code}: {r.text}"
        detail = r.json().get("detail", "")
        assert "Allô Québec Pro" in detail or "Pro" in detail, f"Detail: {detail}"

        # /me/usage should report used=10, remaining=0
        u = requests.get(f"{BASE_URL}/api/me/usage",
                        headers={"Authorization": f"Bearer {tok}"}).json()
        assert u["used"] == 10
        assert u["remaining"] == 0
    finally:
        _cleanup(uid)


# ---------- Premium bypasses limit ----------
def test_chat_premium_bypasses_limit():
    future = (datetime.now(timezone.utc) + timedelta(days=15)).isoformat()
    tok, uid = _mk_user("prem", premium_until=future, n_user_msgs=25)
    try:
        # auth/me should now show premium=true
        me = requests.get(f"{BASE_URL}/api/auth/me",
                          headers={"Authorization": f"Bearer {tok}"}).json()
        assert me["premium"] is True

        # /me/usage premium=true and limit/remaining null
        u = requests.get(f"{BASE_URL}/api/me/usage",
                         headers={"Authorization": f"Bearer {tok}"}).json()
        assert u["premium"] is True
        assert u["limit"] is None
        assert u["remaining"] is None

        # chat must NOT be 402 even with 25 prior messages
        r = requests.post(
            f"{BASE_URL}/api/chat",
            headers={"Authorization": f"Bearer {tok}"},
            json={"message": "Bonjour, juste un test premium"},
            timeout=90,
        )
        assert r.status_code == 200, f"Premium should bypass limit. Got {r.status_code}: {r.text[:300]}"
        assert r.json().get("reply")
    finally:
        _cleanup(uid)


# ---------- Free tier under limit still works ----------
def test_chat_free_tier_under_limit_works():
    tok, uid = _mk_user("under", n_user_msgs=3)
    try:
        r = requests.post(
            f"{BASE_URL}/api/chat",
            headers={"Authorization": f"Bearer {tok}"},
            json={"message": "Salut"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
    finally:
        _cleanup(uid)
