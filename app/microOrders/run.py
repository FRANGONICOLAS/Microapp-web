import requests
from orders.views import app

def register_service():
    payload = {
        "ID": "micro_orders",
        "Name": "micro_orders",
        "Address": "micro_orders",
        "Port": 5004,
        "Check": {
            "HTTP": "http://micro_orders:5004/health",
            "Interval": "10s",
            "DeregisterCriticalServiceAfter": "30s"
        }
    }
    try:
        res = requests.put("http://consul:8500/v1/agent/service/register", json=payload)
        res.raise_for_status()
        print("✅ micro_orders registrado en Consul con health check")
    except Exception as e:
        print("❌ Error registrando micro_orders en Consul:", e)

@app.route("/health")
def health():
    return "OK", 200

if __name__ == "__main__":
    register_service()
    app.run(host="0.0.0.0", port=5004)

