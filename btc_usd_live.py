import time
import pygame
import requests
from datetime import datetime

# Binance Perpetual Futures API for BTC/USDT price (free, no auth required)
TICKER_URL = "https://fapi.binance.com/fapi/v1/ticker/price"
CHANGE_URL = "https://fapi.binance.com/fapi/v1/ticker/24hr"
SYMBOL = "BTCUSDT"

try:
    pygame.mixer.init()
    SOUND_ENABLED = True
    pygame.mixer.music.load("signal.mp3")
except pygame.error:
    print("⚠️ Audio device not found, sound disabled")
    SOUND_ENABLED = False

# Cache variables
last_price_data = None
last_fetch_time = 0
fetch_interval = 1  # seconds between API calls (Binance allows frequent requests)

# 5-minute frame tracking variables
current_frame_start_time = None
frame_start_price = None
signal_triggered = False
price_threshold = 180  # Price change threshold in USD

# Logging
log_file = "btc_usd_live.log"
last_logged_timestamp = None

def get_current_5min_frame():
    """Get the start time of the current 5-minute frame"""
    now = datetime.now()
    minutes = (now.minute // 5) * 5
    frame_start = now.replace(minute=minutes, second=0, microsecond=0)
    return frame_start

def get_btc_price():
    """Fetch latest BTC/USDT price from Binance Perpetual Futures"""
    global last_price_data, last_fetch_time, fetch_interval
    
    current_time = time.time()
    
    # Return cached data if fresh enough
    if last_price_data and (current_time - last_fetch_time) < fetch_interval:
        return last_price_data
    
    try:
        # Get current price
        price_response = requests.get(TICKER_URL, params={"symbol": SYMBOL}, timeout=5)
        price_response.raise_for_status()
        
        price_data = price_response.json()
        price = float(price_data["price"])
        
        # Get 24h change
        try:
            change_response = requests.get(CHANGE_URL, params={"symbol": SYMBOL}, timeout=5)
            change_response.raise_for_status()
            change_data = change_response.json()
            change_24h = float(change_data.get("priceChangePercent", 0))
        except:
            change_24h = 0  # Default if unable to fetch 24h change
        
        timestamp = datetime.now()
        
        result = {
            "price": float(price),
            "change_24h": float(change_24h),
            "timestamp": timestamp,
            "raw": price_data
        }
        
        # Update cache
        last_price_data = result
        last_fetch_time = current_time
        fetch_interval = 1  # Reset to normal interval on success
        
        return result
            
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 429:  # Rate limited
            print(f"Rate limited by Binance, backing off... (fetch interval: {fetch_interval}s)")
            fetch_interval = min(fetch_interval * 2, 60)  # Exponential backoff, max 60s
        else:
            print(f"HTTP error: {e}")
        return last_price_data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching price: {e}")
        return last_price_data

def log_output(message):
    """Log message to both console and file"""
    print(message)
    with open(log_file, "a") as f:
        f.write(message + "\n")

if __name__ == "__main__":
    log_output("Starting 5-minute BTC/USDT (Binance Perpetual) frame tracking...")
    log_output(f"Signal threshold: ±${price_threshold} price change per frame")
    log_output("-" * 80)
    
    while True:
        try:
            result = get_btc_price()
            if result:
                price = result["price"]
                timestamp = result["timestamp"]
                
                last_logged_timestamp = timestamp
                
                # Get current 5-minute frame
                frame_start = get_current_5min_frame()
                
                # Initialize new frame or reset if frame changed
                if current_frame_start_time is None or frame_start != current_frame_start_time:
                    current_frame_start_time = frame_start
                    frame_start_price = price
                    signal_triggered = False
                    log_output(f"\n[NEW FRAME] Now: {timestamp.strftime('%H:%M:%S')} | Frame: {frame_start.strftime('%H:%M:%S')} | Frame Start Price: ${frame_start_price:,.2f}")
                    log_output("Scanning for signals...")

                
                # Calculate price change from frame start
                price_change = price - frame_start_price
                
                # Check for signal conditions
                if not signal_triggered:
                    if price_change >= price_threshold:
                        log_output(f"[SIGNAL] 🟢 INCREASE SIGNAL @ {timestamp.strftime('%H:%M:%S')} | Frame: {frame_start.strftime('%H:%M:%S')} | BTC: ${price:,.2f} | Change: +${price_change:,.2f} from ${frame_start_price:,.2f}")
                        pygame.mixer.music.play()
                        signal_triggered = True
                    elif price_change <= -price_threshold:
                        log_output(f"[SIGNAL] 🔴 DECREASE SIGNAL @ {timestamp.strftime('%H:%M:%S')} | Frame: {frame_start.strftime('%H:%M:%S')} | BTC: ${price:,.2f} | Change: -${abs(price_change):,.2f} from ${frame_start_price:,.2f}")
                        pygame.mixer.music.play()
                        signal_triggered = True
                else:
                    # Signal already triggered, just show updates
                    log_output(f"[{timestamp.strftime('%H:%M:%S')}] Frame: {frame_start.strftime('%H:%M:%S')} | BTC: ${price:,.2f} | Change: {price_change:+,.2f} (Signal triggered)")
                
                time.sleep(1)
            else:
                time.sleep(5)
            
        except KeyboardInterrupt:
            log_output("\n\nStopping...")
            break
        except Exception as e:
            log_output(f"Unexpected error: {e}")
            time.sleep(5)
