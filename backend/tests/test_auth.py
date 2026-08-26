import pytest
import os
import pathlib
from services import auth_service

# Define test database path
TEST_DB_PATH = pathlib.Path(__file__).parent.parent / "database" / "users_test.json"


@pytest.fixture(autouse=True)
def setup_test_db(monkeypatch):
    # Set DB_PATH to test DB
    monkeypatch.setattr(auth_service, "DB_PATH", TEST_DB_PATH)
    # Remove existing test DB if any
    if TEST_DB_PATH.exists():
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass
    yield
    # Cleanup test DB after test runs
    if TEST_DB_PATH.exists():
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass


def test_load_users_seeds_defaults():
    users = auth_service.load_users()
    assert "admin" in users
    assert "researcher" in users
    assert "student" in users
    assert users["admin"]["first_run"] is True
    assert TEST_DB_PATH.exists()


def test_authenticate_success_and_first_run():
    auth_service.load_users()
    
    # Authenticate default admin
    res = auth_service.authenticate("admin", "admin123")
    assert res["success"] is True
    assert res["must_change_password"] is True
    assert "token" in res
    assert res["role"] == "ADMIN"


def test_authenticate_wrong_password():
    auth_service.load_users()
    res = auth_service.authenticate("admin", "wrongpassword")
    assert res["success"] is False
    assert res["error"] == "Invalid password"


def test_update_password_success():
    auth_service.load_users()
    
    # Update password
    res = auth_service.update_password("admin", "admin123", "newsecurepass")
    assert res["success"] is True
    
    # Authenticate with new password
    res2 = auth_service.authenticate("admin", "newsecurepass")
    assert res2["success"] is True
    assert res2["must_change_password"] is False


def test_update_password_invalid_current():
    auth_service.load_users()
    res = auth_service.update_password("admin", "wrongcurrent", "newsecurepass")
    assert res["success"] is False
    assert res["error"] == "Invalid current password"


def test_token_verification():
    auth_service.load_users()
    res = auth_service.authenticate("student", "student123")
    token = res["token"]
    
    verify_res = auth_service.verify_token(token)
    assert verify_res["valid"] is True
    assert verify_res["username"] == "student"
    assert verify_res["role"] == "STUDENT"
