// Check if owner is logged in
if (!localStorage.getItem('ownerLoggedIn') && window.location.pathname.includes('owner-dashboard.html')) {
  window.location.href = 'owner-login.html';
}

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
  e.preventDefault();
  localStorage.removeItem('ownerLoggedIn');
  window.location.href = 'owner-login.html';
});

// Sample data for orders and customers
let orders = JSON.parse(localStorage.getItem('customerOrders')) || [];
let notifications = JSON.parse(localStorage.getItem('ownerNotifications')) || [];

// Function to generate sample customers from orders
function generateCustomersFromOrders() {
  const customers = {};
  
  orders.forEach(order => {
    if (!customers[order.customer.email]) {
      customers[order.customer.email] = {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        address: `${order.customer.address}, ${order.customer.city}`,
        totalOrders: 1,
        totalSpent: order.subtotal
      };
    } else {
      customers[order.customer.email].totalOrders += 1;
      customers[order.customer.email].totalSpent += order.subtotal;
    }
  });
  
  return Object.values(customers);
}

// Function to update dashboard stats
function updateDashboardStats() {
  // Today's orders
  const today = new Date().toISOString().split('T')[0];
  const todayOrdersCount = orders.filter(order => 
    order.date.split('T')[0] === today
  ).length;
  document.getElementById('todayOrders').textContent = todayOrdersCount;
  
  // Monthly revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    })
    .reduce((total, order) => total + order.subtotal, 0);
  document.getElementById('monthlyRevenue').textContent = `$${monthlyRevenue.toFixed(2)}`;
  
  // Total customers
  const customers = generateCustomersFromOrders();
  document.getElementById('totalCustomers').textContent = customers.length;
  
  // Notifications
  document.getElementById('notificationCount').textContent = notifications.length;
}

// Function to render recent orders (newest first)
function renderRecentOrders() {
  const recentOrdersTable = document.getElementById('recentOrdersTable');
  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentOrders = sortedOrders.slice(0, 5); // Get 5 most recent orders
  
  if (recentOrders.length === 0) {
    recentOrdersTable.innerHTML = '<p>No recent orders</p>';
    return;
  }
  
  let html = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  recentOrders.forEach(order => {
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    html += `
      <tr>
        <td>#${order.id}</td>
        <td>${order.customer.name}</td>
        <td>${formattedDate}</td>
        <td>$${order.subtotal.toFixed(2)}</td>
        <td><span class="status completed">Completed</span></td>
        <td><button class="view-btn" onclick="showOrderDetails(${order.id})">View</button></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  recentOrdersTable.innerHTML = html;
}

// Function to render all orders (newest first)
function renderAllOrders() {
  const allOrdersTable = document.getElementById('allOrdersTable');
  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (sortedOrders.length === 0) {
    allOrdersTable.innerHTML = '<p>No orders found</p>';
    return;
  }
  
  let html = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Payment</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  sortedOrders.forEach(order => {
    const orderDate = new Date(order.date);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    html += `
      <tr>
        <td>#${order.id}</td>
        <td>${order.customer.name}</td>
        <td>${formattedDate}</td>
        <td>$${order.subtotal.toFixed(2)}</td>
        <td>${order.paymentMethod === 'credit' ? 'Credit Card' : 'PayPal'}</td>
        <td><span class="status completed">Completed</span></td>
        <td><button class="view-btn" onclick="showOrderDetails(${order.id})">View</button></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  allOrdersTable.innerHTML = html;
}

// Function to render customers
function renderCustomers() {
  const customersTable = document.getElementById('customersTable');
  const customers = generateCustomersFromOrders();
  
  if (customers.length === 0) {
    customersTable.innerHTML = '<p>No customers found</p>';
    return;
  }
  
  let html = `
    <table class="customers-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Contact</th>
          <th>Orders</th>
          <th>Total Spent</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  customers.forEach(customer => {
    const initials = customer.name.split(' ').map(n => n[0]).join('');
    
    html += `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="customer-avatar">${initials}</div>
            <div>${customer.name}</div>
          </div>
        </td>
        <td>
          <div>${customer.email}</div>
          <div style="font-size: 0.8rem; color: var(--gray);">${customer.phone}</div>
        </td>
        <td>${customer.totalOrders}</td>
        <td>$${customer.totalSpent.toFixed(2)}</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  customersTable.innerHTML = html;
}

// Function to show detailed order information
function showOrderDetails(orderId) {
  const order = orders.find(o => o.id == orderId);
  if (!order) return;

  // Create modal container
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'white';
  modalContent.style.borderRadius = '8px';
  modalContent.style.padding = '2rem';
  modalContent.style.maxWidth = '800px';
  modalContent.style.width = '90%';
  modalContent.style.maxHeight = '90vh';
  modalContent.style.overflowY = 'auto';
  
  // Close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.float = 'right';
  closeButton.style.marginBottom = '1rem';
  closeButton.style.padding = '0.5rem 1rem';
  closeButton.style.backgroundColor = 'var(--accent)';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '4px';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', () => modal.remove());
  
  // Order details
  const orderDate = new Date(order.date);
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let itemsHtml = '';
  let subtotal = 0;
  
  order.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    itemsHtml += `
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #eee;">
        <div style="flex: 0 0 100px;">
          <img src="${item.image}" alt="${item.name}" style="width: 100%; border-radius: 4px;">
        </div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 0.5rem 0;">${item.name}</h3>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 0.2rem 0;">Price: $${item.price.toFixed(2)}</p>
              <p style="margin: 0.2rem 0;">Quantity: ${item.quantity}</p>
            </div>
            <div style="font-weight: bold;">$${itemTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>
    `;
  });
  
  modalContent.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h2 style="margin-top: 0;">Order #${order.id}</h2>
      <p style="color: #666;">${formattedDate}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
      <div>
        <h3 style="margin-top: 0;">Customer Information</h3>
        <p><strong>Name:</strong> ${order.customer.name}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.zip}, ${order.customer.country}</p>
      </div>
      <div>
        <h3 style="margin-top: 0;">Payment Information</h3>
        <p><strong>Method:</strong> ${order.paymentMethod === 'credit' ? 'Credit Card' : 'PayPal'}</p>
        ${order.paymentMethod === 'credit' ? `
          <p><strong>Card Number:</strong> **** **** **** ${document.getElementById('cardNumber')?.value.slice(-4) || '1234'}</p>
          <p><strong>Name on Card:</strong> ${document.getElementById('cardName')?.value || order.customer.name}</p>
        ` : ''}
      </div>
    </div>
    
    <h3>Order Items</h3>
    ${itemsHtml}
    
    <div style="border-top: 1px solid #eee; padding-top: 1rem; text-align: right;">
      <p style="font-weight: bold; font-size: 1.2rem;">Total: $${subtotal.toFixed(2)}</p>
    </div>
  `;
  
  modalContent.prepend(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Function to check for new orders and create notifications
function checkForNewOrders() {
  const lastChecked = localStorage.getItem('lastOrderCheck') || 0;
  const newOrders = orders.filter(order => 
    new Date(order.date).getTime() > lastChecked
  );
  
  if (newOrders.length > 0) {
    newOrders.forEach(order => {
      notifications.push({
        id: Date.now(),
        message: `New order from ${order.customer.name} for $${order.subtotal.toFixed(2)}`,
        orderId: order.id,
        date: new Date().toISOString(),
        read: false
      });
    });
    
    localStorage.setItem('ownerNotifications', JSON.stringify(notifications));
    localStorage.setItem('lastOrderCheck', Date.now());
    
    // Show notification alert
    if (newOrders.length === 1) {
      alert(`New order received from ${newOrders[0].customer.name}`);
    } else {
      alert(`${newOrders.length} new orders received`);
    }
    
    // Update notification count
    document.getElementById('notificationCount').textContent = notifications.length;
  }
}

// Function to handle navigation between sections
function setupNavigation() {
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links
      document.querySelectorAll('.sidebar-nav li').forEach(li => {
        li.classList.remove('active');
      });
      
      // Add active class to clicked link
      this.parentElement.classList.add('active');
      
      // Hide all sections
      document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
      });
      
      // Show the selected section
      const target = this.getAttribute('href').substring(1);
      if (target === 'orders') {
        document.getElementById('ordersSection').style.display = 'block';
        renderAllOrders();
      } else if (target === 'customers') {
        document.getElementById('customersSection').style.display = 'block';
        renderCustomers();
      } else {
        document.getElementById('dashboardSection').style.display = 'block';
      }
    });
  });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
  setupNavigation();
  updateDashboardStats();
  renderRecentOrders();
  
  // Check for new orders every 30 seconds
  checkForNewOrders();
  setInterval(checkForNewOrders, 30000);
  
  // Notification bell click handler
  document.getElementById('notificationBell')?.addEventListener('click', function() {
    if (notifications.length > 0) {
      const unreadCount = notifications.filter(n => !n.read).length;
      if (unreadCount > 0) {
        alert(`You have ${unreadCount} unread notifications`);
        // Mark as read
        notifications = notifications.map(n => ({ ...n, read: true }));
        localStorage.setItem('ownerNotifications', JSON.stringify(notifications));
        document.getElementById('notificationCount').textContent = '0';
      } else {
        alert('No new notifications');
      }
    } else {
      alert('No notifications');
    }
  });
});