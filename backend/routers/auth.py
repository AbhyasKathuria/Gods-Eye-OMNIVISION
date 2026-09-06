from fastapi import APIRouter, HTTPException, Header
from services.auth_service import authenticate, verify_token, get_logs, log_activity
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
async def login(payload: dict):
    username = payload.get("username", "").strip()
    password = payload.get("password", "").strip()
    ethics = payload.get("ethics_accepted", False)

    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")

    if not ethics:
        raise HTTPException(status_code=400, detail="You must accept the ethics agreement")

    result = authenticate(username, password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["error"])

    return result


def extract_token(authorization: Optional[str] = None, token: Optional[str] = None) -> Optional[str]:
    if authorization:
        parts = authorization.strip().split(" ", 1)
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1].strip()
        return authorization.strip()
    if token:
        return token.strip()
    return None


@router.get("/verify")
async def verify(authorization: Optional[str] = Header(None), token: Optional[str] = None):
    raw_token = extract_token(authorization, token)
    if not raw_token:
        raise HTTPException(status_code=401, detail="No token provided")
    result = verify_token(raw_token)
    if not result["valid"]:
        raise HTTPException(status_code=401, detail=result.get("error", "Invalid token"))
    return result


@router.get("/logs")
async def activity_logs(
    authorization: Optional[str] = Header(None),
    token: Optional[str] = None,
    limit: int = 100
):
    raw_token = extract_token(authorization, token)
    if not raw_token:
        raise HTTPException(status_code=401, detail="Authentication required")
    result = verify_token(raw_token)
    if not result["valid"]:
        raise HTTPException(status_code=401, detail=result.get("error", "Invalid token"))
    if result["role"].upper() not in ["ADMIN", "RESEARCHER"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    logs = get_logs(limit)
    return {"status": "success", "logs": logs, "total": len(logs)}


@router.post("/log")
async def add_log(
    payload: dict,
    authorization: Optional[str] = Header(None),
    token: Optional[str] = None
):
    raw_token = extract_token(authorization, token)
    if not raw_token:
        raise HTTPException(status_code=401, detail="Authentication required")
    result = verify_token(raw_token)
    if not result["valid"]:
        raise HTTPException(status_code=401, detail=result.get("error", "Invalid token"))
    log_activity(
        username=result["username"],
        module=payload.get("module", "UNKNOWN"),
        action=payload.get("action", ""),
        target=payload.get("target", "")
    )
    return {"status": "success"}


@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        result = verify_token(token)
        if result["valid"]:
            log_activity(result["username"], "AUTH", "Logout")
    return {"status": "success", "message": "Logged out"}


@router.post("/change-password")
async def change_password(payload: dict, authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.replace("Bearer ", "")
    result = verify_token(token)
    if not result["valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    old_password = payload.get("old_password", "").strip()
    new_password = payload.get("new_password", "").strip()
    if not old_password or not new_password:
        raise HTTPException(status_code=400, detail="Current password and new password are required")
        
    from services.auth_service import update_password
    res = update_password(result["username"], old_password, new_password)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
        
    return {"status": "success", "message": "Password updated successfully"}


@router.get("/init-status")
async def init_status():
    from services.auth_service import load_users
    users = load_users()
    return {"initialized": len(users) > 0}


@router.post("/register-admin")
async def register_admin(payload: dict):
    username = payload.get("username", "").strip()
    password = payload.get("password", "").strip()
    
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
        
    from services.auth_service import register_initial_admin
    res = register_initial_admin(username, password)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
        
    return {"status": "success", "message": "Initial administrator registered successfully"}
