import jwt
import bcrypt
import os
import json
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import pathlib

# Robust .env discovery across project root and backend dirs
for p in [
    pathlib.Path(__file__).resolve().parents[2] / ".env",
    pathlib.Path(__file__).resolve().parents[1] / ".env",
    pathlib.Path.cwd() / ".env",
    pathlib.Path.cwd() / "backend" / ".env"
]:
    if p.exists():
        load_dotenv(dotenv_path=p)

SECRET_KEY = os.getenv("JWT_SECRET", "godseyeomnivision2025supersecret")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 168  # 7 days session lifetime for workstation persistence

# File-based database
DB_PATH = pathlib.Path(__file__).parent.parent.parent / "database" / "users.json"

# In-memory activity log
ACTIVITY_LOG = []


def hash_password(password: str) -> str:
    # Use bcrypt to hash passwords with salt
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()


def check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


def load_users() -> dict:
    if not DB_PATH.parent.exists():
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    if not DB_PATH.exists():
        return {}
    try:
        with open(DB_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def register_initial_admin(username: str, password: str) -> dict:
    users = load_users()
    if len(users) > 0:
        return {"success": False, "error": "System is already initialized with an administrator"}
    
    clean_username = username.strip().lower()
    if not clean_username or not password.strip():
        return {"success": False, "error": "Username and password are required"}
        
    users[clean_username] = {
        "password": hash_password(password),
        "role": "ADMIN",
        "name": "System Administrator",
        "clearance": "TOP SECRET",
        "first_run": False
    }
    save_users(users)
    log_activity(username, "AUTH", "Initial administrator registered")
    return {"success": True}


def save_users(users: dict):
    if not DB_PATH.parent.exists():
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DB_PATH, "w") as f:
        json.dump(users, f, indent=4)


def create_token(username: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "role": role,
        "exp": now + timedelta(hours=TOKEN_EXPIRE_HOURS),
        "iat": now
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "username": payload["sub"], "role": payload["role"]}
    except jwt.ExpiredSignatureError:
        # Grace window: If signed with our key and issued within the last 14 days, allow seamless continuation
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_signature": True, "verify_exp": False})
            iat = payload.get("iat", 0)
            now_ts = datetime.now(timezone.utc).timestamp()
            if now_ts - iat < 14 * 86400:
                return {"valid": True, "username": payload["sub"], "role": payload["role"], "grace_renewed": True}
        except Exception:
            pass
        return {"valid": False, "error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"valid": False, "error": "Invalid token"}


def authenticate(username: str, password: str) -> dict:
    users = load_users()
    user = users.get(username.lower())
    if not user:
        return {"success": False, "error": "User not found"}
    if not check_password(password, user["password"]):
        return {"success": False, "error": "Invalid password"}
    token = create_token(username, user["role"])
    log_activity(username, "AUTH", "Login successful")
    return {
        "success": True,
        "token": token,
        "username": username,
        "role": user["role"],
        "name": user["name"],
        "clearance": user["clearance"],
        "must_change_password": user.get("first_run", False)
    }


def update_password(username: str, old_password: str, new_password: str) -> dict:
    users = load_users()
    user = users.get(username.lower())
    if not user:
        return {"success": False, "error": "User not found"}
    
    if not check_password(old_password, user["password"]):
        return {"success": False, "error": "Invalid current password"}
        
    user["password"] = hash_password(new_password)
    user["first_run"] = False
    users[username.lower()] = user
    save_users(users)
    log_activity(username, "AUTH", "Password updated successfully")
    return {"success": True}


def log_activity(username: str, module: str, action: str, target: str = None):
    ACTIVITY_LOG.append({
        "id": len(ACTIVITY_LOG) + 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "username": username,
        "module": module,
        "action": action,
        "target": target or "",
    })
    # Keep last 500 entries
    if len(ACTIVITY_LOG) > 500:
        ACTIVITY_LOG.pop(0)


def get_logs(limit: int = 100) -> list:
    return list(reversed(ACTIVITY_LOG[-limit:]))
