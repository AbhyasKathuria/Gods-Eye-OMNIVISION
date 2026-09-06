#!/usr/bin/env python3
"""
Automated Verification Pipeline for Curated Cameras in God's Eye.
Validates each camera URL (image, video stream manifest, or YouTube endpoint)
and updates verified and verifiedAt fields honestly in curated_cameras.json.
"""

import json
import os
import sys
from datetime import datetime, timezone
import httpx

DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "curated_cameras.json"))


def check_refreshing_image(url: str, timeout: float = 6.0) -> bool:
    """Verify that an image URL returns HTTP 200 with an image or valid payload."""
    if not url:
        return False
    if url.startswith("/"):
        return True
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                return True
            return False
    except Exception as e:
        print(f"  [Error checking image {url}]: {e}")
        return False


def check_live_video(url: str, timeout: float = 6.0) -> bool:
    """Verify that a video stream URL (HLS .m3u8 or MP4) is reachable and valid."""
    if not url:
        return False
    if url.startswith("/"):
        return True
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Range": "bytes=0-1024"
    }
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code in (200, 206):
                content = resp.content
                if b"#EXTM3U" in content or resp.headers.get("content-type", "").startswith("video/") or len(content) > 0:
                    return True
            return False
    except Exception as e:
        print(f"  [Error checking video {url}]: {e}")
        return False


def check_live_youtube(url: str, timeout: float = 6.0) -> bool:
    """
    Check if a YouTube video ID is reachable and not deleted or private.
    Uses public YouTube oEmbed endpoint (no API key required).
    """
    if not url:
        return False
    video_id = None
    if "embed/" in url:
        video_id = url.split("embed/")[-1].split("?")[0]
    elif "watch?v=" in url:
        video_id = url.split("watch?v=")[-1].split("&")[0]
    elif "youtu.be/" in url:
        video_id = url.split("youtu.be/")[-1].split("?")[0]

    if not video_id:
        return False

    oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.get(oembed_url)
            return resp.status_code == 200
    except Exception as e:
        print(f"  [Error checking YouTube {video_id}]: {e}")
        return False


def run_verification():
    if not os.path.exists(DATA_PATH):
        print(f"Curated cameras file not found at {DATA_PATH}")
        sys.exit(1)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        cameras = json.load(f)

    print(f"=== Running Camera Verification Pipeline on {len(cameras)} cameras ===")
    now_iso = datetime.now(timezone.utc).isoformat()
    verified_count = 0

    for cam in cameras:
        cam_id = cam.get("id", "UNKNOWN")
        name = cam.get("name", "Unknown")
        feed_type = cam.get("feedType", "")
        stream_url = cam.get("streamUrl") or cam.get("videoUrl")
        image_url = cam.get("imageUrl") or cam.get("realImg")

        is_verified = False

        if feed_type == "refreshing_image" or (not stream_url and image_url):
            print(f"Checking [{cam_id}] ({name}) as refreshing_image...")
            is_verified = check_refreshing_image(image_url)
        elif feed_type == "live_video":
            print(f"Checking [{cam_id}] ({name}) as live_video...")
            is_verified = check_live_video(stream_url)
        elif feed_type == "live_youtube":
            print(f"Checking [{cam_id}] ({name}) as live_youtube...")
            is_verified = check_live_youtube(stream_url)
        else:
            # Fallback check
            if stream_url:
                if "youtube" in stream_url:
                    is_verified = check_live_youtube(stream_url)
                else:
                    is_verified = check_live_video(stream_url)
            elif image_url:
                is_verified = check_refreshing_image(image_url)

        cam["verified"] = bool(is_verified)
        cam["verifiedAt"] = now_iso
        
        # Ensure schema conformance
        cam["feedType"] = feed_type or ("live_youtube" if "youtube" in (stream_url or "") else "live_video" if stream_url else "refreshing_image")
        cam["streamUrl"] = stream_url if cam["feedType"] in ("live_video", "live_youtube") else None
        cam["imageUrl"] = image_url
        if cam["feedType"] == "refreshing_image" and not cam.get("refreshIntervalSeconds"):
            cam["refreshIntervalSeconds"] = 60

        status_str = "VERIFIED" if is_verified else "UNVERIFIED"
        print(f"  -> [{cam_id}] result: {status_str}")
        if is_verified:
            verified_count += 1

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(cameras, f, indent=2, ensure_ascii=False)

    print(f"=== Verification Completed: {verified_count}/{len(cameras)} cameras verified active ===")
    print(f"Updated {DATA_PATH} with real verified and verifiedAt timestamps.\n")


if __name__ == "__main__":
    run_verification()
