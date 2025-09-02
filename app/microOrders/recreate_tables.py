from db.db import db
from orders.models.order_model import Orders, OrderItems
from config import Config
from flask import Flask

# Crear aplicación Flask
app = Flask(__name__)
app.config.from_object(Config)

# Inicializar la base de datos
db.init_app(app)

with app.app_context():
    # Eliminar las tablas existentes si existen
    try:
        db.drop_all()
        print("Tablas eliminadas exitosamente")
    except Exception as e:
        print(f"Error al eliminar tablas: {e}")
    
    # Crear todas las tablas
    try:
        db.create_all()
        print("Tablas creadas exitosamente:")
        print("- orders")
        print("- order_items")
    except Exception as e:
        print(f"Error al crear tablas: {e}")
        
print("Proceso completado.")