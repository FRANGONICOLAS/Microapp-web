from db.db import db
from datetime import datetime

class Orders(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)  # Referencia simple, sin foreign key
    date = db.Column(db.DateTime, default=datetime.utcnow)
    saleTotal = db.Column(db.Numeric(10, 2))

    items = db.relationship('OrderItems', backref='order', cascade='all, delete-orphan')

    

class OrderItems(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'))
    product_id = db.Column(db.Integer, nullable=False)  # Referencia simple, sin foreign key
    quantity = db.Column(db.Integer, default=1)
    price = db.Column(db.Numeric(10, 2))

