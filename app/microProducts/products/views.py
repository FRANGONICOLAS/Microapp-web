from flask import Flask, render_template
from products.controllers.product_controller import product_controller
from db.db import db
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object('config.Config')
db.init_app(app)

# Configuración CORS
CORS(app, supports_credentials=True)

# Registrando el blueprint del controlador de productos
app.register_blueprint(product_controller)

if __name__ == '__main__':
    app.run()
    
