// Global state

// API base helper (supports production backend on different origin)
const API_BASE = (localStorage.getItem('API_BASE') || (document.querySelector('meta[name="api-base"]')?.content) || '').trim();
function api(path) {
    const base = API_BASE ? API_BASE.replace(/\/$/, '') : '';
    return base + path;
}

// Load inventory from backend
async function loadInventory() {
  try {
    const res = await fetch(api('/api/inventory'));
    if (!res.ok) throw new Error('Failed to fetch inventory');

    inventory = await res.json();
    displayInventory();
    updateDashboard();
    checkInventoryEmpty();
  } catch (error) {
    console.error('Error loading inventory:', error);
    const grid = document.getElementById('inventory-grid');
    if (Array.isArray(inventory) && inventory.length > 0) {
      // Show whatever we have cached
      try { displayInventory(); } catch (_) {}
    } else if (grid) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 24px;">No products to show</p>';
    }
  }
}
// Helper used by Home tiles
function openSection(sectionId) {
    closeMobileMenu();
    showSection(sectionId, null);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
}

let inventory = [];
let cart = [];
let currentFilter = 'all';
let currentBillingFilter = 'all';
let currentBill = null;
let upiSettings = {
  upiId: localStorage.getItem('upiId') || 'saravanastores@paytm',
  payeeName: localStorage.getItem('payeeName') || 'Saravana Stores'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadBills();
    updateDashboard();
    loadUPISettings();
    // Show Dashboard section by default to match new layout
    showSection('dashboard', null);
    // Set today's date in header
    try {
        const d = new Date();
        const el = document.getElementById('today-date');
        if (el) el.textContent = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (_) {}
    // Initialize Lucide icons on first load
    try { if (window.lucide && lucide.createIcons) lucide.createIcons(); } catch (_) {}
    // Charts will render when Dashboard is opened
    try { renderDashboardCharts(); } catch (_) {}

    // Ensure mobile nav starts hidden
    try {
        const nav = document.getElementById('main-nav');
        const overlay = document.getElementById('menu-overlay');
        const checkbox = document.getElementById('menu-toggle');
        const hamburger = document.querySelector('label.mobile-menu-toggle');
        if (nav) {
            nav.classList.remove('mobile-nav-open');
            nav.classList.add('hidden');
            nav.style.display = 'none';
        }
        if (overlay) {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            overlay.addEventListener('click', () => closeMobileMenu());
        }
        // Wire CSS-only checkbox to JS side-effects (overlay, scroll lock, aria)
        if (checkbox) {
            const syncFromCheckbox = () => {
                const checked = checkbox.checked;
                const toggle = document.querySelector('.mobile-menu-toggle');
                if (checked) {
                    if (nav) {
                        nav.classList.add('mobile-nav-open');
                        nav.classList.remove('hidden');
                        nav.style.display = 'block';
                    }
                    if (overlay) {
                        overlay.classList.remove('hidden');
                        overlay.classList.add('active');
                        overlay.style.display = 'block';
                    }
                    document.body.classList.add('menu-open');
                    if (toggle) toggle.setAttribute('aria-expanded', 'true');
                    if (nav) nav.setAttribute('aria-hidden', 'false');
                    if (toggle) toggle.classList.add('active');
                    try { if (window.lucide && lucide.createIcons) lucide.createIcons(); } catch (_) {}
                } else {
                    if (nav) {
                        nav.classList.remove('mobile-nav-open');
                        nav.classList.add('hidden');
                        nav.style.display = 'none';
                    }
                    if (overlay) {
                        overlay.classList.remove('active');
                        overlay.classList.add('hidden');
                        overlay.style.display = 'none';
                    }
                    document.body.classList.remove('menu-open');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                    if (nav) nav.setAttribute('aria-hidden', 'true');
                    if (toggle) toggle.classList.remove('active');
                }
            };
            checkbox.addEventListener('change', syncFromCheckbox);
            // Ensure initial sync
            syncFromCheckbox();
        }
        // Failsafe: explicitly toggle checkbox on hamburger click/touch
        // Explicit listeners by ID (works across pages)
        const menuButton = document.getElementById('menuButton');
        const menuClose = document.getElementById('menuClose');
        if (menuButton && checkbox) {
            const toggleCheck = (e) => {
                try { e.preventDefault(); } catch(_) {}
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            };
            menuButton.addEventListener('click', toggleCheck);
            menuButton.addEventListener('touchstart', toggleCheck, { passive: true });
        }
        if (menuClose && checkbox) {
            const closeCheck = (e) => {
                try { e.preventDefault(); } catch(_) {}
                checkbox.checked = false;
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            };
            menuClose.addEventListener('click', closeCheck);
            menuClose.addEventListener('touchstart', closeCheck, { passive: true });
        }

        // Drawer nav buttons -> navigate to section and close menu
        const drawerButtons = document.querySelectorAll('#main-nav .nav-btn[data-section]');
        drawerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionId = btn.getAttribute('data-section');
                try {
                    if (typeof openSection === 'function') {
                        openSection(sectionId);
                    } else if (typeof showSection === 'function') {
                        showSection(sectionId, null);
                    }
                } catch (_) {}
                // Ensure checkbox gets unchecked to close drawer
                if (checkbox) {
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    } catch (_) {}
});

// Format numbers with commas (Indian numbering system)
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '₹0.00';
    }
    return '₹' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format large numbers in Indian system (lakhs, crores)
function formatIndianNumber(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '₹0.00';
    }
    const num = parseFloat(amount);
    
    // For values >= 1 crore (1,00,00,000)
    if (num >= 10000000) {
        const crores = num / 10000000;
        return '₹' + crores.toFixed(2) + ' Cr';
    }
    // For values >= 1 lakh (1,00,000)
    else if (num >= 100000) {
        const lakhs = num / 100000;
        return '₹' + lakhs.toFixed(2) + ' L';
    }
    // For smaller values, use normal comma formatting
    else {
        return formatCurrency(num);
    }
}

// Format numbers without currency symbol (for calculations)
function formatNumber(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0.00';
    }
    return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Indian Time Formatting (IST - DD/MM/YYYY format)
function formatIndianDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    };
    const formatted = date.toLocaleString('en-IN', options);
    // Convert to DD/MM/YYYY HH:MM format
    const parts = formatted.split(', ');
    if (parts.length === 2) {
        const datePart = parts[0].split('/');
        if (datePart.length === 3) {
            return `${datePart[0]}/${datePart[1]}/${datePart[2]} ${parts[1]}`;
        }
    }
    return formatted;
}

function formatIndianDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatIndianDateShort(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Mobile Menu Functions
function toggleMobileMenu() {
    const nav = document.getElementById('main-nav');
    const body = document.body;
    const toggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.getElementById('menu-overlay');

    if (!nav || !toggle) return;

    nav.classList.toggle('mobile-nav-open');
    toggle.classList.toggle('active');

    const isOpen = nav.classList.contains('mobile-nav-open');
    // Body scroll lock state
    if (isOpen) {
        body.classList.add('menu-open');
        // Ensure Tailwind 'hidden' utility doesn't keep it hidden
        nav.classList.remove('hidden');
        nav.style.display = 'block';
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('active');
            overlay.style.display = 'block';
        }
    } else {
        body.classList.remove('menu-open');
        // Re-hide when closed on mobile
        nav.classList.add('hidden');
        nav.style.display = 'none';
        if (overlay) {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
    // Accessibility attributes
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
        // Ensure drawer is focusable on open
        if (!nav.hasAttribute('tabindex')) nav.setAttribute('tabindex', '-1');
        nav.focus({ preventScroll: true });
    }
}

function closeMobileMenu() {
    const nav = document.getElementById('main-nav');
    const body = document.body;
    const toggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.getElementById('menu-overlay');
    const checkbox = document.getElementById('menu-toggle');

    if (nav) nav.classList.remove('mobile-nav-open');
    if (toggle) toggle.classList.remove('active');
    if (body) body.classList.remove('menu-open');
    if (nav) {
        nav.classList.add('hidden');
        nav.style.display = 'none';
    }
    if (overlay) {
        overlay.classList.remove('active');
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
    if (checkbox) {
        checkbox.checked = false;
        // Trigger change sync for consistency
        checkbox.dispatchEvent(new Event('change'));
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const nav = document.getElementById('main-nav');
    const header = document.querySelector('header');

    if (!nav || !header) return;

    const clickInsideHeader = header.contains(event.target);
    const clickInsideNav = nav.contains(event.target);
    const isOpen = nav.classList.contains('mobile-nav-open');

    if (isOpen && !clickInsideHeader && !clickInsideNav) {
        closeMobileMenu();
    }
});

// Close with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const nav = document.getElementById('main-nav');
        if (nav && nav.classList.contains('mobile-nav-open')) {
            closeMobileMenu();
        }
    }
});

function loadUPISettings() {
    document.getElementById('upi-id').value = upiSettings.upiId;
    document.getElementById('payee-name').value = upiSettings.payeeName;
}

function saveUPISettings() {
    upiSettings.upiId = document.getElementById('upi-id').value.trim();
    upiSettings.payeeName = document.getElementById('payee-name').value.trim();
    localStorage.setItem('upiId', upiSettings.upiId);
    localStorage.setItem('payeeName', upiSettings.payeeName);
    alert('UPI settings saved successfully!');
}





// Navigation
function showSection(sectionId, element) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        // Outline style (default)
        btn.classList.remove('bg-indigo-600','text-white','shadow');
        btn.classList.add('bg-white','text-slate-700','border','border-slate-300');
    });
    document.querySelectorAll('.side-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    if (element) {
        element.classList.add('active');
        // Primary style for active button
        element.classList.add('bg-indigo-600','text-white','shadow');
        element.classList.remove('bg-white','text-slate-700');
    } else {
        // Try to activate the corresponding nav button based on its onclick
        const candidates = Array.from(document.querySelectorAll('.nav-btn'));
        const match = candidates.find(b => (b.getAttribute('onclick') || '').includes(`'${sectionId}'`));
        if (match) {
            match.classList.add('active');
            match.classList.add('bg-indigo-600','text-white','shadow');
            match.classList.remove('bg-white','text-slate-700');
        }
    }

    // Activate sidebar and bottom nav buttons
    const sideBtn = document.querySelector(`.side-nav-btn[data-section="${sectionId}"]`);
    if (sideBtn) sideBtn.classList.add('active');
    const bottomBtn = document.querySelector(`.bottom-nav-btn[data-section="${sectionId}"]`);
    if (bottomBtn) bottomBtn.classList.add('active');

    // Toggle header/nav visibility on Home
    const body = document.body;
    if (sectionId === 'home') {
        body.classList.add('on-home');
    } else {
        body.classList.remove('on-home');
    }
    
    if (sectionId === 'inventory') {
        loadInventory();
    }
    if (sectionId === 'billing') {
        loadBillingItems();
    }
    if (sectionId === 'bills') {
        loadBills();
    }
    if (sectionId === 'reports') {
        // Initialize reports if not already done
        setTimeout(() => {
            try {
                const activeTab = document.querySelector('.report-tab.active');
                if (activeTab && activeTab.textContent) {
                    const tabText = activeTab.textContent.toLowerCase();
                    if (tabText.includes('daily')) {
                        showReport('daily', activeTab);
                    } else if (tabText.includes('monthly')) {
                        showReport('monthly', activeTab);
                    } else if (tabText.includes('yearly')) {
                        showReport('yearly', activeTab);
                    } else {
                        showReport('daily', activeTab);
                    }
                } else {
                    // If no active tab, set the first one as active and show daily report
                    const firstTab = document.querySelector('.report-tab');
                    if (firstTab) {
                        firstTab.classList.add('active');
                        showReport('daily', firstTab);
                    } else {
                        showReport('daily', null);
                    }
                }
            } catch (error) {
                console.error('Error initializing reports:', error);
                showReport('daily', null);
            }
        }, 150);
    }
    if (sectionId === 'dashboard') {
        // Ensure icons and charts are rendered on navigation
        try { if (window.lucide && lucide.createIcons) lucide.createIcons(); } catch (_) {}
        try { renderDashboardCharts(); } catch (_) {}
    }
    // Render icons for any dynamic content
    try { if (window.lucide && lucide.createIcons) lucide.createIcons(); } catch (_) {}
}

// Dashboard Charts (Chart.js demo)
let salesChartRef = null;
let categoryChartRef = null; // no longer used (Category Split removed)
function renderDashboardCharts() {
    const salesCtx = document.getElementById('salesTrendChart');
    // Category Split removed
    if (salesCtx) {
        if (salesChartRef) { salesChartRef.destroy(); }
        salesChartRef = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
                datasets: [{
                    label: 'Sales (₹)',
                    data: [1200, 1800, 900, 2200, 2600, 3200, 2100],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79,70,229,0.15)',
                    tension: 0.35,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(0,0,0,0.06)' } }
                }
            }
        });
    }
    // No second chart
}

// Search functionality for billing
function searchBillingProducts() {
    const searchTerm = document.getElementById('product-search-billing').value.toLowerCase();
    const grid = document.getElementById('billing-items-grid');
    let filteredInventory = inventory;
    
    // Apply category filter first
    if (currentBillingFilter !== 'all') {
        filteredInventory = filteredInventory.filter(item => 
            item.category.toLowerCase() === currentBillingFilter.toLowerCase()
        );
    }
    
    // Then apply search filter
    if (searchTerm) {
        filteredInventory = filteredInventory.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    if (filteredInventory.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No products found. Try different search.</p>';
        return;
    }
    
    grid.innerHTML = filteredInventory.map(item => `
        <div class="billing-item ${item.quantity === 0 ? 'out-of-stock' : ''}" 
             onclick="${item.quantity > 0 ? `addToCart('${item.id}')` : ''}">
            ${item.image ? `<div class="billing-item-image">
                <img src="${item.image}" alt="${item.name}"
                     referrerpolicy="no-referrer" crossorigin="anonymous"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/160?text=No+Image';">
            </div>` : ''}
            <div class="billing-item-name">${item.name}</div>
            <div class="billing-item-price">${formatCurrency(item.price)}</div>
            <div class="billing-item-qty">Stock: ${item.quantity}</div>
        </div>
    `).join('');
}

function focusSearch() {
    document.getElementById('product-search-billing').focus();
}



async function loadBills() {
    try {
        const response = await fetch(api('/api/bills'));
        const bills = await response.json();
        displayBills(bills);
        updateDashboard();
    } catch (error) {
        console.error('Error loading bills:', error);
    }
}

async function saveItem(event) {
    event.preventDefault();
    
    const itemData = {
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        price: parseFloat(document.getElementById('item-price').value),
        quantity: parseInt(document.getElementById('item-quantity').value),
        sku: document.getElementById('item-sku').value,
        description: document.getElementById('item-description').value,
        image: document.getElementById('item-image').value
    };
    
    const itemId = document.getElementById('item-id').value;
    const url = itemId ? api(`/api/inventory/${itemId}`) : api('/api/inventory');
    const method = itemId ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });
        
        if (response.ok) {
            closeItemModal();
            loadInventory();
        } else {
            alert('Error saving item');
        }
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Error saving item');
    }
}

async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        const response = await fetch(api(`/api/inventory/${id}`), {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadInventory();
        } else {
            alert('Error deleting item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
    }
}

// Display Functions
function displayInventory() {
    const grid = document.getElementById('inventory-grid');
    let filteredInventory = inventory;
    
    if (currentFilter !== 'all') {
        filteredInventory = filteredInventory.filter(item => 
            item.category.toLowerCase() === currentFilter.toLowerCase()
        );
    }
    
    if (filteredInventory.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No items found</p>';
        return;
    }
    
    grid.innerHTML = filteredInventory.map(item => `
        <div class="inventory-item ${item.category}">
            ${item.image ? `<div class="item-image-container"><img src="${item.image}" alt="${item.name}" class="item-image" referrerpolicy="no-referrer" crossorigin="anonymous" onerror="this.onerror=null; this.src='https://via.placeholder.com/200?text=No+Image';"></div>` : ''}
            <div class="item-header">
                <div>
                    <div class="item-name">${item.name}</div>
                    <span class="item-category ${item.category}">${item.category}</span>
                </div>
            </div>
            ${item.description ? `<div class="item-details">${item.description}</div>` : ''}
            ${item.sku ? `<div class="item-details">CODE: ${item.sku}</div>` : ''}
            <div class="item-price">${formatCurrency(item.price)}</div>
            <div class="item-quantity">Stock: ${item.quantity}</div>
            <div class="item-actions">
                <button class="btn btn-primary btn-small" onclick="editItem('${item.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function filterInventory(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    displayInventory();
}

function searchInventory() {
    const searchTerm = document.getElementById('search-inventory').value.toLowerCase();
    const grid = document.getElementById('inventory-grid');
    
    let filteredInventory = inventory;
    
    if (currentFilter !== 'all') {
        filteredInventory = filteredInventory.filter(item => 
            item.category.toLowerCase() === currentFilter.toLowerCase()
        );
    }
    
    filteredInventory = filteredInventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm))
    );
    
    if (filteredInventory.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No items found</p>';
        return;
    }
    
    grid.innerHTML = filteredInventory.map(item => `
        <div class="inventory-item ${item.category}">
            ${item.image ? `<div class="item-image-container"><img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='https://via.placeholder.com/200?text=No+Image'"></div>` : ''}
            <div class="item-header">
                <div>
                    <div class="item-name">${item.name}</div>
                    <span class="item-category ${item.category}">${item.category}</span>
                </div>
            </div>
            ${item.description ? `<div class="item-details">${item.description}</div>` : ''}
            ${item.sku ? `<div class="item-details">CODE: ${item.sku}</div>` : ''}
            <div class="item-price">${formatCurrency(item.price)}</div>
            <div class="item-quantity">Stock: ${item.quantity}</div>
            <div class="item-actions">
                <button class="btn btn-primary btn-small" onclick="editItem('${item.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function updateDashboard() {
    try {
        // Load inventory data
        const inventoryResponse = await fetch(api('/api/inventory'));
        if (!inventoryResponse.ok) {
            throw new Error('Failed to fetch inventory');
        }
        inventory = await inventoryResponse.json();

        const fancyCount = inventory.filter(item => item.category.toLowerCase() === 'fancy').length;
        const electronicsCount = inventory.filter(item => item.category.toLowerCase() === 'electronics').length;

        const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        document.getElementById('fancy-count').textContent = fancyCount;
        document.getElementById('electronics-count').textContent = electronicsCount;
        document.getElementById('total-value').textContent = formatIndianNumber(totalValue);

        // Load bills data
        const billsResponse = await fetch(api('/api/bills'));
        if (!billsResponse.ok) {
            throw new Error('Failed to fetch bills');
        }
        const bills = await billsResponse.json();
        document.getElementById('total-bills').textContent = bills.length;
    } catch (error) {
        console.error('Error updating dashboard:', error);
        // Set default values on error
        document.getElementById('fancy-count').textContent = '0';
        document.getElementById('electronics-count').textContent = '0';
        document.getElementById('total-value').textContent = '₹0';
        document.getElementById('total-bills').textContent = '0';
    }
}

// Item Modal Functions
function openAddItemModal() {
    document.getElementById('modal-title').textContent = 'Add New Item';
    document.getElementById('item-form').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('item-modal').classList.add('active');
}

function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    
    document.getElementById('modal-title').textContent = 'Edit Item';
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-category').value = item.category;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-quantity').value = item.quantity;
    document.getElementById('item-sku').value = item.sku || '';
    document.getElementById('item-description').value = item.description || '';
    document.getElementById('item-image').value = item.image || '';
    document.getElementById('item-modal').classList.add('active');
}

function closeItemModal() {
    document.getElementById('item-modal').classList.remove('active');
}

// Billing Functions
async function loadBillingItems() {
    try {
        await loadInventory();
        displayBillingItems();
    } catch (error) {
        console.error('Error loading billing items:', error);
        document.getElementById('billing-items-grid').innerHTML =
            '<p style="grid-column: 1/-1; text-align: center; color: red;">Failed to load products</p>';
    }
}

function displayBillingItems() {
    const grid = document.getElementById('billing-items-grid');
    let filteredInventory = inventory;
    const searchTerm = document.getElementById('product-search-billing')?.value.toLowerCase() || '';
    
    if (currentBillingFilter !== 'all') {
        filteredInventory = filteredInventory.filter(item => 
            item.category.toLowerCase() === currentBillingFilter.toLowerCase()
        );
    }
    
    // Apply search filter if exists
    if (searchTerm) {
        filteredInventory = filteredInventory.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    if (filteredInventory.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No products available</p>';
        return;
    }
    
    grid.innerHTML = filteredInventory.map(item => `
        <div class="billing-item ${item.quantity === 0 ? 'out-of-stock' : ''}" 
             onclick="${item.quantity > 0 ? `addToCart('${item.id}')` : ''}">
            ${item.image ? `<div class="billing-item-image"><img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'"></div>` : ''}
            <div class="billing-item-name">${item.name}</div>
            <div class="billing-item-price">${formatCurrency(item.price)}</div>
            <div class="billing-item-qty">Stock: ${item.quantity}</div>
        </div>
    `).join('');
}

function filterBillingItems(category) {
    currentBillingFilter = category;
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    displayBillingItems();
}

function addToCart(itemId) {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.quantity === 0) return;
    
    const cartItem = cart.find(c => c.id === itemId);
    if (cartItem) {
        if (cartItem.quantity < item.quantity) {
            cartItem.quantity += 1;
        } else {
            alert('Not enough stock available');
            return;
        }
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    updateCart();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

function updateCartQuantity(itemId, change) {
    const cartItem = cart.find(c => c.id === itemId);
    if (!cartItem) return;
    
    const inventoryItem = inventory.find(i => i.id === itemId);
    if (!inventoryItem) return;
    
    const newQuantity = cartItem.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(itemId);
    } else if (newQuantity > inventoryItem.quantity) {
        alert('Not enough stock available');
    } else {
        cartItem.quantity = newQuantity;
        updateCart();
    }
}

function updateCart() {
    const cartItemsEl = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="empty-cart">No items in cart</p>';
        document.getElementById('total-amount').textContent = formatCurrency(0);
        document.getElementById('payment-section').style.display = 'none';
        return;
    }
    
    // Show payment section when cart has items
    document.getElementById('payment-section').style.display = 'block';
    setupPaymentHandler();
    
    cartItemsEl.innerHTML = cart.map(item => {
        const total = item.price * item.quantity;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">${formatCurrency(item.price)} × ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                    </div>
                    <div class="cart-item-total">${formatCurrency(total)}</div>
                    <button class="btn btn-danger btn-small" onclick="removeFromCart('${item.id}')">×</button>
                </div>
            </div>
        `;
    }).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    document.getElementById('total-amount').textContent = formatCurrency(total);
}

let paymentMethod = 'cash';

// Setup payment method change handler on DOM ready
function setupPaymentHandler() {
    const paymentMethodSelect = document.getElementById('payment-method');
    if (paymentMethodSelect && !paymentMethodSelect.dataset.listenerAdded) {
        paymentMethodSelect.dataset.listenerAdded = 'true';
        paymentMethodSelect.addEventListener('change', function() {
            paymentMethod = this.value;
            const qrSection = document.getElementById('qr-section');
            if (this.value === 'online') {
                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                generateGPayQR('payment-qr', total);
                qrSection.style.display = 'block';
            } else {
                qrSection.style.display = 'none';
                const qrEl = document.getElementById('payment-qr');
                if (qrEl) qrEl.innerHTML = '';
            }
        });
    }
}

function processPayment() {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    
    // Generate bill after payment
    generateBill();
}

async function generateBill() {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    paymentMethod = document.getElementById('payment-method').value || 'cash';
    
    const billData = {
        items: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
        })),
        customerName: customerName,
        customerPhone: customerPhone,
        paymentMethod: paymentMethod
    };
    
    try {
        const response = await fetch(api('/api/bills'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(billData)
        });
        
        if (response.ok) {
            const bill = await response.json();
            // Clear cart
            cart = [];
            updateCart();
            document.getElementById('customer-name').value = '';
            document.getElementById('customer-phone').value = '';
            document.getElementById('payment-method').value = 'cash';
            document.getElementById('qr-section').style.display = 'none';
            document.getElementById('payment-qr').innerHTML = '';
            loadInventory();
            loadBills();
            viewBill(bill.id);
            alert('Bill generated successfully!');
        } else {
            alert('Error generating bill');
        }
    } catch (error) {
        console.error('Error generating bill:', error);
        alert('Error generating bill');
    }
}

// Bills View Functions
function displayBills(bills) {
    const billsList = document.getElementById('bills-list');
    
    if (bills.length === 0) {
        billsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No bills found</p>';
        return;
    }
    
    bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    billsList.innerHTML = bills.map(bill => {
        const date = formatIndianDateTime(bill.createdAt);
        return `
            <div class="bill-card" onclick="viewBill('${bill.id}')">
                <div class="bill-header">
                    <div>
                        <div class="bill-number">${bill.billNumber}</div>
                        <div class="bill-date">${date}</div>
                        <div class="bill-items-count">${bill.items.length} item(s)</div>
                    </div>
                    <div class="bill-total">${formatCurrency(bill.total)}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function viewBill(billId) {
    try {
        const response = await fetch(api(`/api/bills/${billId}`));
        if (response.ok) {
            currentBill = await response.json();
            displayBillModal(currentBill);
        } else {
            alert('Error loading bill');
        }
    } catch (error) {
        console.error('Error loading bill:', error);
        alert('Error loading bill');
    }
}

// Generate UPI Payment String
function generateUPIString(amount) {
    const upiId = encodeURIComponent(upiSettings.upiId);
    const payeeName = encodeURIComponent(upiSettings.payeeName);
    const amountStr = amount.toFixed(2);
    const transactionNote = encodeURIComponent(`Payment for Bill`);
    
    return `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amountStr}&cu=INR&tn=${transactionNote}`;
}

// Generate GPay QR Code with logo overlay
function generateGPayQR(containerId, amount) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const qrData = generateUPIString(amount);
    const qrSize = 250;
    
    // Create QR code
    const qrCode = new QRCode(container, {
        text: qrData,
        width: qrSize,
        height: qrSize,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Add GPay logo overlay after QR code is generated
    setTimeout(() => {
        const qrImg = container.querySelector('img');
        if (qrImg) {
            qrImg.style.position = 'relative';
            
            // Create GPay logo overlay
            const logoOverlay = document.createElement('div');
            logoOverlay.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;
            
            // GPay logo SVG
            logoOverlay.innerHTML = `
                <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            `;
            
            container.style.position = 'relative';
            container.appendChild(logoOverlay);
        }
    }, 100);
}

function displayBillModal(bill) {
    const billContent = document.getElementById('bill-content');
    const date = formatIndianDateTime(bill.createdAt);
    
    billContent.innerHTML = `
        <div class="bill-view">
            <div class="bill-view-header">
                <h2>Saravana Stores</h2>
                <p>Fancy Store & Electronics Shop</p>
            </div>
            <div class="bill-view-info">
                <p><strong>Bill Number:</strong> ${bill.billNumber}</p>
                <p><strong>Date:</strong> ${date}</p>
                ${bill.customerName ? `<p><strong>Customer:</strong> ${bill.customerName}</p>` : ''}
                ${bill.customerPhone ? `<p><strong>Phone:</strong> ${bill.customerPhone}</p>` : ''}
            </div>
            <div class="bill-view-items">
                <h3>Items:</h3>
                ${bill.items.map(item => `
                    <div class="bill-view-item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="bill-view-summary">
                <div class="bill-view-summary-row bill-view-total">
                    <span>Total Amount:</span>
                    <span>${formatCurrency(bill.total)}</span>
                </div>
                ${bill.paymentMethod ? `<div class="bill-view-summary-row" style="margin-top: 10px; font-size: 14px; color: var(--text-secondary);">
                    <span>Payment Method:</span>
                    <span>${bill.paymentMethod === 'online' ? '📱 Online Payment' : '💰 Cash'}</span>
                </div>` : ''}
            </div>
            ${bill.paymentMethod === 'online' ? `<div class="bill-qr-section">
                <h3 style="text-align: center; margin: 20px 0 10px 0;">Scan to Pay via GPay</h3>
                <div id="bill-qrcode" style="display: flex; justify-content: center; margin: 15px 0; position: relative;"></div>
                <p style="text-align: center; font-size: 12px; color: var(--text-secondary); margin-top: 10px;">
                    Amount: ${formatCurrency(bill.total)}
                </p>
            </div>` : ''}
                <p style="text-align: center; font-size: 11px; color: var(--text-secondary);">
                    ${upiSettings.upiId}
                </p>
            </div>
            <p style="text-align: center; margin-top: 30px; color: var(--text-secondary);">Thank you for your business!</p>
        </div>
    `;
    
    // Generate GPay QR code
    if (bill.paymentMethod === 'online') {
        setTimeout(() => {
            generateGPayQR('bill-qrcode', bill.total);
        }, 100);
    }
    
    document.getElementById('bill-modal').classList.add('active');
}

function closeBillModal() {
    const qrElement = document.getElementById('bill-qrcode');
    if (qrElement) {
        qrElement.innerHTML = '';
    }
    document.getElementById('bill-modal').classList.remove('active');
    currentBill = null;
}

function printBill() {
    if (!currentBill) return;
    
    const printWindow = window.open('', '', 'height=700,width=800');
    const date = formatIndianDateTime(currentBill.createdAt);
    const upiString = generateUPIString(currentBill.total);
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Bill ${currentBill.billNumber}</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 20px; }
                    .info { margin: 20px 0; }
                    .items { margin: 20px 0; }
                    .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ccc; }
                    .summary { margin-top: 20px; padding-top: 20px; border-top: 2px solid #000; }
                    .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .total { font-size: 18px; font-weight: bold; margin-top: 10px; padding-top: 10px; border-top: 2px solid #000; }
                    .qr-section { text-align: center; margin: 30px 0; }
                    .qr-section h4 { margin-bottom: 10px; }
                    #qr-print { display: inline-block; margin: 10px 0; position: relative; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Saravana Stores</h2>
                    <p>Fancy Store & Electronics Shop</p>
                </div>
                <div class="info">
                    <p><strong>Bill Number:</strong> ${currentBill.billNumber}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    ${currentBill.customerName ? `<p><strong>Customer:</strong> ${currentBill.customerName}</p>` : ''}
                    ${currentBill.customerPhone ? `<p><strong>Phone:</strong> ${currentBill.customerPhone}</p>` : ''}
                </div>
                <div class="items">
                    <h3>Items:</h3>
                    ${currentBill.items.map(item => `
                        <div class="item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>${formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="summary">
                    <div class="summary-row total">
                        <span>Total Amount:</span>
                        <span>${formatCurrency(currentBill.total)}</span>
                    </div>
                    ${currentBill.paymentMethod ? `<div class="summary-row" style="margin-top: 10px; font-size: 14px; color: #666;">
                        <span>Payment Method:</span>
                        <span>${currentBill.paymentMethod === 'online' ? '📱 Online Payment' : '💰 Cash'}</span>
                    </div>` : ''}
                </div>
                ${currentBill.paymentMethod === 'online' ? `<div class="qr-section">
                    <h4>Scan to Pay via GPay</h4>
                    <div id="qr-print"></div>
                    <p style="font-size: 11px; margin-top: 5px;">Amount: ${formatCurrency(currentBill.total)}</p>
                    <p style="font-size: 10px; color: #666;">${upiSettings.upiId}</p>
                </div>` : ''}
                <p style="text-align: center; margin-top: 30px;">Thank you for your business!</p>
                <script>
                    if (${currentBill.paymentMethod === 'online' ? 'true' : 'false'} && typeof QRCode !== 'undefined') {
                        const upiStringForQR = '${upiString}';
                        if (upiStringForQR) {
                            new QRCode(document.getElementById('qr-print'), {
                                text: upiStringForQR,
                                width: 200,
                                height: 200,
                                colorDark: "#000000",
                                colorLight: "#ffffff",
                                correctLevel: QRCode.CorrectLevel.H
                            });
                        }
                        setTimeout(() => {
                            const qrImg = document.getElementById('qr-print').querySelector('img');
                            if (qrImg) {
                                const logo = document.createElement('div');
                                logo.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50px; height: 50px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
                                logo.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';
                                document.getElementById('qr-print').style.position = 'relative';
                                document.getElementById('qr-print').appendChild(logo);
                            }
                        }, 200);
                    }
                </script>
            </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Reports Functions
let currentReportType = 'daily';
let currentReportParams = {};

async function showReport(type, element) {
    currentReportType = type;
    
    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    } else {
        // Find and activate the correct tab if element not provided
        const tabs = document.querySelectorAll('.report-tab');
        tabs.forEach(tab => {
            if (tab.textContent.toLowerCase().includes(type)) {
                tab.classList.add('active');
            }
        });
    }
    
    const controls = document.getElementById('report-controls');
    if (!controls) {
        console.error('Report controls element not found');
        return;
    }
    
    const today = new Date();
    
    if (type === 'daily') {
        const dateStr = today.toISOString().split('T')[0];
        controls.innerHTML = `
            <label>
                Select Date:
                <input type="date" id="report-date" value="${dateStr}" onchange="loadReport('daily')" style="padding: 8px; border: 2px solid var(--border-color); border-radius: 6px; margin-left: 10px;">
            </label>
        `;
        loadReport('daily', dateStr);
    } else if (type === 'monthly') {
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        controls.innerHTML = `
            <label>
                Select Month:
                <select id="report-month" onchange="loadReport('monthly')" style="padding: 8px; border: 2px solid var(--border-color); border-radius: 6px; margin: 0 10px;">
                    ${Array.from({length: 12}, (_, i) => `<option value="${i + 1}" ${i + 1 === month ? 'selected' : ''}>${new Date(year, i).toLocaleString('default', {month: 'long'})}</option>`).join('')}
                </select>
            </label>
            <label>
                Year:
                <input type="number" id="report-year-monthly" value="${year}" min="2020" max="${year + 1}" onchange="loadReport('monthly')" style="padding: 8px; border: 2px solid var(--border-color); border-radius: 6px; margin-left: 10px; width: 100px;">
            </label>
        `;
        loadReport('monthly', month, year);
    } else if (type === 'yearly') {
        const year = today.getFullYear();
        controls.innerHTML = `
            <label>
                Select Year:
                <input type="number" id="report-year-yearly" value="${year}" min="2020" max="${year + 1}" onchange="loadReport('yearly')" style="padding: 8px; border: 2px solid var(--border-color); border-radius: 6px; margin-left: 10px; width: 100px;">
            </label>
        `;
        loadReport('yearly', year);
    }
}

async function loadReport(type, param1, param2) {
    try {
        const reportContent = document.getElementById('report-content');
        if (reportContent) {
            reportContent.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">Loading report...</p>';
        }
        
        let url = api(`/api/reports/${type}?`);
        if (type === 'daily') {
            const date = param1 || document.getElementById('report-date')?.value || new Date().toISOString().split('T')[0];
            url += `date=${date}`;
            currentReportParams = { type: 'daily', date };
        } else if (type === 'monthly') {
            const month = param1 || document.getElementById('report-month')?.value || new Date().getMonth() + 1;
            const year = param2 || document.getElementById('report-year-monthly')?.value || new Date().getFullYear();
            url += `month=${month}&year=${year}`;
            currentReportParams = { type: 'monthly', month, year };
        } else if (type === 'yearly') {
            const year = param1 || document.getElementById('report-year-yearly')?.value || new Date().getFullYear();
            url += `year=${year}`;
            currentReportParams = { type: 'yearly', year };
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const report = await response.json();
        displayReport(report, type);
    } catch (error) {
        console.error('Error loading report:', error);
        const reportContent = document.getElementById('report-content');
        if (reportContent) {
            reportContent.innerHTML = `<p style="text-align: center; padding: 20px; color: var(--danger-color);">Error loading report: ${error.message}</p>`;
        }
        alert('Error loading report. Please try again.');
    }
}

function downloadReport() {
    if (!currentReportParams.type) {
        alert('Please load a report first');
        return;
    }
    
    let url = api(`/api/reports/download/${currentReportParams.type}?`);
    if (currentReportParams.type === 'daily') {
        url += `date=${currentReportParams.date}`;
    } else if (currentReportParams.type === 'monthly') {
        url += `month=${currentReportParams.month}&year=${currentReportParams.year}`;
    } else if (currentReportParams.type === 'yearly') {
        url += `year=${currentReportParams.year}`;
    }
    
    window.open(url, '_blank');
}

function displayReport(report, type) {
    const content = document.getElementById('report-content');
    if (!content) {
        console.error('Report content element not found');
        return;
    }
    
    if (!report) {
        content.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">No report data available</p>';
        return;
    }
    
    const periodLabel = type === 'daily' ? 'Daily' : type === 'monthly' ? 'Monthly' : 'Yearly';
    const dateLabel = type === 'daily' 
        ? formatIndianDate(report.date)
        : type === 'monthly'
        ? formatIndianDate(report.date)
        : new Date(report.date).getFullYear();
    
    let categoryBreakdown = '';
    if (Object.keys(report.categoryStats).length > 0) {
        categoryBreakdown = `
            <div class="report-categories">
                <h3>Category Breakdown</h3>
                ${Object.entries(report.categoryStats).map(([cat, stats]) => `
                    <div class="category-stat">
                        <div class="category-stat-header">
                            <span class="category-name ${cat}">${cat.toUpperCase()}</span>
                            <span class="category-revenue">${formatCurrency(stats?.revenue || 0)}</span>
                        </div>
                        <div class="category-stat-details">
                            <span>Items Sold: ${stats?.quantity || 0}</span>
                            <span>Transactions: ${stats?.count || 0}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="report-summary">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>${periodLabel} Sales Report - ${dateLabel}</h2>
                <button class="btn btn-success" onclick="downloadReport()">📥 Download Report</button>
            </div>
            <div class="report-stats-grid">
                <div class="report-stat-card">
                    <h4>Total Bills</h4>
                    <p class="report-stat-value">${report.totalBills || 0}</p>
                </div>
                <div class="report-stat-card">
                    <h4>Total Revenue</h4>
                    <p class="report-stat-value">${formatCurrency(report.totalRevenue || 0)}</p>
                </div>
            </div>
            ${categoryBreakdown}
            ${report.bills && report.bills.length > 0 ? `
                <div class="report-bills-list">
                    <h3>Bills in This Period</h3>
                    <div class="report-bills">
                        ${report.bills.map(bill => `
                            <div class="report-bill-item" onclick="viewBill('${bill.id}')">
                                <span>${bill.billNumber}</span>
                                <span>${formatCurrency(bill.total)}</span>
                                <span class="report-bill-date">${formatIndianDateTime(bill.createdAt)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No sales data for this period</p>'}
        </div>
    `;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const itemModal = document.getElementById('item-modal');
    const billModal = document.getElementById('bill-modal');
    
    if (event.target === itemModal) {
        closeItemModal();
    }
    if (event.target === billModal) {
        closeBillModal();
    }
}
