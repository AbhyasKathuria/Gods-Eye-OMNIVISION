import httpx
import os
import base64
import pathlib
from PIL import Image
from PIL.ExifTags import TAGS
import io
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


async def reverse_image_search(image_bytes: bytes, filename: str) -> dict:
    results = {
        "saucenao": [],
        "yandex_url": None,
        "search_links": {},
        "errors": []
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://saucenao.com/search.php",
                params={
                    "api_key": os.getenv("SAUCENAO_API_KEY"),
                    "output_type": 2,
                    "numres": 6
                },
                files={"file": (filename, image_bytes, "image/jpeg")}
            )
            if resp.status_code == 200:
                data = resp.json()
                for r in data.get("results", []):
                    header = r.get("header", {})
                    similarity = float(header.get("similarity", 0))
                    if similarity > 40:
                        results["saucenao"].append({
                            "similarity": similarity,
                            "thumbnail": header.get("thumbnail"),
                            "urls": r.get("data", {}).get("ext_urls", []),
                            "source": r.get("data", {}).get("source", "Unknown"),
                            "title": r.get("data", {}).get("title", ""),
                        })
            else:
                results["errors"].append(f"SauceNAO error: {resp.status_code}")
    except Exception as e:
        results["errors"].append(f"SauceNAO failed: {str(e)}")

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.post(
                "https://yandex.com/images/search",
                params={"rpt": "imageview", "format": "json"},
                files={"upfile": ("image.jpg", image_bytes, "image/jpeg")},
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                }
            )
            results["yandex_url"] = str(resp.url)
    except Exception as e:
        results["errors"].append(f"Yandex failed: {str(e)}")

    results["search_links"] = {
        "yandex": "https://yandex.com/images/search?rpt=imageview",
        "google": "https://lens.google.com/upload",
        "bing": "https://www.bing.com/images/search?view=detailv2&iss=sbi",
        "tineye": "https://tineye.com/search",
    }

    return results


async def luxand_face_analyze(image_bytes: bytes) -> dict:
    try:
        api_key = os.getenv("LUXAND_API_KEY")
        if not api_key:
            return {"error": "LUXAND_API_KEY not configured"}

        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            jpeg_buffer = io.BytesIO()
            img.save(jpeg_buffer, format="JPEG", quality=95)
            jpeg_bytes = jpeg_buffer.getvalue()
        except Exception as e:
            return {"error": f"Image conversion failed: {str(e)}"}

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.luxand.cloud/photo/detect",
                headers={"token": api_key},
                files={"photo": ("image.jpg", jpeg_bytes, "image/jpeg")}
            )
            if resp.status_code == 200:
                data = resp.json()

                # Luxand returns a list directly
                if isinstance(data, list):
                    faces = data
                elif isinstance(data, dict):
                    faces = data.get("faces", data.get("data", []))
                else:
                    faces = []

                results = []
                for face in faces:
                    if not isinstance(face, dict):
                        continue
                    results.append({
                        "age": face.get("age"),
                        "gender": face.get("gender"),
                        "emotions": face.get("emotions"),
                        "smile": face.get("smile"),
                        "glasses": face.get("glasses"),
                        "face_token": face.get("face_token"),
                        "rectangle": face.get("rectangle"),
                    })
                return {
                    "status": "success",
                    "faces_found": len(results),
                    "results": results,
                    "raw": data if isinstance(data, list) else None
                }
            else:
                return {"error": f"Luxand error: {resp.status_code} {resp.text}"}
    except Exception as e:
        return {"error": str(e)}


async def facepp_detect(image_bytes: bytes) -> dict:
    try:
        api_key = os.getenv("FACEPP_API_KEY")
        api_secret = os.getenv("FACEPP_API_SECRET")

        if not api_key or not api_secret:
            return {"error": "Face++ credentials not configured"}

        # Convert to JPEG regardless of input format
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            jpeg_buffer = io.BytesIO()
            img.save(jpeg_buffer, format="JPEG", quality=95)
            jpeg_bytes = jpeg_buffer.getvalue()
        except Exception as e:
            return {"error": f"Image conversion failed: {str(e)}"}

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api-us.faceplusplus.com/facepp/v3/detect",
                data={
                    "api_key": api_key,
                    "api_secret": api_secret,
                    "return_attributes": "age,gender,emotion,beauty,skinstatus"
                },
                files={"image_file": ("image.jpg", jpeg_bytes, "image/jpeg")}
            )
            if resp.status_code == 200:
                data = resp.json()
                faces = data.get("faces", [])
                results = []
                for face in faces:
                    attrs = face.get("attributes", {})
                    results.append({
                        "age": attrs.get("age", {}).get("value"),
                        "gender": attrs.get("gender", {}).get("value"),
                        "emotion": attrs.get("emotion"),
                        "beauty": attrs.get("beauty"),
                        "face_token": face.get("face_token"),
                    })
                return {
                    "status": "success",
                    "faces_found": len(faces),
                    "results": results
                }
            else:
                return {"error": f"Face++ error: {resp.status_code} {resp.text}"}
    except Exception as e:
        return {"error": str(e)}


async def search_face_facecheck(image_bytes: bytes) -> dict:
    try:
        img_b64 = base64.b64encode(image_bytes).decode()
        secret_id = os.getenv("FACECHECK_SECRET_ID")
        account_id = os.getenv("FACECHECK_ACCOUNT_ID")

        if not secret_id or not account_id:
            return {"error": "FaceCheck credentials not configured"}

        async with httpx.AsyncClient(timeout=60) as client:
            upload_resp = await client.post(
                "https://facecheck.id/api/upload_pic",
                headers={"accept": "application/json"},
                json={
                    "images": [f"data:image/jpeg;base64,{img_b64}"],
                    "id_search": account_id,
                    "with_progress": False,
                    "status_only": False,
                    "demo": False
                },
                params={"apikey": secret_id}
            )

            if upload_resp.status_code != 200:
                return {"error": f"Upload failed: {upload_resp.status_code}"}

            upload_data = upload_resp.json()

            if upload_data.get("error"):
                return {"error": upload_data["error"]}

            id_search = upload_data.get("id_search")

            if not id_search:
                return {"error": "No search ID returned from FaceCheck"}

            search_resp = await client.post(
                "https://facecheck.id/api/search",
                headers={"accept": "application/json"},
                json={
                    "id_search": id_search,
                    "with_progress": False,
                    "status_only": False,
                    "demo": False
                },
                params={"apikey": secret_id}
            )

            if search_resp.status_code == 200:
                return search_resp.json()
            else:
                return {"error": f"Search failed: {search_resp.status_code}"}

    except Exception as e:
        return {"error": str(e)}


async def yandex_reverse_search(image_bytes: bytes) -> dict:
    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.post(
                "https://yandex.com/images/search",
                params={"rpt": "imageview"},
                files={"upfile": ("image.jpg", image_bytes, "image/jpeg")},
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                }
            )
            return {
                "status": "success",
                "results_url": str(resp.url),
                "status_code": resp.status_code
            }
    except Exception as e:
        return {"error": str(e)}


def extract_exif(image_bytes: bytes) -> dict:
    exif_data = {}
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif_data["Format"] = img.format or "Unknown"
        exif_data["Mode"] = img.mode
        exif_data["Size"] = f"{img.size[0]}x{img.size[1]}"
        raw_exif = img._getexif()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag = TAGS.get(tag_id, tag_id)
                if isinstance(value, bytes):
                    try:
                        value = value.decode(errors="ignore")
                    except Exception:
                        value = str(value)
                exif_data[str(tag)] = str(value)[:200]
    except Exception as e:
        exif_data["error"] = str(e)
    return exif_data


def analyze_face_metadata(exif_data: dict) -> dict:
    intelligence = {
        "device": None,
        "location": None,
        "timestamp": None,
        "software": None,
        "risk_level": "LOW"
    }
    if "Make" in exif_data:
        intelligence["device"] = f"{exif_data.get('Make', '')} {exif_data.get('Model', '')}".strip()
    if "GPSInfo" in exif_data:
        intelligence["location"] = exif_data["GPSInfo"]
        intelligence["risk_level"] = "HIGH"
    if "DateTime" in exif_data:
        intelligence["timestamp"] = exif_data["DateTime"]
    elif "DateTimeOriginal" in exif_data:
        intelligence["timestamp"] = exif_data["DateTimeOriginal"]
    if "Software" in exif_data:
        intelligence["software"] = exif_data["Software"]
    return intelligence


async def identify_face_gemini(image_bytes: bytes) -> dict:
    try:
        import re
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"error": "GEMINI_API_KEY not configured"}

        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            img.thumbnail((1024, 1024))
            jpeg_buffer = io.BytesIO()
            img.save(jpeg_buffer, format="JPEG", quality=95)
            jpeg_bytes = jpeg_buffer.getvalue()
        except Exception as e:
            return {"error": f"Image conversion failed: {str(e)}"}

        img_b64 = base64.b64encode(jpeg_bytes).decode()
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        prompt = """
You are a highly accurate facial recognition AI. Analyze the image step by step:
1. Describe the key facial features of the person (hair color, hairstyle, face shape, eyes, nose, age estimation, expressions).
2. Note any clothing, background, or contextual cues.
3. List candidate names of famous public figures, executives, developers, or celebrities who match these features.
4. Conclude with the most likely identity.

Write your final conclusion at the very end of your response inside double square brackets, like this: [[Name of Person]] (or [[Unknown]] if you cannot identify them).
"""

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": "image/jpeg",
                                "data": img_b64
                            }
                        }
                    ]
                }
            ]
        }

        async with httpx.AsyncClient(timeout=25) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                try:
                    full_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    match = re.search(r"\[\[(.*?)\]\]", full_text)
                    if match:
                        name = match.group(1).strip()
                    else:
                        name = "Unknown"
                    return {
                        "status": "success",
                        "identified_name": name
                    }
                except (KeyError, IndexError) as e:
                    return {"error": f"Failed to parse Gemini response: {str(e)}"}
            else:
                return {"error": f"Gemini error: {resp.status_code} {resp.text}"}
    except Exception as e:
        return {"error": str(e)}