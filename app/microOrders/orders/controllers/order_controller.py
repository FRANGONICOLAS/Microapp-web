from flask import Blueprint, request, jsonify
import requests
from orders.models.order_model import Orders, OrderItems
from db.db import db
from datetime import datetime

order_controller = Blueprint('order_controller', __name__)

@order_controller.route('/api/orders/user/<int:user_id>', methods=['GET'])
def get_orders_by_user(user_id):
    print(f"Listado de órdenes para el usuario {user_id}")
    try:
        orders = Orders.query.filter_by(user_id=user_id).all()
        result = []
        for order in orders:
            user_resp = requests.get(f"http://192.168.60.3:5002/api/users/{order.user_id}")
            if user_resp.status_code == 200:
                user_data = user_resp.json()
                user_name = user_data.get('name')
                user_email = user_data.get('email')
            else:
                user_name = "Desconocido"
                user_email = "Desconocido"
            items_list = []
            for item in order.items:
                product_resp = requests.get(f"http://192.168.60.3:5003/api/products/{item.product_id}")
                if product_resp.status_code == 200:
                    product_data = product_resp.json()
                    product_name = product_data.get('name')
                else:
                    product_name = "Desconocido"
                items_list.append({
                    'product': product_name,
                    'quantity': item.quantity,
                    'price': float(item.price)
                })
            result.append({
                'id': order.id,
                'userName': user_name,
                'userEmail': user_email,
                'total': float(order.saleTotal) if order.saleTotal else 0,
                'quantity': sum(item.quantity for item in order.items),
                'date': order.date.isoformat() if order.date else None,
                'items': items_list
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error al obtener órdenes: {e}")
        return jsonify({'error': 'Error al obtener las órdenes'}), 500

@order_controller.route('/api/orders', methods=['GET'])
def get_orders():
    print("Listado de órdenes")
    try:
        orders = Orders.query.all()
        result = []
        for order in orders:
            user_resp = requests.get(f"http://192.168.60.3:5002/api/users/{order.user_id}")
            if user_resp.status_code == 200:
                user_data = user_resp.json()
                user_name = user_data.get('name')
                user_email = user_data.get('email')
            else:
                user_name = "Desconocido"
                user_email = "Desconocido"
            items_list = []
            for item in order.items:
                product_resp = requests.get(f"http://192.168.60.3:5003/api/products/{item.product_id}") 
                if product_resp.status_code == 200:
                    product_data = product_resp.json()
                    product_name = product_data.get('name')
                else:
                    product_name = "Desconocido"
                items_list.append({
                    'product': product_name,
                    'quantity': item.quantity,
                    'price': float(item.price)
                })
            result.append({
                'id': order.id,
                'userName': user_name,
                'userEmail': user_email,
                'total': float(order.saleTotal) if order.saleTotal else 0,
                'quantity': sum(item.quantity for item in order.items),
                'date': order.date.isoformat() if order.date else None,
                'items': items_list
            })  
        return jsonify(result)
    except Exception as e:
        print(f"Error al obtener órdenes: {e}")
        return jsonify({'error': 'Error al obtener las órdenes'}), 500

@order_controller.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):  # Cambié el nombre de la función
    print(f"Obteniendo orden {order_id}")
    try:
        order = Orders.query.get_or_404(order_id)
        return jsonify({
            'id': order.id, 
            'user': order.userName, 
            'email': order.userEmail, 
            'total': float(order.saleTotal), 
            'quantity': order.quantity, 
            'date': order.date.isoformat() if order.date else None
        })
    except Exception as e:
        print(f"Error al obtener orden: {e}")
        return jsonify({'error': 'Orden no encontrada'}), 404

@order_controller.route('/api/orders', methods=['POST'])
def create_order():
    print("Creando orden")
    try:
        data = request.json
        print(f"Datos recibidos: {data}")
        user_id = data.get('userId')
        items = data.get('items', [])

        if not user_id or not items:
            return jsonify({'error': 'Datos incompletos'}), 400
        
        new_order = Orders(user_id=user_id)
        db.session.add(new_order)
        db.session.flush()  # Obtener el ID de la orden recién creada
        
        total = 0
        for item in items:
            product_id = item.get('productId')
            quantity = item.get('quantity', 1)
            
            resp = requests.get(f"http://192.168.60.3:5003/api/products/{product_id}")
            if resp.status_code != 200:
                db.session.rollback()
                return jsonify({'error': f'Producto con ID {product_id} no encontrado'}), 404
            
            product = resp.json()
            price = float (product['price'])
            stock = int (product['quantity'])

            if quantity > stock:
                db.session.rollback()
                return jsonify({'error': f'Stock insuficiente para el producto {product["name"]}'}), 400
            
            subtotal = price * quantity
            total += subtotal

            order_item  = OrderItems(
                order_id=new_order.id,
                product_id=product_id,
                quantity=quantity,
                price=price
            )
            db.session.add(order_item)
            requests.put(f"http://192.168.60.3:5003/api/products/{product_id}", json={"quantity": stock - quantity})
            print(f"Actualizado stock del producto {product['name']} a {stock - quantity}")

        new_order.saleTotal = total
        db.session.commit()
        return jsonify({'message': 'Orden creada exitosamente'}), 201
    
    except Exception as e:
        print(f"Error al crear orden: {e}")
        db.session.rollback()
        return jsonify({'error': f'Error al crear la orden: {str(e)}'}), 500


@order_controller.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):  # Cambié el nombre de la función
    print(f"Eliminando orden {order_id}")
    try:
        order = Orders.query.get_or_404(order_id)
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Orden eliminada exitosamente', 'success': True})
        
    except Exception as e:
        print(f"Error al eliminar orden: {e}")
        db.session.rollback()
        return jsonify({'error': 'Error al eliminar la orden'}), 500