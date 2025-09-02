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
    try:
        # Verificar órdenes
        orders = Orders.query.all()
        print(f"Total de órdenes: {len(orders)}")
        
        for order in orders:
            print(f"Orden ID: {order.id}, User ID: {order.user_id}, Total: {order.saleTotal}, Fecha: {order.date}")
            
            # Verificar items de la orden
            items = OrderItems.query.filter_by(order_id=order.id).all()
            print(f"  Items: {len(items)}")
            for item in items:
                print(f"    Item ID: {item.id}, Product ID: {item.product_id}, Quantity: {item.quantity}, Price: {item.price}")
            print("---")
            
    except Exception as e:
        print(f"Error al consultar órdenes: {e}")
        
print("Consulta completada.")