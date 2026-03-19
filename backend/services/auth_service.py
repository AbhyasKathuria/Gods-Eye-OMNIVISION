import jwt
import hashlib
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pathlib

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("JWT_SECRET", "godseyeomnivision2025supersecret")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 8

# Default users — in production use a real database
USERS = {
    "admin": {
        "password": hashlib.sha256("admin123".encode()).hexdigest(),
        "role": "ADMIN",
        "name": "Administrator",
        "clearance": "TOP SECRET"
    },
    "researcher": {
        "password": hashlib.sha256("research123".encode()).hexdigest(),
        "role": "RESEARCHER",
        "name": "Lead Researcher",
        "clearance": "SECRET"
    },
    "student": {
        "password": hashlib.sha256("student123".encode()).hexdigest(),
        "role": "STUDENT",
        "name": "Abhyas Kathuria",
        "clearance": "CONFIDENTIAL"
    }
}

# In-memory activity log
ACTIVITY_LOG = []


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_token(username: str, role: str) -> str:
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True, "username": payload["sub"], "role": payload["role"]}
    except jwt.ExpiredSignatureError:
        return {"valid": False, "error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"valid": False, "error": "Invalid token"}


def authenticate(username: str, password: str) -> dict:
    user = USERS.get(username.lower())
    if not user:
        return {"success": False, "error": "User not found"}
    if user["password"] != hash_password(password):
        return {"success": False, "error": "Invalid password"}
    token = create_token(username, user["role"])
    log_activity(username, "AUTH", "Login successful")
    return {
        "success": True,
        "token": token,
        "username": username,
        "role": user["role"],
        "name": user["name"],
        "clearance": user["clearance"]
    }


def log_activity(username: str, module: str, action: str, target: str = None):
    ACTIVITY_LOG.append({
        "id": len(ACTIVITY_LOG) + 1,
        "timestamp": datetime.utcnow().isoformat(),
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
