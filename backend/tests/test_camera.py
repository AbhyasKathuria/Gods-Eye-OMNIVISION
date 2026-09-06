import asyncio
import pytest
from services.camera_service import (
    fetch_windy_cameras,
    fetch_tfl_cameras,
    fetch_curated_cameras,
    get_unified_cameras
)


@pytest.mark.asyncio
async def test_windy_cameras_live():
    # Test London
    cams = await fetch_windy_cameras(51.5074, -0.1278, radius_km=50, limit=5)
    assert len(cams) > 0
    assert cams[0]["source"].lower() == "windy"
    assert "preview" in cams[0]["realImg"] or "thumbnail" in cams[0]["realImg"]
    print(f"Windy test passed: fetched {len(cams)} cameras.")


@pytest.mark.asyncio
async def test_tfl_cameras_london():
    cams = await fetch_tfl_cameras(51.5074, -0.1278, radius_km=20, limit=5)
    assert len(cams) > 0
    assert cams[0]["source"].lower() in ("tfl", "tfl_jamcam")
    assert cams[0]["realImg"].startswith("http")
    print(f"TfL test passed: fetched {len(cams)} cameras.")


def test_curated_cameras():
    cams = fetch_curated_cameras(12.9716, 77.5946, radius_km=50)
    assert len(cams) > 0
    assert cams[0]["city"] == "Bengaluru"
    print(f"Curated test passed: fetched {len(cams)} cameras.")


@pytest.mark.asyncio
async def test_unified_cameras_global():
    # London (Windy + TfL)
    lon = await get_unified_cameras(51.5074, -0.1278, radius_km=30, limit=10)
    assert len(lon) > 0

    # India / Bengaluru (Windy + Curated)
    blr = await get_unified_cameras(12.9716, 77.5946, radius_km=50, limit=10)
    assert len(blr) > 0

    # Global world view test
    glob = await get_unified_cameras(20, 0, radius_km=15000, limit=100)
    assert len(glob) >= 50
    countries = set(c.get("country") for c in glob)
    assert len(countries) >= 10
    print(f"Global test passed: fetched {len(glob)} cameras across {len(countries)} countries.")

    print("Unified tests passed successfully!")


if __name__ == "__main__":
    asyncio.run(test_windy_cameras_live())
    asyncio.run(test_tfl_cameras_london())
    test_curated_cameras()
    asyncio.run(test_unified_cameras_global())
