import httpx
import os
import pathlib
import base64
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


async def reverse_image_search(image_data: str) -> dict:
    results = {}

    # SauceNAO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            img_bytes = base64.b64decode(image_data)
            files = {"file": ("image.jpg", img_bytes, "image/jpeg")}
            params = {
                "api_key": os.getenv("SAUCENAO_API_KEY"),
                "output_type": 2,
                "numres": 5,
                "db": 999
            }
            resp = await client.post(
                "https://saucenao.com/search.php",
                files=files, params=params
            )
            if resp.status_code == 200:
                data = resp.json()
                matches = []
                for r in data.get("results", []):
                    header = r.get("header", {})
                    if float(header.get("similarity", 0)) > 60:
                        matches.append({
                            "similarity": header.get("similarity"),
                            "thumbnail": header.get("thumbnail"),
                            "index_name": header.get("index_name"),
                            "ext_urls": r.get("data", {}).get("ext_urls", []),
                            "title": r.get("data", {}).get("title"),
                            "source": r.get("data", {}).get("source"),
                        })
                results["saucenao"] = {
                    "found": len(matches) > 0,
                    "matches": matches,
                    "searches_used": data.get("header", {}).get("long_used"),
                    "searches_remaining": data.get("header", {}).get("long_remaining"),
                }
    except Exception as e:
        results["saucenao_error"] = str(e)

    return results


async def extract_metadata(image_data: str, filename: str = "image.jpg") -> dict:
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS, GPSTAGS
        import io

        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes))

        metadata = {
            "format": img.format,
            "mode": img.mode,
            "size": f"{img.width}x{img.height}",
            "width": img.width,
            "height": img.height,
        }

        # EXIF data
        exif_data = {}
        try:
            exif = img._getexif()
            if exif:
                for tag_id, value in exif.items():
                    tag = TAGS.get(tag_id, tag_id)
                    if isinstance(value, bytes):
                        try:
                            value = value.decode("utf-8", errors="ignore")
                        except Exception:
                            value = str(value)
                    exif_data[str(tag)] = str(value)[:200]
        except Exception:
            pass

        metadata["exif"] = exif_data

        # GPS extraction
        gps_info = {}
        try:
            exif_raw = img._getexif()
            if exif_raw:
                for tag_id, value in exif_raw.items():
                    tag = TAGS.get(tag_id, tag_id)
                    if tag == "GPSInfo":
                        for gps_tag_id, gps_value in value.items():
                            gps_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                            gps_info[gps_tag] = str(gps_value)
        except Exception:
            pass

        if gps_info:
            metadata["gps"] = gps_info
            try:
                def convert_to_degrees(value):
                    d = float(value[0])
                    m = float(value[1])
                    s = float(value[2])
                    return d + (m / 60.0) + (s / 3600.0)

                lat_raw = exif_raw.get(34853, {}).get(2)
                lon_raw = exif_raw.get(34853, {}).get(4)
                lat_ref = exif_raw.get(34853, {}).get(1, "N")
                lon_ref = exif_raw.get(34853, {}).get(3, "E")

                if lat_raw and lon_raw:
                    lat = convert_to_degrees(lat_raw)
                    lon = convert_to_degrees(lon_raw)
                    if lat_ref != "N":
                        lat = -lat
                    if lon_ref != "E":
                        lon = -lon
                    metadata["gps_coords"] = {
                        "latitude": round(lat, 6),
                        "longitude": round(lon, 6),
                        "google_maps": f"https://www.google.com/maps/@{lat},{lon},15z",
                        "openstreetmap": f"https://www.openstreetmap.org/#map=15/{lat}/{lon}",
                    }
            except Exception:
                pass

        # Risk assessment
        risk_indicators = []
        if gps_info:
            risk_indicators.append("GPS COORDINATES EMBEDDED")
        if "Make" in exif_data:
            risk_indicators.append(f"DEVICE: {exif_data.get('Make')} {exif_data.get('Model', '')}")
        if "DateTime" in exif_data:
            risk_indicators.append(f"TIMESTAMP: {exif_data.get('DateTime')}")
        if "Software" in exif_data:
            risk_indicators.append(f"SOFTWARE: {exif_data.get('Software')}")

        metadata["risk_level"] = "HIGH" if gps_info else "MEDIUM" if exif_data else "LOW"
        metadata["risk_indicators"] = risk_indicators

        return {"status": "success", "metadata": metadata}

    except Exception as e:
        return {"status": "error", "error": str(e)}


async def analyze_image_ai(image_data: str) -> dict:
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an intelligence analyst. Analyze images for OSINT purposes. Identify objects, locations, people, text, logos, vehicles, landmarks, and any intelligence value. Be specific and analytical."
                },
                {
                    "role": "user",
                    "content": "Analyze this image for intelligence value. What can you identify? What objects, locations, text, or people are visible? What intelligence can be derived?"
                }
            ],
            max_tokens=800
        )
        return {
            "status": "success",
            "analysis": response.choices[0].message.content
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


async def search_by_image_url(image_url: str) -> dict:
    results = {}
    try:
        yandex_url = f"https://yandex.com/images/search?url={image_url}&rpt=imageview"
        google_url = f"https://lens.google.com/uploadbyurl?url={image_url}"
        bing_url = f"https://www.bing.com/images/search?q=imgurl:{image_url}&view=detailv2&iss=sbi"

        results["search_links"] = {
            "yandex": yandex_url,
            "google_lens": google_url,
            "bing_visual": bing_url,
            "tineye": f"https://tineye.com/search?url={image_url}",
        }
        return results
    except Exception as e:
        return {"error": str(e)}
