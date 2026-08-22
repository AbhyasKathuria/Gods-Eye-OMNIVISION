import httpx
import os
import pathlib
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

async def check_eth_wallet(address: str) -> dict:
    results = {}
    api_key = os.getenv("ETHERSCAN_API_KEY", "").strip()
    
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # 1. Fetch balance (Wei value)
            balance_resp = await client.get(
                "https://api.etherscan.io/api",
                params={
                    "module": "account",
                    "action": "balance",
                    "address": address,
                    "tag": "latest",
                    "apikey": api_key
                }
            )
            balance = "0"
            if balance_resp.status_code == 200:
                data = balance_resp.json()
                if data.get("status") == "1":
                    wei = int(data.get("result", 0))
                    balance = str(wei / (10**18)) # Convert Wei to Ether
            
            # 2. Fetch latest transactions
            tx_resp = await client.get(
                "https://api.etherscan.io/api",
                params={
                    "module": "account",
                    "action": "txlist",
                    "address": address,
                    "startblock": 0,
                    "endblock": 99999999,
                    "page": 1,
                    "offset": 10,
                    "sort": "desc",
                    "apikey": api_key
                }
            )
            txs = []
            if tx_resp.status_code == 200:
                data = tx_resp.json()
                if data.get("status") == "1":
                    raw_txs = data.get("result", [])
                    for t in raw_txs:
                        txs.append({
                            "hash": t.get("hash"),
                            "from": t.get("from"),
                            "to": t.get("to"),
                            "value": str(int(t.get("value", 0)) / (10**18)), # Ether value
                            "timestamp": t.get("timeStamp"),
                            "blockNumber": t.get("blockNumber"),
                            "isError": t.get("isError")
                        })
            
            results = {
                "status": "success",
                "coin": "ETH",
                "address": address,
                "balance": balance,
                "transactions": txs
            }
    except Exception as e:
        results = {
            "status": "error",
            "coin": "ETH",
            "address": address,
            "message": str(e)
        }
    return results

async def check_btc_wallet(address: str) -> dict:
    results = {}
    token = os.getenv("BLOCKCYPHER_TOKEN", "").strip()
    
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://api.blockcypher.com/v1/btc/main/addrs/{address}",
                params={"token": token, "limit": 10} if token else {"limit": 10}
            )
            if resp.status_code == 200:
                data = resp.json()
                # Balance is in Satoshis (1 BTC = 10^8 Satoshis)
                final_balance = data.get("final_balance", 0) / 10**8
                total_received = data.get("total_received", 0) / 10**8
                total_sent = data.get("total_sent", 0) / 10**8
                
                raw_txs = data.get("txrefs", [])
                txs = []
                for t in raw_txs:
                    txs.append({
                        "hash": t.get("tx_hash"),
                        "from": "Unknown" if t.get("tx_input_n") >= 0 else address,
                        "to": address if t.get("tx_input_n") >= 0 else "Unknown",
                        "value": str(t.get("value", 0) / 10**8),
                        "timestamp": t.get("confirmed"),
                        "blockNumber": t.get("block_height"),
                        "isError": "0"
                    })
                
                results = {
                    "status": "success",
                    "coin": "BTC",
                    "address": address,
                    "balance": str(final_balance),
                    "total_received": str(total_received),
                    "total_sent": str(total_sent),
                    "transactions": txs
                }
            else:
                results = {
                    "status": "error",
                    "coin": "BTC",
                    "address": address,
                    "message": f"Blockcypher responded with status {resp.status_code}: {resp.text}"
                }
    except Exception as e:
        results = {
            "status": "error",
            "coin": "BTC",
            "address": address,
            "message": str(e)
        }
    return results
