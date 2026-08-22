from fastapi import APIRouter, HTTPException
from services.crypto_service import check_eth_wallet, check_btc_wallet

router = APIRouter(prefix="/crypto", tags=["Crypto Tracker"])

@router.get("/balance/{coin}/{address}")
async def get_wallet_balance(coin: str, address: str):
    try:
        if coin.upper() == "ETH":
            data = await check_eth_wallet(address)
        elif coin.upper() == "BTC":
            data = await check_btc_wallet(address)
        else:
            raise HTTPException(status_code=400, detail="Supported coins are ETH and BTC")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
