-- ELIMINAR TABLAS EN ORDEN CORRECTO
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 1. Crear users
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255),
  username VARCHAR(255),
  password VARCHAR(255),
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- INSERTS users
INSERT INTO users (name, email, username, password) VALUES
('Nicolas', 'nico@gmail.com', 'nico', '1234'),
('Carlos', 'carlos@gmail.com', 'carlos', '5678');

-- 2. Crear products
CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255),
  price INT,
  quantity INT,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- INSERTS products
INSERT INTO products (name, price, quantity) VALUES
('Laptop', 1500, 10),
('Mouse', 25, 50);

-- 3. Crear orders
CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  saleTotal DECIMAL(10,2),
  PRIMARY KEY (id),
  KEY (user_id),
  CONSTRAINT orders_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- INSERTS orders
INSERT INTO orders (user_id, date, saleTotal) VALUES
(1, '2025-09-01 10:00:00', 1525.00),
(2, '2025-09-01 11:00:00', 25.00);

-- 4. Crear order_items
CREATE TABLE order_items (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,2),
  PRIMARY KEY (id),
  KEY (order_id),
  KEY (product_id),
  CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- INSERTS order_items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 1500.00), -- Laptop de Nicolas
(1, 2, 1, 25.00);   -- Mouse de Nicolas
