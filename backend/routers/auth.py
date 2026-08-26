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


@router.get("/verify")
async def verify(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")
    token = authorization.replace("Bearer ", "")
    result = verify_token(token)
    if not result["valid"]:
        raise HTTPException(status_code=401, detail=result.get("error", "Invalid token"))
    return result


@router.get("/logs")
async def activity_logs(authorization: Optional[str] = Header(None), limit: int = 100):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.replace("Bearer ", "")
    result = verify_token(token)
    if not result["valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")
    if result["role"] not in ["ADMIN", "RESEARCHER"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    logs = get_logs(limit)
    return {"status": "success", "logs": logs, "total": len(logs)}


@router.post("/log")
async def add_log(payload: dict, authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.replace("Bearer ", "")
    result = verify_token(token)
    if not result["valid"]:
        raise HTTPException(status_code=401, detail="Invalid token")
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
