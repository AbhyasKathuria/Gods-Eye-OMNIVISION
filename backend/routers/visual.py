from fastapi import APIRouter, HTTPException
from services.visual_service import (
    reverse_image_search,
    extract_metadata,
    analyze_image_ai,
    search_by_image_url
)

router = APIRouter(prefix="/visual", tags=["Visual Intelligence"])


@router.post("/reverse")
async def reverse_search(payload: dict):
    try:
        image_data = payload.get("image_data")
        if not image_data:
            raise HTTPException(status_code=400, detail="Image data required")
        data = await reverse_image_search(image_data)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/metadata")
async def image_metadata(payload: dict):
    try:
        image_data = payload.get("image_data")
        filename = payload.get("filename", "image.jpg")
        if not image_data:
            raise HTTPException(status_code=400, detail="Image data required")
        data = await extract_metadata(image_data, filename)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze")
async def analyze_image(payload: dict):
    try:
        image_data = payload.get("image_data")
        if not image_data:
            raise HTTPException(status_code=400, detail="Image data required")
        metadata = await extract_metadata(image_data)
        reverse = await reverse_image_search(image_data)
        return {
            "status": "success",
            "metadata": metadata,
            "reverse_search": reverse,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_image_url(url: str):
    try:
        data = await search_by_image_url(url)
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ela")
async def run_ela(payload: dict):
    try:
        import base64
        image_data = payload.get("image_data")
        quality = payload.get("quality", 95)
        if not image_data:
            raise HTTPException(status_code=400, detail="Image data required")
            
        if "," in image_data:
            image_data = image_data.split(",")[1]
            
        image_bytes = base64.b64decode(image_data)
        from services.image_service import perform_error_level_analysis
        ela_b64 = perform_error_level_analysis(image_bytes, quality=quality)
        return {"status": "success", "ela_image": f"data:image/jpeg;base64,{ela_b64}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
