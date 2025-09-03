import requests
from web.views import app

def register_service():
    payload = {
        "ID": "frontend",
        "Name": "frontend",
        "Address": "frontend",
        "Port": 5001,
        "Check": {
            "HTTP": "http://frontend:5001/health",
            "Interval": "10s",
            "DeregisterCriticalServiceAfter": "30s"
        }
    }
    try:
        res = requests.put("http://consul:8500/v1/agent/service/register", json=payload)
        res.raise_for_status()
        print("✅ frontend registrado en Consul con health check")
    except Exception as e:
        print("❌ Error registrando frontend en Consul:", e)

@app.route("/health")
def health():
    return "OK", 200

if __name__ == "__main__":
    register_service()
    app.run(host="0.0.0.0", port=5001, debug=True)

