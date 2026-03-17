from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import json
import re
from anthropic import AsyncAnthropic  # Async client officiel
import sqlite3
from contextlib import contextmanager

load_dotenv()

app = FastAPI(title="ClawVoice Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MongoDB Local Setup (async) ---
DB_FILE = "clawvoice.db"

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# Création des tables au démarrage si elles n'existent pas
with get_db() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            settings JSON DEFAULT '{}',
            orders JSON DEFAULT '[]'
        )
    """)
    # Optionnel : insérer un user demo par défaut
    cursor.execute("""
        INSERT OR IGNORE INTO users (user_id, settings, orders)
        VALUES ('demo', '{}', '[]')
    """)
    conn.commit()

def get_user_state(user_id: str = "demo") -> Dict:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT settings, orders FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return {
                "user_id": user_id,
                "settings": json.loads(row["settings"]),
                "orders": json.loads(row["orders"])
            }
        return {"user_id": user_id, "settings": {}, "orders": []}

def update_user_state(user_id: str, update_data: Dict):
    current = get_user_state(user_id)
    current.update(update_data)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO users (user_id, settings, orders)
            VALUES (?, ?, ?)
        """, (
            user_id,
            json.dumps(current.get("settings", {})),
            json.dumps(current.get("orders", []))
        ))
        conn.commit()

# --- Anthropic Client Async ---
anthropic_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
if not os.getenv("ANTHROPIC_API_KEY"):
    raise ValueError("ANTHROPIC_API_KEY manquante dans .env !")

class VoiceCommand(BaseModel):
    text: str
    language: str = "en"
    context: Optional[Dict[str, Any]] = None

class VoiceResponse(BaseModel):
    intent: str
    action: str
    params: Dict[str, Any]
    response_text: str
    navigation: Optional[str] = None


# Claude integration for voice command processing
async def process_with_claude(command: str, language: str = "en", context: Dict = None) -> Dict:
    
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    
    lang_instruction = ""
    if language == "fr":
        lang_instruction = "The user is speaking French. Respond in French."
    else:
        lang_instruction = "The user is speaking English. Respond in English."
    
    system_prompt = f"""You are ClawVoice, an AI assistant for a Binance-like crypto trading app. 
You understand voice commands in English and French and help users navigate, trade, and manage their crypto.
{lang_instruction}

IMPORTANT RULES:
1. You must ALWAYS navigate to the relevant page using the navigation field
2. You must execute the actual action requested (enable/disable settings, place orders, etc.)
3. The params field controls what actually happens in the app

You MUST respond with a valid JSON object (no markdown, no code blocks) with these exact fields:
{{
  "intent": "navigate|trade|account|info|explain|settings",
  "action": "specific action to take",
  "params": {{"key": "value pairs for the action - these control the app"}},
  "response_text": "friendly response to speak back to user",
  "navigation": "screen name to navigate to (REQUIRED)"
}}

Supported screens for navigation:
- home: Main dashboard with portfolio
- markets: Coin list and search
- trade: Buy/sell crypto
- wallet: Balances and assets
- settings: Account settings, 2FA, KYC
- staking: Staking page for earning rewards
- earn: Binance Earn products
- pay: Binance Pay for payments
- futures: Futures trading

Supported actions and their params:

1. ACCOUNT SETTINGS (intent: account)
- enable_2fa: params: {{"enabled": true}} - Enables 2FA
- disable_2fa: params: {{"enabled": false}} - Disables 2FA
- verify_kyc: params: {{"verified": true}} - Marks KYC as verified
- set_antiphishing: params: {{"code": "USER_CODE"}} - Sets anti-phishing code
- toggle_notifications: params: {{"enabled": true/false}} - Toggle notifications

2. APP SETTINGS (intent: settings)
- change_language: params: {{"language": "en" or "fr"}} - Changes app language
- change_currency: params: {{"currency": "USD" or "EUR"}} - Changes display currency

3. SQUARE (intent: square)
- binance square: params: {{"feature": "binance_square"}} - Opens Binance Square page

4. SUPPORT (intent: support)
- binance support: params: {{"feature": "binance_support"}} - Opens Binance Support page

5. TRADING (intent: trade)
- place_order: params: {{"type": "buy/sell", "coin": "BTC", "amount": 0.05, "condition": "price_below/price_above/market", "target_price": 85000}}
- cancel_order: params: {{"order_id": "id"}}

6. WALLET (intent: wallet)
- deposit: params: {{"coin": "BTC"}} - Opens deposit for coin
- withdraw: params: {{"coin": "BTC", "amount": 0.1}} - Opens withdraw
- transfer: params: {{"from": "spot", "to": "futures", "coin": "USDT", "amount": 100}}

7. INFO (intent: info)
- get_balance: params: {{}} - Shows wallet balance
- get_price: params: {{"coin": "BTC"}} - Shows coin price
- get_positions: params: {{}} - Shows open positions/orders

8. EXPLAIN (intent: explain)
- explain_feature: params: {{"feature": "staking/futures/binance_pay/binance_earn"}}

Examples:

"Disable my 2FA" -> {{"intent":"account","action":"disable_2fa","params":{{"enabled":false}},"response_text":"I've disabled two-factor authentication on your account.","navigation":"settings"}}

"Enable 2FA" -> {{"intent":"account","action":"enable_2fa","params":{{"enabled":true}},"response_text":"Two-factor authentication is now enabled.","navigation":"settings"}}

"Change language to French" / "Changer la langue en français" -> {{"intent":"settings","action":"change_language","params":{{"language":"fr"}},"response_text":"J'ai changé la langue de l'application en français.","navigation":"settings"}}

"Change language to English" -> {{"intent":"settings","action":"change_language","params":{{"language":"en"}},"response_text":"I've changed the app language to English.","navigation":"settings"}}

"Désactiver mon 2FA" -> {{"intent":"account","action":"disable_2fa","params":{{"enabled":false}},"response_text":"J'ai désactivé l'authentification à deux facteurs sur votre compte.","navigation":"settings"}}

"Open Binance Square" -> {{"intent":"square","action":"binance_square","params":{{"feature":"binance_square"}},"response_text":"Opening Binance Square.","navigation":"square"}}

"Contact Binance customer support" -> {{"intent":"support","action":"binance_support","params":{{"feature":"binance_support"}},"response_text":"Opening Binance Support.","navigation":"support"}}

"Buy 0.05 BTC" -> {{"intent":"trade","action":"place_order","params":{{"type":"buy","coin":"BTC","amount":0.05,"condition":"market"}},"response_text":"I've placed a market buy order for 0.05 BTC.","navigation":"trade"}}

"Deposit ETH" -> {{"intent":"wallet","action":"deposit","params":{{"coin":"ETH"}},"response_text":"Opening ETH deposit page.","navigation":"wallet"}}

"Withdraw 100 USDT" -> {{"intent":"wallet","action":"withdraw","params":{{"coin":"USDT","amount":100}},"response_text":"Opening withdrawal for 100 USDT.","navigation":"wallet"}}

"Set anti-phishing code to MYCODE123" -> {{"intent":"account","action":"set_antiphishing","params":{{"code":"MYCODE123"}},"response_text":"I've set your anti-phishing code to MYCODE123.","navigation":"settings"}}

"Turn off notifications" -> {{"intent":"account","action":"toggle_notifications","params":{{"enabled":false}},"response_text":"Notifications have been disabled.","navigation":"settings"}}

IMPORTANT: Return ONLY the JSON object, no other text or formatting. ALWAYS include the navigation field and ensure params contains the values needed to execute the action."""

    context_info = ""
    if context:
        context_info = f"\n\nCurrent app context: {json.dumps(context)}"
    
    # Parse the response
    try:
        message = await anthropic_client.messages.create(
            model="claude-sonnet-4-6",  # Ou "claude-3-opus" / "claude-3-5-sonnet-latest" si dispo en 2026
            max_tokens=1024,
            temperature=0.2,  # Pour plus de précision JSON
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"User command: {command}{context_info}"}
            ]
        )

        response_text = message.content[0].text.strip() if message.content else ""
        # Clean up response - remove markdown code blocks if present
        cleaned = response_text
        if cleaned.startswith("```"):
            cleaned = re.sub(r'^```[\w]*\n?', '', cleaned)
            cleaned = re.sub(r'\n?```$', '', cleaned)
        result = json.loads(cleaned)
        # Ensure navigation is always set
        if not result.get("navigation"):
            result["navigation"] = "home"
        return result
    except json.JSONDecodeError:
        return {
            "intent": "info",
            "action": "general_response",
            "params": {},
            "response_text": f"Erreur de parsing : {response_text}",
            "navigation": "home"
        }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "ClawVoice Backend"}

@app.post("/api/voice/process")
async def process_voice_command(command: VoiceCommand):
    """Process a voice command and return structured action"""
    try:
        result = await process_with_claude(command.text, command.language, command.context)
        return VoiceResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error processing voice command: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/prices")
async def get_market_prices():
    """Return mock market prices"""
    import random
    base_prices = {
        "BTC": 87500,
        "ETH": 3200,
        "SOL": 145,
        "BNB": 580,
        "XRP": 0.52,
        "ADA": 0.45,
        "DOGE": 0.12,
        "DOT": 7.50,
        "MATIC": 0.85,
        "LINK": 14.50,
        "AVAX": 35.00,
        "UNI": 9.50,
        "ATOM": 8.75,
        "LTC": 95.00,
        "NEAR": 5.20
    }
    
    prices = []
    for symbol, base_price in base_prices.items():
        change = random.uniform(-5, 5)
        current_price = base_price * (1 + random.uniform(-0.02, 0.02))
        prices.append({
            "symbol": symbol,
            "price": round(current_price, 2) if current_price > 10 else round(current_price, 4),
            "change24h": round(change, 2),
            "volume": f"{random.randint(100, 999)}M",
            "marketCap": f"{random.randint(10, 500)}B"
        })
    
    return {"prices": prices}

@app.get("/api/market/chart/{symbol}")
async def get_chart_data(symbol: str, period: str = "1D"):
    """Return mock chart data for a coin"""
    import random
    
    base_prices = {
        "BTC": 87500, "ETH": 3200, "SOL": 145, "BNB": 580, "XRP": 0.52,
        "ADA": 0.45, "DOGE": 0.12, "DOT": 7.50, "MATIC": 0.85, "LINK": 14.50
    }
    
    base_price = base_prices.get(symbol.upper(), 100)
    
    # Generate chart data points
    points_map = {"1H": 60, "1D": 24, "1W": 7, "1M": 30, "1Y": 12}
    num_points = points_map.get(period, 24)
    
    data = []
    current_price = base_price * (1 + random.uniform(-0.1, 0.1))
    
    for i in range(num_points):
        change = random.uniform(-0.02, 0.02)
        current_price = current_price * (1 + change)
        data.append({
            "x": i,
            "y": round(current_price, 2) if current_price > 10 else round(current_price, 4)
        })
    
    return {"symbol": symbol, "period": period, "data": data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="192.168.100.2", port=8001)
