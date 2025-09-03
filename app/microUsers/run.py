import time
import requests
from users.views import app

# Endpoint de health
@app.route("/health")
def health():
    return "OK", 200

def register_service():
    payload = {
        "ID": "micro_users",
        "Name": "micro_users",
        "Address": "micro_users",
        "Port": 5002,
        "Check": {
            "HTTP": "http://micro_users:5002/health",
            "Interval": "10s",
            "DeregisterCriticalServiceAfter": "30s"
        }
    }
    for i in range(5):
        try:
            res = requests.put("http://consul:8500/v1/agent/service/register", json=payload)
            res.raise_for_status()
            print("✅ micro_users registrado en Consul")
            return
        except Exception as e:
            print(f"❌ micro_users intento {i+1}: {e}")
            time.sleep(3)

if __name__ == "__main__":
    register_service()
    app.run(host="0.0.0.0", port=5002)

