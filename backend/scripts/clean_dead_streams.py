import asyncio
import json
import pathlib
import sys
import httpx

GEOJSON_FILE = pathlib.Path(__file__).parent.parent / "data" / "streams.geojson"

async def main():
    if not GEOJSON_FILE.exists():
        print("streams.geojson not found")
        return

    with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    print(f"Total features: {len(features)}")

    yt_indices = []
    for idx, f in enumerate(features):
        url = f.get("properties", {}).get("url") or ""
        if "youtube" in url or "youtu.be" in url:
            v_id = url.split("watch?v=")[-1].split("&")[0] if "watch?v=" in url else url.split("youtu.be/")[-1].split("?")[0]
            yt_indices.append((idx, v_id))

    print(f"Found {len(yt_indices)} YouTube streams to verify...")

    dead_indices = set()
    playable_indices = set()

    sem = asyncio.Semaphore(25)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }

    async with httpx.AsyncClient(headers=headers, timeout=6.0, follow_redirects=True) as client:
        async def verify(idx, v_id):
            async with sem:
                try:
                    resp = await client.get(f"https://www.youtube.com/watch?v={v_id}")
                    text = resp.text
                    if (
                        resp.status_code != 200 or
                        "This live stream recording is not available" in text or
                        '"status":"UNPLAYABLE"' in text or
                        '"status":"ERROR"' in text or
                        "Video unavailable" in text or
                        "This video has been removed" in text or
                        "This video is private" in text
                    ):
                        dead_indices.add(idx)
                    else:
                        playable_indices.add(idx)
                except Exception:
                    dead_indices.add(idx)

        tasks = [verify(idx, v_id) for idx, v_id in yt_indices]
        await asyncio.gather(*tasks)

    print(f"Verification complete: {len(playable_indices)} playable, {len(dead_indices)} dead.")

    # Filter out dead features
    cleaned_features = [f for idx, f in enumerate(features) if idx not in dead_indices]
    print(f"Retaining {len(cleaned_features)} features (removed {len(dead_indices)} dead features)")

    data["features"] = cleaned_features
    with open(GEOJSON_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    print("Saved cleaned streams.geojson successfully.")

if __name__ == "__main__":
    asyncio.run(main())
