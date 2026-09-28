/**
 * EcoBazaar - Carbon-Aware Smart Shopping Platform
 * Script: admin.js (Step 5: Complete Admin Product & Order Management)
 * 
 * Provides interactive tab switching, modal controls, client-side role-guard checks,
 * comprehensive Product Catalog CRUD, and full Order Lifecycle Management integrated
 * with Spring Boot REST APIs and live MySQL persistence.
 */

'use strict';

// -----------------------------------------------------------------------------
// 1. Global Admin State
// -----------------------------------------------------------------------------
let allAdminProducts = [];
let filteredAdminProducts = [];
let isProductsLoading = false;

let allAdminOrders = [];
let filteredAdminOrders = [];
let isOrdersLoading = false;
let currentOrderFilter = 'ALL';

// -----------------------------------------------------------------------------
// 2. Initialization & Lifecycle
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const isAdmin = initAdminGuard();
  initAdminHeader();
  initAdminTabs();
  initAdminModals();
  initProductManagement();
  initOrderManagement();

  if (isAdmin) {
    loadAdminProducts();
    loadAdminOrders();
  }
});

/**
 * Enforces that only authenticated users with the ADMIN role can access this portal.
 * @returns {boolean} True if user is logged in as ADMIN
 */
function initAdminGuard() {
  const guardBanner = document.getElementById('admin-auth-guard');
  const appContent = document.getElementById('admin-app-content');

  const authenticated = typeof isLoggedIn === 'function' ? isLoggedIn() : false;
  const user = typeof getLoggedInUser === 'function' ? getLoggedInUser() : null;

  if (!authenticated || !user || user.role !== 'ADMIN') {
    if (guardBanner) guardBanner.style.display = 'block';
    if (appContent) appContent.style.display = 'none';
    return false;
  }

  if (guardBanner) guardBanner.style.display = 'none';
  if (appContent) appContent.style.display = 'block';
  return true;
}

/**
 * Initializes Admin Header, User Profile pill, and Logout handler.
 */
function initAdminHeader() {
  const user = typeof getLoggedInUser === 'function' ? getLoggedInUser() : null;
  const nameEl = document.getElementById('admin-user-name');
  const avatarEl = document.getElementById('admin-avatar');
  const logoutBtn = document.getElementById('admin-logout-btn');

  if (user) {
    const displayName = (user.fullName || user.name || 'Admin').trim();
    if (nameEl) nameEl.textContent = displayName;

    if (avatarEl) {
      const initials = displayName
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'AD';
      avatarEl.textContent = initials;
    }
  }

  // Bind working logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (typeof logout === 'function') {
        logout();
      }
      showAdminToast('Signed Out', 'You have been safely signed out of the Admin Portal.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 700);
    });
  }

  // Mobile navigation hamburger toggle
  const mobileToggle = document.getElementById('admin-mobile-toggle');
  const headerActions = document.querySelector('.admin-header-actions');
  if (mobileToggle && headerActions) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = headerActions.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
}

/**
 * Handles Tab Switching between Overview, Products, and Orders.
 */
function initAdminTabs() {
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabPanels = document.querySelectorAll('.admin-tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Update button active states and ARIA attributes
      tabButtons.forEach(btn => {
        const isActive = btn === button;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      // Show targeted panel
      tabPanels.forEach(panel => {
        const isTarget = panel.id === `tab-${targetTab}`;
        panel.classList.toggle('active', isTarget);
      });

      // Refresh data when switching tabs if not already populated
      if (targetTab === 'products' && allAdminProducts.length === 0 && !isProductsLoading) {
        loadAdminProducts();
      } else if (targetTab === 'orders' && allAdminOrders.length === 0 && !isOrdersLoading) {
        loadAdminOrders();
      } else if (targetTab === 'overview') {
        updateOverviewMetrics();
      }
    });
  });
}

/**
 * Manages modal dialog events: backdrop click, escape key, and dismiss buttons.
 */
function initAdminModals() {
  // Product Modal elements
  const productModal = document.getElementById('product-modal');
  const closeProductBtn = document.getElementById('btn-close-product-modal');
  const cancelProductBtn = document.getElementById('btn-cancel-product-modal');

  if (closeProductBtn) closeProductBtn.addEventListener('click', () => closeModal(productModal));
  if (cancelProductBtn) cancelProductBtn.addEventListener('click', () => closeModal(productModal));

  // Delete Dialog elements
  const deleteModal = document.getElementById('delete-confirm-modal');
  const cancelDeleteBtn = document.getElementById('btn-cancel-delete');
  if (cancelDeleteBtn && deleteModal) {
    cancelDeleteBtn.addEventListener('click', () => closeModal(deleteModal));
  }

  // Order Details Modal elements
  const orderDetailsModal = document.getElementById('order-details-modal');
  const closeDetailsBtn = document.getElementById('btn-close-order-details');
  const dismissDetailsBtn = document.getElementById('btn-dismiss-order-details');
  if (closeDetailsBtn) closeDetailsBtn.addEventListener('click', () => closeModal(orderDetailsModal));
  if (dismissDetailsBtn) dismissDetailsBtn.addEventListener('click', () => closeModal(orderDetailsModal));

  // Order Status Modal elements
  const orderStatusModal = document.getElementById('order-status-modal');
  const closeStatusBtn = document.getElementById('btn-close-status-modal');
  const cancelStatusBtn = document.getElementById('btn-cancel-status-modal');
  if (closeStatusBtn) closeStatusBtn.addEventListener('click', () => closeModal(orderStatusModal));
  if (cancelStatusBtn) cancelStatusBtn.addEventListener('click', () => closeModal(orderStatusModal));

  // Global escape key listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.modal-overlay.open');
      if (openModalEl) closeModal(openModalEl);
    }
  });

  // Backdrop click listener
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });
}

/**
 * Opens a modal dialog element.
 * @param {HTMLElement} modalEl 
 */
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Closes a modal dialog element.
 * @param {HTMLElement} modalEl 
 */
function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  document.body.style.overflow = '';
}

/**
 * Displays an accessible toast notification banner.
 * @param {string} title 
 * @param {string} message 
 */
function showAdminToast(title, message) {
  const toast = document.getElementById('toast-notification');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-message');

  if (!toast) return;

  if (toastTitle) toastTitle.textContent = title || 'EcoBazaar Notification';
  if (toastDesc) toastDesc.textContent = message || '';

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// -----------------------------------------------------------------------------
// 3. Overview Analytics & KPI Metrics Calculation
// -----------------------------------------------------------------------------

/**
 * Dynamically computes and updates the 4 overview KPI cards from actual live data:
 * - Total Products: Total active items in catalog
 * - Total Orders: Total customer orders placed
 * - Gross Revenue: Total sales value excluding CANCELLED orders
 * - Total Carbon Tracked: Verified carbon footprint excluding CANCELLED orders
 */
function updateOverviewMetrics() {
  const kpiProductsEl = document.getElementById('kpi-total-products');
  const kpiOrdersEl = document.getElementById('kpi-total-orders');
  const kpiRevenueEl = document.getElementById('kpi-gross-revenue');
  const kpiCarbonEl = document.getElementById('kpi-total-carbon');

  // 1. Total Products
  if (kpiProductsEl) {
    kpiProductsEl.textContent = allAdminProducts.length;
  }

  // 2. Total Orders
  if (kpiOrdersEl) {
    kpiOrdersEl.textContent = allAdminOrders.length;
  }

  // Filter out CANCELLED orders for financial and carbon accounting
  const activeOrders = allAdminOrders.filter(o => (o.status || '').toUpperCase() !== 'CANCELLED');

  // 3. Gross Revenue (Active non-cancelled orders)
  if (kpiRevenueEl) {
    const grossRevenue = activeOrders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);
    kpiRevenueEl.textContent = `₹${grossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 4. Total Carbon Tracked (Active non-cancelled orders)
  if (kpiCarbonEl) {
    const totalCarbon = activeOrders.reduce((sum, o) => sum + (parseFloat(o.totalCarbonKg) || 0), 0);
    kpiCarbonEl.textContent = `${totalCarbon.toFixed(2)} kg CO2e`;
  }
}

// -----------------------------------------------------------------------------
// 4. Product Catalog Management (CRUD)
// -----------------------------------------------------------------------------

/**
 * Sets up listeners for Product Management: Search, Add, Edit, Delete, and Form Submit.
 */
function initProductManagement() {
  const openAddBtn = document.getElementById('btn-open-add-product');
  if (openAddBtn) {
    openAddBtn.addEventListener('click', openAddProductModal);
  }

  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', handleProductFormSubmit);
  }

  const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  }

  // Client-side Product Search with debounce
  const searchInput = document.getElementById('product-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleProductSearch, 180));
  }

  // Event delegation on table body for Edit and Delete buttons
  const tbody = document.getElementById('admin-products-tbody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const button = e.target.closest('button.btn-table-action');
      if (!button) return;

      const action = button.getAttribute('data-action');
      const productId = button.getAttribute('data-id');

      if (action === 'edit' && productId) {
        openEditProductModal(productId);
      } else if (action === 'delete' && productId) {
        openDeleteConfirmModal(productId);
      }
    });
  }
}

/**
 * Fetches products from backend (GET /api/products) and updates table & KPI cards.
 */
async function loadAdminProducts() {
  const loadingState = document.getElementById('products-loading-state');
  const emptyState = document.getElementById('products-empty-state');
  const emptyTitle = document.getElementById('products-empty-title');
  const emptyMsg = document.getElementById('products-empty-message');
  const emptyAction = document.getElementById('products-empty-action');
  const table = document.getElementById('admin-products-table');

  isProductsLoading = true;

  if (loadingState) loadingState.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';
  if (emptyAction) emptyAction.style.display = 'none';
  if (table) table.style.display = 'none';

  try {
    const products = typeof fetchProducts === 'function' 
      ? await fetchProducts() 
      : await apiGet('/products');

    allAdminProducts = Array.isArray(products) ? products : [];

    updateOverviewMetrics();

    // Apply active search filter if input exists
    const searchInput = document.getElementById('product-search-input');
    const query = (searchInput?.value || '').trim();

    if (query) {
      handleProductSearch();
    } else {
      filteredAdminProducts = [...allAdminProducts];
      updateProductCountBadge(filteredAdminProducts.length, allAdminProducts.length, false);
      renderAdminProductsTable(filteredAdminProducts, false);
    }
  } catch (err) {
    console.error('Failed to load products in Admin Portal:', err);
    if (loadingState) loadingState.style.display = 'none';
    if (table) table.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      if (emptyTitle) emptyTitle.textContent = 'Failed to Load Products';
      if (emptyMsg) {
        emptyMsg.textContent = err.status === 403 
          ? 'Access denied: Administrator permissions required.' 
          : (err.message || 'Unable to fetch catalog items from backend server.');
      }
      if (emptyAction) {
        emptyAction.style.display = 'block';
        emptyAction.innerHTML = '<button type="button" class="btn-primary" onclick="loadAdminProducts()">Retry Connection</button>';
      }
    }
    showAdminToast('Catalog Error', 'Failed to load products from server.');
  } finally {
    isProductsLoading = false;
  }
}

/**
 * Renders the products array into the admin products table.
 * @param {Array} items - List of products to render
 * @param {boolean} isSearch - True if rendering search results
 */
function renderAdminProductsTable(items, isSearch = false) {
  const loadingState = document.getElementById('products-loading-state');
  const emptyState = document.getElementById('products-empty-state');
  const emptyTitle = document.getElementById('products-empty-title');
  const emptyMsg = document.getElementById('products-empty-message');
  const emptyAction = document.getElementById('products-empty-action');
  const table = document.getElementById('admin-products-table');
  const tbody = document.getElementById('admin-products-tbody');

  if (loadingState) loadingState.style.display = 'none';
  if (emptyAction) emptyAction.style.display = 'none';

  if (!items || items.length === 0) {
    if (table) table.style.display = 'none';
    if (tbody) tbody.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
      if (emptyTitle) {
        emptyTitle.textContent = isSearch ? 'No Products Found' : 'Catalog Empty';
      }
      if (emptyMsg) {
        emptyMsg.textContent = isSearch
          ? 'No products match your search query. Try different keywords or clear the search box.'
          : 'No products are currently in the catalog. Click "Add Product" above to create your first item.';
      }
    }
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (table) table.style.display = 'table';

  if (!tbody) return;

  tbody.innerHTML = items.map(product => {
    const id = product.id;
    const name = escapeHtml(product.name || 'Untitled Product');
    const category = escapeHtml(formatCategoryLabel(product.category));
    const price = parseFloat(product.price || 0).toFixed(2);
    const carbon = product.carbonFootprint != null ? parseFloat(product.carbonFootprint).toFixed(2) : '0.00';
    const stock = parseInt(product.stockQuantity || 0, 10);
    const desc = escapeHtml(product.description || '');
    const imgUrl = escapeHtml(product.imageUrl || '');
    const fallbackImg = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=100&q=80';

    // Stock badge styling
    let stockHtml = '';
    if (stock <= 0) {
      stockHtml = '<span class="stock-pill out-of-stock" style="display:inline-block; font-size:0.75rem; font-weight:700; color:#b91c1c; background-color:#fee2e2; padding:0.2rem 0.55rem; border-radius:9999px;">Out of Stock</span>';
    } else if (stock <= 5) {
      stockHtml = `<span class="stock-pill low-stock" style="display:inline-block; font-size:0.75rem; font-weight:600; color:#92400e; background-color:#fef3c7; padding:0.2rem 0.55rem; border-radius:9999px;">${stock} in stock (Low)</span>`;
    } else {
      stockHtml = `<span class="stock-pill in-stock" style="display:inline-block; font-size:0.75rem; font-weight:600; color:#166534; background-color:#dcfce7; padding:0.2rem 0.55rem; border-radius:9999px;">${stock} units</span>`;
    }

    return `
      <tr data-product-id="${id}">
        <td style="width: 70px;">
          <img 
            src="${imgUrl || fallbackImg}" 
            alt="${name}" 
            class="admin-thumb-img" 
            loading="lazy"
            onerror="this.onerror=null;this.src='${fallbackImg}';"
          />
        </td>
        <td>
          <div style="font-weight: 600; color: var(--color-primary-dark); font-size: 0.92rem; margin-bottom: 0.2rem;">${name}</div>
          ${desc ? `<div style="font-size: 0.8rem; color: var(--color-text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${desc}</div>` : ''}
          ${product.ecoFriendly ? '<span class="eco-badge" style="font-size: 0.68rem; padding: 0.15rem 0.45rem; margin-top: 0.3rem; display: inline-block;">Eco Friendly</span>' : ''}
        </td>
        <td>
          <span class="order-status-pill placed" style="background-color: var(--color-cream-card); color: var(--color-primary-dark); font-weight: 600; font-size: 0.78rem;">${category}</span>
        </td>
        <td>
          <strong style="color: var(--color-primary-dark); font-size: 0.95rem;">₹${price}</strong>
        </td>
        <td>
          ${stockHtml}
        </td>
        <td>
          <span class="carbon-badge low" style="font-size: 0.75rem;">${carbon} kg CO2e</span>
        </td>
        <td style="text-align: right;">
          <div class="admin-table-actions">
            <button type="button" class="btn-table-action edit" data-action="edit" data-id="${id}" aria-label="Edit ${name}">Edit</button>
            <button type="button" class="btn-table-action delete" data-action="delete" data-id="${id}" aria-label="Delete ${name}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Handles real-time search input for products by name, category, or description.
 */
function handleProductSearch() {
  const searchInput = document.getElementById('product-search-input');
  const query = (searchInput?.value || '').trim().toLowerCase();

  if (!query) {
    filteredAdminProducts = [...allAdminProducts];
    updateProductCountBadge(filteredAdminProducts.length, allAdminProducts.length, false);
    renderAdminProductsTable(filteredAdminProducts, false);
    return;
  }

  filteredAdminProducts = allAdminProducts.filter(p => {
    const nameMatch = p.name && p.name.toLowerCase().includes(query);
    const catMatch = p.category && p.category.toLowerCase().includes(query);
    const descMatch = p.description && p.description.toLowerCase().includes(query);
    return nameMatch || catMatch || descMatch;
  });

  updateProductCountBadge(filteredAdminProducts.length, allAdminProducts.length, true);
  renderAdminProductsTable(filteredAdminProducts, true);
}

/**
 * Updates the toolbar count badge for products (e.g. "10 items" or "Showing 3 of 10").
 */
function updateProductCountBadge(count, total, isFiltering) {
  const badge = document.getElementById('product-count-badge');
  if (!badge) return;

  if (isFiltering) {
    badge.textContent = `Showing ${count} of ${total}`;
  } else {
    badge.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  }
}

/**
 * Opens the Add Product Modal with reset form fields.
 */
function openAddProductModal() {
  const productModal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('product-modal-title');
  const form = document.getElementById('product-form');
  const errorAlert = document.getElementById('product-form-error');
  const idInput = document.getElementById('product-id-input');
  const ecoInput = document.getElementById('product-eco-input');
  const saveBtn = document.getElementById('btn-save-product');

  if (modalTitle) modalTitle.textContent = 'Add New Eco Product';
  if (idInput) idInput.value = '';
  if (form) form.reset();
  if (ecoInput) ecoInput.checked = true;
  if (errorAlert) {
    errorAlert.style.display = 'none';
    errorAlert.textContent = '';
  }
  if (saveBtn) {
    saveBtn.disabled = false;
    const span = saveBtn.querySelector('span');
    if (span) span.textContent = 'Save Product';
  }

  openModal(productModal);
}

/**
 * Opens the Edit Product Modal pre-populated with existing product data.
 * @param {string|number} productId 
 */
function openEditProductModal(productId) {
  const product = allAdminProducts.find(p => String(p.id) === String(productId));
  if (!product) {
    showAdminToast('Error', 'Selected product was not found in catalog.');
    return;
  }

  const productModal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('product-modal-title');
  const idInput = document.getElementById('product-id-input');
  const nameInput = document.getElementById('product-name-input');
  const priceInput = document.getElementById('product-price-input');
  const stockInput = document.getElementById('product-stock-input');
  const carbonInput = document.getElementById('product-carbon-input');
  const imageInput = document.getElementById('product-image-input');
  const descInput = document.getElementById('product-desc-input');
  const ecoInput = document.getElementById('product-eco-input');
  const errorAlert = document.getElementById('product-form-error');
  const saveBtn = document.getElementById('btn-save-product');

  if (modalTitle) modalTitle.textContent = 'Edit Eco Product';
  if (idInput) idInput.value = product.id;
  if (nameInput) nameInput.value = product.name || '';
  if (priceInput) priceInput.value = product.price != null ? product.price : '';
  if (stockInput) stockInput.value = product.stockQuantity != null ? product.stockQuantity : '';
  if (carbonInput) carbonInput.value = product.carbonFootprint != null ? product.carbonFootprint : '';
  if (imageInput) imageInput.value = product.imageUrl || '';
  if (descInput) descInput.value = product.description || '';
  if (ecoInput) ecoInput.checked = product.ecoFriendly !== false;

  setCategorySelectValue(product.category);

  if (errorAlert) {
    errorAlert.style.display = 'none';
    errorAlert.textContent = '';
  }
  if (saveBtn) {
    saveBtn.disabled = false;
    const span = saveBtn.querySelector('span');
    if (span) span.textContent = 'Update Product';
  }

  openModal(productModal);
}

/**
 * Handles Add / Edit Product Form Submission.
 * Validates inputs, creates/updates via API, handles errors, and refreshes catalog.
 * @param {Event} e 
 */
async function handleProductFormSubmit(e) {
  e.preventDefault();

  const idInput = document.getElementById('product-id-input');
  const nameInput = document.getElementById('product-name-input');
  const categoryInput = document.getElementById('product-category-input');
  const priceInput = document.getElementById('product-price-input');
  const stockInput = document.getElementById('product-stock-input');
  const carbonInput = document.getElementById('product-carbon-input');
  const imageInput = document.getElementById('product-image-input');
  const descInput = document.getElementById('product-desc-input');
  const ecoInput = document.getElementById('product-eco-input');
  const errorAlert = document.getElementById('product-form-error');
  const saveBtn = document.getElementById('btn-save-product');
  const productModal = document.getElementById('product-modal');

  const productId = (idInput?.value || '').trim();
  const name = (nameInput?.value || '').trim();
  const category = (categoryInput?.value || '').trim();
  const priceStr = (priceInput?.value || '').trim();
  const stockStr = (stockInput?.value || '').trim();
  const carbonStr = (carbonInput?.value || '').trim();
  const imageUrl = (imageInput?.value || '').trim();
  const description = (descInput?.value || '').trim();
  const ecoFriendly = ecoInput ? ecoInput.checked : true;

  if (errorAlert) {
    errorAlert.style.display = 'none';
    errorAlert.textContent = '';
  }

  // --- Client-side Field Validation ---
  if (!name) {
    showFormError('Please enter a valid product title.');
    nameInput?.focus();
    return;
  }
  if (name.length > 200) {
    showFormError('Product title cannot exceed 200 characters.');
    nameInput?.focus();
    return;
  }

  if (!category) {
    showFormError('Please select a product category.');
    categoryInput?.focus();
    return;
  }

  const priceNum = parseFloat(priceStr);
  if (!priceStr || isNaN(priceNum) || priceNum <= 0) {
    showFormError('Price must be a positive number greater than ₹0.');
    priceInput?.focus();
    return;
  }

  const stockNum = Number(stockStr);
  if (stockStr === '' || isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
    showFormError('Stock quantity must be a non-negative whole number (0 or greater).');
    stockInput?.focus();
    return;
  }

  let carbonNum = 0.0;
  if (carbonStr !== '') {
    carbonNum = parseFloat(carbonStr);
    if (isNaN(carbonNum) || carbonNum < 0) {
      showFormError('Carbon footprint cannot be negative.');
      carbonInput?.focus();
      return;
    }
  }

  if (imageUrl && imageUrl.length > 500) {
    showFormError('Image URL cannot exceed 500 characters.');
    imageInput?.focus();
    return;
  }

  if (description && description.length > 1000) {
    showFormError('Description cannot exceed 1000 characters.');
    descInput?.focus();
    return;
  }

  // Construct payload adhering strictly to backend Product entity
  const payload = {
    name,
    category,
    price: priceNum,
    stockQuantity: stockNum,
    carbonFootprint: carbonNum,
    imageUrl: imageUrl || null,
    description: description || null,
    ecoFriendly: Boolean(ecoFriendly)
  };

  // Set saving loading state
  if (saveBtn) {
    saveBtn.disabled = true;
    const span = saveBtn.querySelector('span');
    if (span) span.textContent = productId ? 'Updating...' : 'Saving...';
  }

  try {
    if (productId) {
      // Edit existing product: PUT /api/products/{id}
      await updateProduct(productId, payload);
      closeModal(productModal);
      showAdminToast('Product Updated', `"${name}" was successfully updated.`);
    } else {
      // Create new product: POST /api/products
      await createProduct(payload);
      closeModal(productModal);
      showAdminToast('Product Created', `"${name}" was added to the catalog.`);
    }

    // Refresh products list from live backend
    await loadAdminProducts();
  } catch (err) {
    console.error('Error saving product in Admin Portal:', err);
    let errMsg = 'Failed to save product. Please try again.';

    if (err.status === 401) {
      errMsg = 'Your session has expired. Please sign in again as Administrator.';
    } else if (err.status === 403) {
      errMsg = 'Access denied: Administrator privileges required to manage catalog.';
    } else if (err.errors && typeof err.errors === 'object') {
      errMsg = Object.values(err.errors).join(' ');
    } else if (err.message) {
      errMsg = err.message;
    }

    showFormError(errMsg);
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      const span = saveBtn.querySelector('span');
      if (span) span.textContent = productId ? 'Update Product' : 'Save Product';
    }
  }

  function showFormError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

/**
 * Opens Delete Confirmation Dialog for the selected product.
 * @param {string|number} productId 
 */
function openDeleteConfirmModal(productId) {
  const product = allAdminProducts.find(p => String(p.id) === String(productId));
  if (!product) {
    showAdminToast('Error', 'Product not found in catalog.');
    return;
  }

  const deleteModal = document.getElementById('delete-confirm-modal');
  const targetNameEl = document.getElementById('delete-product-name-target');
  const targetIdInput = document.getElementById('delete-product-id-target');
  const confirmBtn = document.getElementById('btn-confirm-delete');

  if (targetNameEl) targetNameEl.textContent = `"${product.name}"`;
  if (targetIdInput) targetIdInput.value = product.id;
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Delete';
  }

  openModal(deleteModal);
}

/**
 * Handles confirmation of product deletion (DELETE /api/products/{id}).
 */
async function handleConfirmDelete() {
  const targetIdInput = document.getElementById('delete-product-id-target');
  const deleteModal = document.getElementById('delete-confirm-modal');
  const confirmBtn = document.getElementById('btn-confirm-delete');

  const productId = targetIdInput?.value;
  if (!productId) return;

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';
  }

  try {
    // Delete product via DELETE /api/products/{id}
    await deleteProduct(productId);
    closeModal(deleteModal);
    showAdminToast('Product Deleted', 'The product was permanently removed from the catalog.');

    // Refresh products list
    await loadAdminProducts();
  } catch (err) {
    console.error('Error deleting product in Admin Portal:', err);
    let errMsg = 'Failed to delete product.';

    if (err.status === 401) {
      errMsg = 'Your session has expired. Please log in again.';
    } else if (err.status === 403) {
      errMsg = 'Access denied: Administrator permissions required.';
    } else if (err.message) {
      errMsg = err.message;
    }

    showAdminToast('Delete Failed', errMsg);
  } finally {
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Delete';
    }
  }
}

// -----------------------------------------------------------------------------
// 5. Order Lifecycle Management (Step 5 Core)
// -----------------------------------------------------------------------------

/**
 * Sets up listeners for Order Management: Filter dropdown, Status modal submit,
 * and View/Update event delegation on the orders table.
 */
function initOrderManagement() {
  const filterSelect = document.getElementById('admin-order-status-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', applyOrderStatusFilter);
  }

  const confirmStatusBtn = document.getElementById('btn-confirm-status-update');
  if (confirmStatusBtn) {
    confirmStatusBtn.addEventListener('click', handleConfirmStatusUpdate);
  }

  // Event delegation on table body for View Details and Update Status buttons
  const tbody = document.getElementById('admin-orders-tbody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const button = e.target.closest('button.btn-table-action');
      if (!button) return;

      const action = button.getAttribute('data-action');
      const orderId = button.getAttribute('data-id');

      if (action === 'view-order' && orderId) {
        openOrderDetailsModal(orderId);
      } else if (action === 'update-status' && orderId) {
        openOrderStatusModal(orderId);
      }
    });
  }
}

/**
 * Fetches all orders across all customers from backend (GET /api/orders/admin/all).
 * Handles loading, error, empty, and retry states.
 */
async function loadAdminOrders() {
  const loadingState = document.getElementById('orders-loading-state');
  const emptyState = document.getElementById('orders-empty-state');
  const emptyTitle = document.getElementById('orders-empty-title');
  const emptyMsg = document.getElementById('orders-empty-message');
  const emptyAction = document.getElementById('orders-empty-action');
  const table = document.getElementById('admin-orders-table');

  isOrdersLoading = true;

  if (loadingState) loadingState.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';
  if (emptyAction) emptyAction.style.display = 'none';
  if (table) table.style.display = 'none';

  try {
    const orders = typeof fetchAllOrdersAdmin === 'function'
      ? await fetchAllOrdersAdmin()
      : await apiGet('/orders/admin/all');

    allAdminOrders = Array.isArray(orders) ? orders : [];

    updateOverviewMetrics();
    applyOrderStatusFilter();
  } catch (err) {
    console.error('Failed to load orders in Admin Portal:', err);
    if (loadingState) loadingState.style.display = 'none';
    if (table) table.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      if (emptyTitle) emptyTitle.textContent = 'Failed to Load Orders';
      if (emptyMsg) {
        emptyMsg.textContent = err.status === 403
          ? 'Access denied: Administrator permissions required.'
          : (err.message || 'Unable to fetch customer orders from backend server.');
      }
      if (emptyAction) {
        emptyAction.style.display = 'block';
        emptyAction.innerHTML = '<button type="button" class="btn-primary" onclick="loadAdminOrders()">Retry Connection</button>';
      }
    }
    showAdminToast('Orders Error', 'Failed to load customer orders from server.');
  } finally {
    isOrdersLoading = false;
  }
}

/**
 * Renders the orders array into the admin orders table.
 * @param {Array} orders - List of orders to render
 * @param {boolean} isFiltered - True if filtering by status
 */
function renderAdminOrdersTable(orders, isFiltered = false) {
  const loadingState = document.getElementById('orders-loading-state');
  const emptyState = document.getElementById('orders-empty-state');
  const emptyTitle = document.getElementById('orders-empty-title');
  const emptyMsg = document.getElementById('orders-empty-message');
  const emptyAction = document.getElementById('orders-empty-action');
  const table = document.getElementById('admin-orders-table');
  const tbody = document.getElementById('admin-orders-tbody');

  if (loadingState) loadingState.style.display = 'none';
  if (emptyAction) emptyAction.style.display = 'none';

  if (!orders || orders.length === 0) {
    if (table) table.style.display = 'none';
    if (tbody) tbody.innerHTML = '';
    if (emptyState) {
      emptyState.style.display = 'block';
      if (emptyTitle) {
        emptyTitle.textContent = isFiltered ? 'No Orders Found' : 'No Orders Placed';
      }
      if (emptyMsg) {
        emptyMsg.textContent = isFiltered
          ? `No customer orders currently have status "${currentOrderFilter}".`
          : 'No customer orders have been placed across the platform yet.';
      }
    }
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (table) table.style.display = 'table';
  if (!tbody) return;

  tbody.innerHTML = orders.map(order => {
    const id = order.id;
    const orderRef = escapeHtml(order.orderNumber || `#EB-${id}`);
    const customerName = escapeHtml(order.customerName || 'Customer');
    const customerEmail = escapeHtml(order.customerEmail || '—');
    const dateFormatted = formatDateTime(order.createdAt);
    const amount = parseFloat(order.totalAmount || 0).toFixed(2);
    const carbon = parseFloat(order.totalCarbonKg || 0).toFixed(2);
    const status = (order.status || 'PLACED').toUpperCase();
    const statusClass = status.toLowerCase();
    const isTerminal = status === 'DELIVERED' || status === 'CANCELLED';

    return `
      <tr data-order-id="${id}">
        <td>
          <strong style="color: var(--color-primary-dark); font-size: 0.9rem; display: block;">${orderRef}</strong>
          <span style="font-size: 0.74rem; color: var(--color-text-muted);">Database Ref: #${id}</span>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 0.9rem; color: var(--color-text);">${customerName}</div>
          <div style="font-size: 0.78rem; color: var(--color-text-muted);">${customerEmail}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem; color: var(--color-text); white-space: nowrap;">${dateFormatted}</div>
        </td>
        <td>
          <strong style="color: var(--color-primary-dark); font-size: 0.95rem;">₹${amount}</strong>
          <div style="font-size: 0.74rem; color: var(--color-text-muted);">${escapeHtml(order.paymentStatus || 'PAID')}</div>
        </td>
        <td>
          <span class="carbon-badge low" style="font-size: 0.75rem;">${carbon} kg CO2e</span>
        </td>
        <td>
          <span class="order-status-pill ${statusClass}">${status}</span>
        </td>
        <td style="text-align: right;">
          <div class="admin-table-actions">
            <button type="button" class="btn-table-action view" data-action="view-order" data-id="${id}" aria-label="View details for ${orderRef}">View Details</button>
            ${isTerminal
              ? `<button type="button" class="btn-table-action" disabled title="Order is in a terminal status (${status})" style="opacity: 0.5; cursor: not-allowed;">Terminal</button>`
              : `<button type="button" class="btn-table-action edit" data-action="update-status" data-id="${id}" aria-label="Update status for ${orderRef}">Update Status</button>`
            }
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Applies status filtering across fetched orders.
 */
function applyOrderStatusFilter() {
  const filterSelect = document.getElementById('admin-order-status-filter');
  currentOrderFilter = (filterSelect?.value || 'ALL').toUpperCase();

  if (currentOrderFilter === 'ALL') {
    filteredAdminOrders = [...allAdminOrders];
  } else {
    filteredAdminOrders = allAdminOrders.filter(o => (o.status || '').toUpperCase() === currentOrderFilter);
  }

  const badge = document.getElementById('order-count-badge');
  if (badge) {
    if (currentOrderFilter === 'ALL') {
      badge.textContent = `${allAdminOrders.length} ${allAdminOrders.length === 1 ? 'order' : 'orders'}`;
    } else {
      badge.textContent = `Showing ${filteredAdminOrders.length} of ${allAdminOrders.length} orders`;
    }
  }

  renderAdminOrdersTable(filteredAdminOrders, currentOrderFilter !== 'ALL');
}

/**
 * Opens Order Details Modal populated with complete backend DTO fields.
 * @param {string|number} orderId 
 */
function openOrderDetailsModal(orderId) {
  const order = allAdminOrders.find(o => String(o.id) === String(orderId));
  if (!order) {
    showAdminToast('Error', 'Order details not found.');
    return;
  }

  const modal = document.getElementById('order-details-modal');
  const body = document.getElementById('order-details-body');
  const title = document.getElementById('order-details-title');

  if (title) title.textContent = `Order Details — ${order.orderNumber || '#' + order.id}`;

  if (body) {
    const status = (order.status || 'PLACED').toUpperCase();
    const statusClass = status.toLowerCase();
    const totalAmount = parseFloat(order.totalAmount || 0).toFixed(2);
    const totalCarbon = parseFloat(order.totalCarbonKg || 0).toFixed(2);

    const itemsHtml = (order.items && order.items.length > 0)
      ? order.items.map(item => {
          const unitPrice = parseFloat(item.unitPrice || 0).toFixed(2);
          const subtotal = parseFloat(item.subtotal || 0).toFixed(2);
          const carbon = item.totalCarbonKg != null
            ? parseFloat(item.totalCarbonKg).toFixed(2)
            : (item.carbonFootprint != null ? (item.carbonFootprint * item.quantity).toFixed(2) : '0.00');

          return `
            <tr style="border-bottom: 1px solid var(--color-border);">
              <td style="padding: 0.75rem 0.85rem;">
                <div style="font-weight: 600; color: var(--color-primary-dark); font-size: 0.9rem;">${escapeHtml(item.productName)}</div>
                ${item.productId ? `<small style="color: var(--color-text-muted);">Product ID: #${item.productId}</small>` : ''}
              </td>
              <td style="padding: 0.75rem 0.85rem; text-align: center; font-weight: 600;">${item.quantity}</td>
              <td style="padding: 0.75rem 0.85rem; text-align: right;">₹${unitPrice}</td>
              <td style="padding: 0.75rem 0.85rem; text-align: right; font-weight: 600;">₹${subtotal}</td>
              <td style="padding: 0.75rem 0.85rem; text-align: right; color: var(--color-leaf); font-weight: 600;">${carbon} kg</td>
            </tr>
          `;
        }).join('')
      : `<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--color-text-muted);">No itemized products found for this order.</td></tr>`;

    body.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.85rem; margin-bottom: 1.25rem; background: var(--color-cream-subtle); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
        <div>
          <span style="display: block; font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Order Number</span>
          <strong style="font-size: 0.92rem; color: var(--color-primary-dark); word-break: break-all;">${escapeHtml(order.orderNumber)}</strong>
        </div>
        <div>
          <span style="display: block; font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Order Date</span>
          <span style="font-size: 0.88rem; color: var(--color-text);">${formatDateTime(order.createdAt)}</span>
        </div>
        <div>
          <span style="display: block; font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Lifecycle Status</span>
          <div><span class="order-status-pill ${statusClass}">${status}</span></div>
        </div>
        <div>
          <span style="display: block; font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Payment Status</span>
          <span class="badge" style="background:#e0f2fe; color:#0369a1; padding:0.18rem 0.55rem; border-radius:4px; font-size:0.75rem; font-weight:700;">${escapeHtml(order.paymentStatus || 'PAID')}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 1.25rem;">
        <div style="background: #ffffff; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.95rem;">
          <h5 style="margin: 0 0 0.45rem 0; font-size: 0.78rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Customer Details</h5>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--color-primary-dark);">${escapeHtml(order.customerName || 'Customer')}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 0.15rem;">${escapeHtml(order.customerEmail || '—')}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.35rem;">Customer Account ID: #${order.customerId || '—'}</div>
        </div>
        <div style="background: #ffffff; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 0.95rem;">
          <h5 style="margin: 0 0 0.45rem 0; font-size: 0.78rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Shipping Destination</h5>
          <div style="font-size: 0.88rem; color: var(--color-text); line-height: 1.45; white-space: pre-line;">${escapeHtml(order.shippingAddress || 'No address provided')}</div>
        </div>
      </div>

      <div style="margin-bottom: 0.5rem;">
        <h5 style="margin: 0 0 0.55rem 0; font-size: 0.82rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em;">Itemized Order Line Items (${order.items ? order.items.length : 0})</h5>
        <div style="border: 1px solid var(--color-border); border-radius: var(--radius-sm); overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem; text-align: left;">
            <thead>
              <tr style="background: var(--color-cream-subtle); border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em;">
                <th style="padding: 0.7rem 0.85rem;">Product</th>
                <th style="padding: 0.7rem 0.85rem; text-align: center;">Qty</th>
                <th style="padding: 0.7rem 0.85rem; text-align: right;">Unit Price</th>
                <th style="padding: 0.7rem 0.85rem; text-align: right;">Subtotal</th>
                <th style="padding: 0.7rem 0.85rem; text-align: right;">Emissions</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid var(--color-border); font-weight: 700; background: var(--color-cream-subtle);">
                <td colspan="3" style="padding: 0.85rem; text-align: right; font-size: 0.88rem;">Total:</td>
                <td style="padding: 0.85rem; text-align: right; color: var(--color-primary-dark); font-size: 1.05rem;">₹${totalAmount}</td>
                <td style="padding: 0.85rem; text-align: right; color: var(--color-leaf); font-size: 0.92rem;">${totalCarbon} kg CO2e</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  openModal(modal);
}

/**
 * Opens Order Status Transition Modal with valid transitions only.
 * Respects strict backend OrderStatus.canTransitionTo() lifecycle rules:
 * - PLACED -> CONFIRMED, CANCELLED
 * - CONFIRMED -> SHIPPED, CANCELLED
 * - SHIPPED -> DELIVERED, CANCELLED
 * - DELIVERED and CANCELLED are terminal
 * @param {string|number} orderId 
 */
function openOrderStatusModal(orderId) {
  const order = allAdminOrders.find(o => String(o.id) === String(orderId));
  if (!order) {
    showAdminToast('Error', 'Order not found.');
    return;
  }

  const modal = document.getElementById('order-status-modal');
  const targetIdInput = document.getElementById('status-target-order-id');
  const targetRefEl = document.getElementById('status-target-order-ref');
  const currentPillEl = document.getElementById('status-target-current-pill');
  const selectEl = document.getElementById('order-new-status-select');
  const errorAlert = document.getElementById('order-status-error');
  const confirmBtn = document.getElementById('btn-confirm-status-update');

  const currentStatus = (order.status || '').toUpperCase();

  if (targetIdInput) targetIdInput.value = order.id;
  if (targetRefEl) targetRefEl.textContent = order.orderNumber || `#${order.id}`;
  if (currentPillEl) {
    currentPillEl.textContent = currentStatus;
    currentPillEl.className = `order-status-pill ${currentStatus.toLowerCase()}`;
  }
  if (errorAlert) {
    errorAlert.style.display = 'none';
    errorAlert.textContent = '';
  }

  // Permitted transition options strictly mirroring backend rules
  const transitionsMap = {
    PLACED: [
      { value: 'CONFIRMED', text: 'CONFIRMED — Verified for fulfillment' },
      { value: 'CANCELLED', text: 'CANCELLED — Restock items to inventory' }
    ],
    CONFIRMED: [
      { value: 'SHIPPED', text: 'SHIPPED — Dispatched via plastic-free transit' },
      { value: 'CANCELLED', text: 'CANCELLED — Restock items to inventory' }
    ],
    SHIPPED: [
      { value: 'DELIVERED', text: 'DELIVERED — Successfully handed over' },
      { value: 'CANCELLED', text: 'CANCELLED — Restock items to inventory' }
    ]
  };

  const allowed = transitionsMap[currentStatus] || [];

  if (selectEl) {
    if (allowed.length === 0) {
      selectEl.innerHTML = `<option value="">No transitions available (Terminal State)</option>`;
      selectEl.disabled = true;
      if (confirmBtn) confirmBtn.disabled = true;
    } else {
      selectEl.disabled = false;
      selectEl.innerHTML = allowed.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('');
      if (confirmBtn) confirmBtn.disabled = false;
    }
  }

  openModal(modal);
}

/**
 * Handles confirmation of order status transition (PUT /api/orders/{id}/status).
 * On success, refreshes orders, product catalog (for stock replenishment), and overview metrics.
 */
async function handleConfirmStatusUpdate() {
  const targetIdInput = document.getElementById('status-target-order-id');
  const selectEl = document.getElementById('order-new-status-select');
  const errorAlert = document.getElementById('order-status-error');
  const confirmBtn = document.getElementById('btn-confirm-status-update');
  const modal = document.getElementById('order-status-modal');

  const orderId = targetIdInput?.value;
  const newStatus = selectEl?.value;

  if (!orderId || !newStatus) return;

  const order = allAdminOrders.find(o => String(o.id) === String(orderId));
  const orderRef = order?.orderNumber || `#${orderId}`;

  if (errorAlert) {
    errorAlert.style.display = 'none';
    errorAlert.textContent = '';
  }

  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Applying Transition...';
  }

  try {
    const updated = typeof updateOrderStatus === 'function'
      ? await updateOrderStatus(orderId, newStatus)
      : await apiPut(`/orders/${orderId}/status`, { status: newStatus });

    closeModal(modal);

    const msg = newStatus === 'CANCELLED'
      ? `Order ${orderRef} was cancelled. Inventory quantities have been automatically restored.`
      : `Order ${orderRef} was transitioned to ${newStatus}.`;

    showAdminToast('Status Updated', msg);

    // Refresh orders and recalculate overview metrics
    await loadAdminOrders();

    // If order was cancelled, auto-restocking occurred on backend, so refresh products catalog
    if (newStatus === 'CANCELLED') {
      await loadAdminProducts();
    }
  } catch (err) {
    console.error('Failed to update order status:', err);
    if (errorAlert) {
      errorAlert.style.display = 'block';
      errorAlert.textContent = err.message || 'Failed to update order status. Transition rejected.';
    }
  } finally {
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Apply Transition';
    }
  }
}

// -----------------------------------------------------------------------------
// 6. Helper Utilities
// -----------------------------------------------------------------------------

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str 
 * @returns {string} Sanitized string
 */
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Converts category slugs into reader-friendly title labels.
 * @param {string} cat 
 * @returns {string} Formatted category label
 */
function formatCategoryLabel(cat) {
  if (!cat) return 'General';
  const map = {
    'personal-care': 'Personal Care',
    'fashion': 'Fashion',
    'tech': 'Tech & Solar',
    'lifestyle': 'Lifestyle',
    'kitchen': 'Kitchen',
    'home': 'Home'
  };
  return map[cat.toLowerCase()] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

/**
 * Sets the value of the category select input, matching slug or display text.
 * @param {string} cat 
 */
function setCategorySelectValue(cat) {
  const select = document.getElementById('product-category-input');
  if (!select || !cat) return;

  const target = cat.toLowerCase().replace(/\s+/g, '-');
  for (let i = 0; i < select.options.length; i++) {
    const optVal = select.options[i].value.toLowerCase().replace(/\s+/g, '-');
    if (optVal === target || select.options[i].value.toLowerCase() === cat.toLowerCase()) {
      select.selectedIndex = i;
      return;
    }
  }

  // If category is not in standard list, append it dynamically
  const opt = document.createElement('option');
  opt.value = cat;
  opt.textContent = formatCategoryLabel(cat);
  select.appendChild(opt);
  select.value = cat;
}

/**
 * Formats ISO date-time string into a human-readable date.
 * @param {string} isoString 
 * @returns {string} Formatted date string
 */
function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Debounces a function execution.
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
function debounce(func, wait = 150) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// -----------------------------------------------------------------------------
// 7. Global Window Exports for Accessibility & Automated Testing
// -----------------------------------------------------------------------------
window.openAdminModal = openModal;
window.closeAdminModal = closeModal;
window.showAdminToast = showAdminToast;
window.loadAdminProducts = loadAdminProducts;
window.renderAdminProductsTable = renderAdminProductsTable;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.openDeleteConfirmModal = openDeleteConfirmModal;
window.handleProductSearch = handleProductSearch;
window.loadAdminOrders = loadAdminOrders;
window.renderAdminOrdersTable = renderAdminOrdersTable;
window.applyOrderStatusFilter = applyOrderStatusFilter;
window.openOrderDetailsModal = openOrderDetailsModal;
window.openOrderStatusModal = openOrderStatusModal;
window.handleConfirmStatusUpdate = handleConfirmStatusUpdate;
window.updateOverviewMetrics = updateOverviewMetrics;
