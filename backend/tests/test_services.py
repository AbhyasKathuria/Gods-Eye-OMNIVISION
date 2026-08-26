import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from services import geo_service, cyber_service, osint_service, recon_service


@pytest.mark.asyncio
@patch("httpx.AsyncClient.get")
async def test_geocode_location(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = [
        {
            "display_name": "Test City",
            "lat": "12.34",
            "lon": "56.78",
            "type": "city",
            "importance": 0.9,
            "address": {"city": "Test City"}
        }
    ]
    mock_get.return_value = mock_resp
    
    res = await geo_service.geocode_location("Test City")
    assert res["status"] == "success"
    assert len(res["results"]) == 1
    assert res["results"][0]["name"] == "Test City"
    assert res["results"][0]["latitude"] == 12.34
    assert res["results"][0]["longitude"] == 56.78


@pytest.mark.asyncio
@patch("httpx.AsyncClient.get")
async def test_reverse_geocode(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "display_name": "Reverse Test Address",
        "address": {"suburb": "Test Suburb"}
    }
    mock_get.return_value = mock_resp
    
    res = await geo_service.reverse_geocode(12.34, 56.78)
    assert res["status"] == "success"
    assert res["display_name"] == "Reverse Test Address"


@pytest.mark.asyncio
@patch("httpx.AsyncClient.get")
async def test_get_weather(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "name": "London",
        "sys": {"country": "GB"},
        "main": {
            "temp": 15.5,
            "feels_like": 14.2,
            "humidity": 80,
            "pressure": 1012
        },
        "weather": [{"description": "overcast clouds"}],
        "wind": {"speed": 5.1},
        "visibility": 10000
    }
    mock_get.return_value = mock_resp
    
    res = await geo_service.get_weather(51.5074, -0.1278)
    assert res["status"] == "success"
    assert res["city"] == "London"
    assert res["temperature"] == 15.5
    assert res["weather"] == "overcast clouds"


@pytest.mark.asyncio
@patch("httpx.AsyncClient.get")
async def test_ip_lookup(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "ip": "8.8.8.8",
        "country_name": "United States",
        "country_code2": "US",
        "city": "Mountain View",
        "latitude": 37.386,
        "longitude": -122.0838,
        "isp": "Google LLC",
        "organization": "Google LLC",
        "time_zone": {"name": "America/Los_Angeles"},
        "security": {
            "is_proxy": False,
            "is_tor": False,
            "threat_score": 0
        }
    }
    mock_get.return_value = mock_resp
    
    res = await cyber_service.ip_lookup("8.8.8.8")
    assert "geolocation" in res
    assert res["geolocation"]["ip"] == "8.8.8.8"
    assert res["geolocation"]["country"] == "United States"
    assert res["geolocation"]["isp"] == "Google LLC"


def test_analyze_phone_locally():
    res = osint_service.analyze_phone_locally("+918076543210", country_code="IN", carrier="Reliance Jio")
    assert res is not None
    assert "Asia/Kolkata" in res.get("timezone", "")
    assert "Reliance Jio" in res.get("original_carrier", "")


@pytest.mark.asyncio
async def test_calculate_threat_score():
    mock_data = {
        "vt_malicious": 4,          # adds 20
        "abuse_score": 80,           # adds 20
        "domain_age_days": 5,        # adds 15
        "breach_count": 2,           # adds 6
    }
    score_res = await recon_service.calculate_threat_score(mock_data)
    assert score_res["score"] > 50
    assert "HIGH" in score_res["level"]


@pytest.mark.asyncio
@patch("httpx.AsyncClient.get")
@patch("httpx.AsyncClient.post")
async def test_domain_lookup(mock_post, mock_get):
    mock_resp_get = MagicMock()
    mock_resp_get.status_code = 200
    mock_resp_get.json.return_value = {
        "WhoisRecord": {
            "domainName": "example.com",
            "registrarName": "VeriSign",
            "createdDate": "1995-08-14"
        },
        "Answer": [{"type": 1, "data": "93.184.216.34"}],
        "uuid": "test-uuid"
    }
    mock_get.return_value = mock_resp_get

    mock_resp_post = MagicMock()
    mock_resp_post.status_code = 200
    mock_resp_post.json.return_value = {
        "query_status": "ok",
        "urlhaus_reference": "https://urlhaus.abuse.ch/host/example.com/",
        "url_count": 0,
        "blacklists": {"spamhaus_dbl": "not listed", "surbl": "not listed"}
    }
    mock_post.return_value = mock_resp_post

    res = await cyber_service.domain_lookup("example.com")
    assert "whois" in res
    assert res["whois"]["domain"] == "example.com"
    assert "dns" in res
    assert "urlhaus" in res
    assert res["urlhaus"]["status"] == "ok"
