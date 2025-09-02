let availableProducts = [];
function getProducts() {
    fetch('http://192.168.60.3:5003/api/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Productos disponibles:', data);
        availableProducts = data; // Guardar productos globalmente
        
        // Get table body
        var productListBody = document.querySelector('#product-list tbody');
        productListBody.innerHTML = ''; // Clear previous data

        // Loop through products and populate table rows (solo visualización)
        data.forEach(product => {
            var row = document.createElement('tr');

            // ID
            var idCell = document.createElement('td');
            idCell.textContent = product.id;
            row.appendChild(idCell);

            // Nombre
            var nameCell = document.createElement('td');
            nameCell.textContent = product.name;
            row.appendChild(nameCell);

            // Precio
            var priceCell = document.createElement('td');
            priceCell.textContent = `$${parseFloat(product.price).toFixed(2)}`;
            row.appendChild(priceCell);

            // Cantidad Disponible
            var stockCell = document.createElement('td');
            stockCell.textContent = product.quantity;
            row.appendChild(stockCell);

            productListBody.appendChild(row);
        });
        
        // Actualizar los selects de productos existentes
        updateProductSelects();
    })
    .catch(error => {
        console.error('Error al obtener productos:', error);
        alert('Error al cargar los productos. Por favor, intenta nuevamente.');
    });
}

// Función para agregar un nuevo item de orden
function addOrderItem() {
    const orderItemsContainer = document.getElementById('order-items');
    const itemIndex = orderItemsContainer.children.length;
    
    const orderItemDiv = document.createElement('div');
    orderItemDiv.className = 'order-item';
    orderItemDiv.id = `order-item-${itemIndex}`;
    
    orderItemDiv.innerHTML = `
        <div class="row align-items-center">
            <div class="col-md-3">
                <label class="form-label">Producto:</label>
                <select class="form-select product-select" onchange="updatePrice(${itemIndex})">
                    <option value="">Seleccionar producto...</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Precio:</label>
                <input type="text" class="form-control price-display" readonly placeholder="$0.00">
            </div>
            <div class="col-md-3">
                <label class="form-label">Cantidad:</label>
                <div class="plus-minus-input">
                    <button type="button" class="btn btn-outline-secondary" onclick="decreaseQuantity(${itemIndex})">-</button>
                    <input type="number" class="form-control quantity-input" value="0" min="0" onchange="updateSubtotal(${itemIndex})">
                    <button type="button" class="btn btn-outline-secondary" onclick="increaseQuantity(${itemIndex})">+</button>
                </div>
            </div>
            <div class="col-md-2">
                <label class="form-label">Subtotal:</label>
                <input type="text" class="form-control subtotal-display" readonly placeholder="$0.00">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(${itemIndex})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `;
    
    orderItemsContainer.appendChild(orderItemDiv);
    updateProductSelects();
}

// Función para actualizar los selects de productos con los datos disponibles
function updateProductSelects() {
    const selects = document.querySelectorAll('.product-select');
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Seleccionar producto...</option>';
        
        availableProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (Stock: ${product.quantity})`;
            option.setAttribute('data-price', product.price);
            option.setAttribute('data-stock', product.quantity);
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

// Función para actualizar el precio cuando se selecciona un producto
function updatePrice(itemIndex) {
    const orderItem = document.getElementById(`order-item-${itemIndex}`);
    const select = orderItem.querySelector('.product-select');
    const priceDisplay = orderItem.querySelector('.price-display');
    const quantityInput = orderItem.querySelector('.quantity-input');
    
    if (select.value) {
        const selectedOption = select.options[select.selectedIndex];
        const price = parseFloat(selectedOption.getAttribute('data-price'));
        const maxStock = parseInt(selectedOption.getAttribute('data-stock'));
        
        priceDisplay.value = `$${price.toFixed(2)}`;
        quantityInput.max = maxStock;
        quantityInput.value = 0;
        
        updateSubtotal(itemIndex);
    } else {
        priceDisplay.value = '$0.00';
        quantityInput.max = 0;
        quantityInput.value = 0;
        updateSubtotal(itemIndex);
    }
}

// Función para aumentar la cantidad
function increaseQuantity(itemIndex) {
    const orderItem = document.getElementById(`order-item-${itemIndex}`);
    const quantityInput = orderItem.querySelector('.quantity-input');
    const maxStock = parseInt(quantityInput.max) || 0;
    
    if (parseInt(quantityInput.value) < maxStock) {
        quantityInput.value = parseInt(quantityInput.value) + 1;
        updateSubtotal(itemIndex);
    }
}

// Función para disminuir la cantidad
function decreaseQuantity(itemIndex) {
    const orderItem = document.getElementById(`order-item-${itemIndex}`);
    const quantityInput = orderItem.querySelector('.quantity-input');
    
    if (parseInt(quantityInput.value) > 0) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
        updateSubtotal(itemIndex);
    }
}

// Función para actualizar el subtotal de un item
function updateSubtotal(itemIndex) {
    const orderItem = document.getElementById(`order-item-${itemIndex}`);
    const priceText = orderItem.querySelector('.price-display').value;
    const quantity = parseInt(orderItem.querySelector('.quantity-input').value) || 0;
    const subtotalDisplay = orderItem.querySelector('.subtotal-display');
    
    if (priceText && priceText !== '$0.00') {
        const price = parseFloat(priceText.replace('$', ''));
        const subtotal = price * quantity;
        subtotalDisplay.value = `$${subtotal.toFixed(2)}`;
    } else {
        subtotalDisplay.value = '$0.00';
    }
    
    updateOrderTotal();
}

// Función para actualizar el total general de la orden
function updateOrderTotal() {
    let total = 0;
    const orderItems = document.querySelectorAll('.order-item');
    
    orderItems.forEach(item => {
        const subtotalText = item.querySelector('.subtotal-display').value;
        if (subtotalText && subtotalText !== '$0.00') {
            total += parseFloat(subtotalText.replace('$', ''));
        }
    });
    
    const totalDisplay = document.getElementById('order-total');
    const totalAmount = document.getElementById('total-amount');
    
    if (total > 0) {
        totalAmount.textContent = `$${total.toFixed(2)}`;
        totalDisplay.style.display = 'block';
    } else {
        totalDisplay.style.display = 'none';
    }
}

// Función para eliminar un item de la orden
function removeOrderItem(itemIndex) {
    const orderItem = document.getElementById(`order-item-${itemIndex}`);
    if (orderItem) {
        orderItem.remove();
        updateOrderTotal();
    }
}

// Función para crear la orden
function createOrder() {
    const orderItems = document.querySelectorAll('.order-item');
    const selectedProducts = [];
    
    orderItems.forEach(item => {
        const select = item.querySelector('.product-select');
        const quantityInput = item.querySelector('.quantity-input');
        const quantity = parseInt(quantityInput.value) || 0;
        
        if (select.value && quantity > 0) {
            const selectedOption = select.options[select.selectedIndex];
            selectedProducts.push({
                id: parseInt(select.value),
                name: selectedOption.textContent.split(' (Stock:')[0],
                quantity: quantity,
                price: parseFloat(selectedOption.getAttribute('data-price'))
            });
        }
    });
    
    if (selectedProducts.length === 0) {
        alert('Por favor, selecciona al menos un producto con cantidad mayor a 0 para crear la orden.');
        return;
    }
    
    // Mostrar resumen de la orden
    const summary = selectedProducts.map(p => `${p.name}: ${p.quantity} unidades - $${(p.price * p.quantity).toFixed(2)}`).join('\n');
    const total = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    if (!confirm(`¿Confirmas la creación de esta orden?\n\n${summary}\n\nTotal: $${total.toFixed(2)}`)) {
        return;
    }
    
    console.log("Recuperando ID session storage" + sessionStorage.getItem('user_id'));
    const orderData = {
        userId: parseInt(sessionStorage.getItem('user_id')),
        items: selectedProducts.map(p => ({
            productId: p.id,
            quantity: p.quantity
        }))
    }

    
    console.log('Enviando orden:', orderData);
    
    // Enviar la orden
    fetch('http://192.168.60.3:5004/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'Orden creada exitosamente' || data.success) {
            alert('¡Orden creada exitosamente!');
            
            // Limpiar los items de la orden
            document.getElementById('order-items').innerHTML = '';
            addOrderItem(); // Agregar un nuevo item vacío
            
            // Actualizar la lista de productos para reflejar el nuevo stock
            getProducts();
        } else {
            alert(`Error al crear la orden: ${data.message || data.error || 'Error desconocido'}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`Ocurrió un error al procesar la orden: ${error.message}. Por favor, intenta nuevamente.`);
    });
}

// Función para obtener y mostrar todas las órdenes
function getOrders() {
    const user_id = sessionStorage.getItem('user_id');
    if (!user_id) {
        alert('Usuario no autenticado');
        return;
    }
    fetch(`http://192.168.60.3:5004/api/orders/user/${user_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Órdenes obtenidas:', data);
        displayOrders(data);
    })
    .catch(error => {
        console.error('Error al obtener órdenes:', error);
        alert('Error al cargar las órdenes. Por favor, intenta nuevamente.');
    });
}

// Función para mostrar las órdenes en una tabla
function displayOrders(orders) {
    // Crear o encontrar el contenedor para las órdenes
    let ordersContainer = document.getElementById('orders-container');
    
    if (!ordersContainer) {
        // Crear el contenedor si no existe
        const mainContainer = document.querySelector('.container');
        ordersContainer = document.createElement('div');
        ordersContainer.id = 'orders-container';
        ordersContainer.className = 'row mt-5';
        ordersContainer.innerHTML = `
            <div class="col-12">
                <h3>Órdenes Realizadas</h3>
                <div class="table-responsive">
                    <table id="orders-list" class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Total</th>
                                <th>Cantidad Items</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Las órdenes se cargarán aquí dinámicamente -->
                        </tbody>
                    </table>
                </div>
                <button type="button" class="btn btn-info" onclick="getOrders()">
                    <i class="fas fa-sync-alt"></i> Actualizar Lista de Órdenes
                </button>
            </div>
        `;
        mainContainer.appendChild(ordersContainer);
    }
    
    // Obtener el tbody de la tabla
    const ordersTableBody = document.querySelector('#orders-list tbody');
    ordersTableBody.innerHTML = ''; // Limpiar datos previos
    
    // Si no hay órdenes
    if (!orders || orders.length === 0) {
        const noOrdersRow = document.createElement('tr');
        noOrdersRow.innerHTML = `
            <td colspan="7" class="text-center text-muted">
                <em>No hay órdenes registradas</em>
            </td>
        `;
        ordersTableBody.appendChild(noOrdersRow);
        return;
    }
    
    // Agregar cada orden a la tabla
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // ID
        const idCell = document.createElement('td');
        idCell.textContent = order.id;
        row.appendChild(idCell);
        
        // Usuario
        const userCell = document.createElement('td');
        userCell.textContent = order.userName || 'N/A';
        row.appendChild(userCell);
        
        // Email
        const emailCell = document.createElement('td');
        emailCell.textContent = order.userEmail || 'N/A';
        row.appendChild(emailCell);
        
        // Total
        const totalCell = document.createElement('td');
        totalCell.textContent = `$${parseFloat(order.total || 0).toFixed(2)}`;
        totalCell.className = 'fw-bold text-success';
        row.appendChild(totalCell);
        
        // Cantidad de items
        const quantityCell = document.createElement('td');
        const totalItems = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        quantityCell.textContent = totalItems;
        row.appendChild(quantityCell);
        
        // Fecha
        const dateCell = document.createElement('td');
        if (order.date) {
            const date = new Date(order.date);
            dateCell.textContent = date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else {
            dateCell.textContent = 'N/A';
        }
        row.appendChild(dateCell);
        
        // Acciones
        const actionsCell = document.createElement('td');
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger';
        deleteButton.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
        deleteButton.onclick = () => deleteOrder(order.id);
        
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        
        ordersTableBody.appendChild(row);
    });
}

// Función para eliminar una orden
function deleteOrder(orderId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta orden? Esta acción no se puede deshacer.')) {
        return;
    }

    fetch(`http://192.168.60.3:5004/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Orden eliminada exitosamente');
            getOrders(); // Actualizar la lista
        } else {
            alert(`Error al eliminar la orden: ${data.error || 'Error desconocido'}`);
        }
    })
    .catch(error => {
        console.error('Error al eliminar orden:', error);
        alert('Error al eliminar la orden. Por favor, intenta nuevamente.');
    });
}

