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


def test_initialization_flow():
    # Verify starting state is empty
    users = auth_service.load_users()
    assert len(users) == 0

    # Register initial admin
    reg_res = auth_service.register_initial_admin("sec_admin", "adminpass123")
    assert reg_res["success"] is True

    # Check that database now has the admin
    users_after = auth_service.load_users()
    assert "sec_admin" in users_after
    assert users_after["sec_admin"]["role"] == "ADMIN"

    # Verify subsequent registration is blocked
    reg_fail = auth_service.register_initial_admin("another_admin", "newpass123")
    assert reg_fail["success"] is False
    assert reg_fail["error"] == "System is already initialized with an administrator"


def test_authenticate_success_and_wrong_password():
    # Setup initial admin
    auth_service.register_initial_admin("sec_admin", "adminpass123")

    # Authenticate successfully
    res = auth_service.authenticate("sec_admin", "adminpass123")
    assert res["success"] is True
    assert "token" in res
    assert res["role"] == "ADMIN"
    assert res["username"] == "sec_admin"

    # Authenticate wrong password
    res_fail = auth_service.authenticate("sec_admin", "wrong_password")
    assert res_fail["success"] is False
    assert res_fail["error"] == "Invalid password"


def test_update_password_success_and_invalid():
    # Setup initial admin
    auth_service.register_initial_admin("sec_admin", "adminpass123")

    # Update password successfully
    up_res = auth_service.update_password("sec_admin", "adminpass123", "newsecurepass99")
    assert up_res["success"] is True

    # Verify login with new password works
    auth_res = auth_service.authenticate("sec_admin", "newsecurepass99")
    assert auth_res["success"] is True

    # Verify update fails with invalid current password
    up_fail = auth_service.update_password("sec_admin", "wrongpass", "anotherpass")
    assert up_fail["success"] is False
    assert up_fail["error"] == "Invalid current password"


def test_token_verification():
    # Setup initial admin
    auth_service.register_initial_admin("sec_admin", "adminpass123")
    auth_res = auth_service.authenticate("sec_admin", "adminpass123")
    token = auth_res["token"]

    # Verify token
    verify_res = auth_service.verify_token(token)
    assert verify_res["valid"] is True
    assert verify_res["username"] == "sec_admin"
    assert verify_res["role"] == "ADMIN"
