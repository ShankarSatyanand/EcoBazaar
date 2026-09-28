/**
 * EcoBazaar - Carbon-Aware Smart Shopping Platform
 * Script: api.js
 * 
 * Central API & Authentication Utility
 * - Manages backend API communication with http://localhost:8080/api
 * - Automatically injects JWT Authorization Bearer header
 * - Handles JSON serialization, HTTP errors, 401/403 states, and network failures
 * - Provides local session management (tokens, user profile, login status)
 */

'use strict';

// -----------------------------------------------------------------------------
// 1. Configuration & Storage Keys
// -----------------------------------------------------------------------------
const API_BASE_URL = 'http://localhost:8080/api';
const STORAGE_TOKEN_KEY = 'ecobazaar_token';
const STORAGE_USER_KEY = 'ecobazaar_user';

// -----------------------------------------------------------------------------
// 2. Authentication Utilities
// -----------------------------------------------------------------------------

/**
 * Retrieves the stored JWT token from localStorage.
 * @returns {string|null} JWT token string or null if not logged in
 */
function getToken() {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  } catch (err) {
    console.error('Error reading token from localStorage:', err);
    return null;
  }
}

/**
 * Stores or clears the JWT token in localStorage.
 * @param {string|null} token - JWT token string, or null to remove
 */
function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  } catch (err) {
    console.error('Error saving token to localStorage:', err);
  }
}

/**
 * Retrieves the current logged-in user profile from localStorage.
 * @returns {object|null} User object or null
 */
function getLoggedInUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Error parsing user from localStorage:', err);
    return null;
  }
}

/**
 * Stores or clears the logged-in user profile in localStorage.
 * @param {object|null} user - User object to store, or null to remove
 */
function setLoggedInUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  } catch (err) {
    console.error('Error saving user to localStorage:', err);
  }
}

/**
 * Checks whether the current user is authenticated.
 * @returns {boolean} True if both token and user profile exist
 */
function isLoggedIn() {
  return Boolean(getToken() && getLoggedInUser());
}

/**
 * Clears the active session and authentication data.
 */
function logout() {
  setToken(null);
  setLoggedInUser(null);
  // Dispatch custom event so UI components can react to logout
  window.dispatchEvent(new CustomEvent('ecobazaar:auth-changed', { detail: { isLoggedIn: false } }));
}

// -----------------------------------------------------------------------------
// 3. Central Request Engine
// -----------------------------------------------------------------------------

/**
 * Normalizes an endpoint path to a full backend URL.
 * @param {string} endpoint - Path like '/products' or full URL
 * @returns {string} Fully qualified URL
 */
function buildApiUrl(endpoint) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Base HTTP request executor handling headers, JWT auth, and responses.
 * 
 * @param {string} endpoint - API path (e.g. '/products' or '/auth/login')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} Parsed response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);

  // Prepare standard headers
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Automatically attach JWT token if available
  const token = getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type for JSON payloads if not already set and body exists
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const fetchConfig = {
    ...options,
    headers,
    body
  };

  let response;
  try {
    response = await fetch(url, fetchConfig);
  } catch (networkErr) {
    // Handle offline server or network connection issues
    console.error(`Network error when requesting ${url}:`, networkErr);
    const error = new Error('Unable to connect to the EcoBazaar server. Please verify the backend is running at http://localhost:8080.');
    error.status = 0;
    error.isNetworkError = true;
    throw error;
  }

  // Parse response body (try JSON, fallback to plain text)
  let responseData = null;
  try {
    if (response.status !== 204) {
      const rawText = await response.text();
      if (rawText && rawText.trim().length > 0) {
        try {
          responseData = JSON.parse(rawText);
        } catch (jsonErr) {
          // Not valid JSON, return as plain string (e.g. /api/health)
          responseData = rawText;
        }
      }
    }
  } catch (readErr) {
    responseData = null;
  }

  // If response is successful (HTTP 2xx)
  if (response.ok) {
    return response.status === 204 ? (responseData || true) : responseData;
  }

  // Handle HTTP error responses (4xx, 5xx)
  let errorMessage = 'An unexpected error occurred. Please try again.';
  let fieldErrors = null;

  if (responseData && typeof responseData === 'object') {
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.error) {
      errorMessage = responseData.error;
    }

    if (responseData.errors && typeof responseData.errors === 'object') {
      fieldErrors = responseData.errors;
    }
  } else if (typeof responseData === 'string' && responseData.trim().length > 0) {
    errorMessage = responseData;
  } else {
    errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
  }

  // Handle specific HTTP status codes
  if (response.status === 401) {
    console.warn('API returned 401 Unauthorized. Clearing stale credentials.');
    logout();
  } else if (response.status === 403) {
    console.warn('API returned 403 Forbidden. Current user lacks required permissions.');
  }

  // Construct structured error object
  const apiError = new Error(errorMessage);
  apiError.status = response.status;
  apiError.statusText = response.statusText;
  apiError.data = responseData;
  apiError.errors = fieldErrors;
  throw apiError;
}

// -----------------------------------------------------------------------------
// 4. Reusable HTTP Method Helpers
// -----------------------------------------------------------------------------

/**
 * Sends a GET request to the specified API endpoint.
 * @param {string} endpoint - API path
 * @param {object} [options] - Additional fetch options
 * @returns {Promise<any>}
 */
function apiGet(endpoint, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: 'GET'
  });
}

/**
 * Sends a POST request with JSON payload to the specified API endpoint.
 * @param {string} endpoint - API path
 * @param {object} body - Request body
 * @param {object} [options] - Additional fetch options
 * @returns {Promise<any>}
 */
function apiPost(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body
  });
}

/**
 * Sends a PUT request with JSON payload to the specified API endpoint.
 * @param {string} endpoint - API path
 * @param {object} body - Request body
 * @param {object} [options] - Additional fetch options
 * @returns {Promise<any>}
 */
function apiPut(endpoint, body, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body
  });
}

/**
 * Sends a DELETE request to the specified API endpoint.
 * @param {string} endpoint - API path
 * @param {object} [options] - Additional fetch options
 * @returns {Promise<any>}
 */
function apiDelete(endpoint, options = {}) {
  return apiRequest(endpoint, {
    ...options,
    method: 'DELETE'
  });
}

/**
 * Checks backend server health.
 * @returns {Promise<string>} Health response text
 */
function checkBackendHealth() {
  return apiGet('/health');
}

/**
 * Fetches all products from the backend catalog.
 * @returns {Promise<Array>} Array of product objects
 */
function fetchProducts() {
  return apiGet('/products');
}

/**
 * Fetches a single product by ID from the backend catalog.
 * @param {number|string} id - Product ID
 * @returns {Promise<object>} Product object
 */
function fetchProductById(id) {
  return apiGet(`/products/${id}`);
}

/**
 * Retrieves the current authenticated customer's shopping cart from the backend.
 * @returns {Promise<object>} CartResponse DTO
 */
function fetchCart() {
  return apiGet('/cart');
}

/**
 * Adds an item with quantity to the customer's backend cart.
 * @param {number|string} productId - ID of product to add
 * @param {number} [quantity=1] - Quantity to add
 * @returns {Promise<object>} Updated CartResponse DTO
 */
function addCartItem(productId, quantity = 1) {
  return apiPost('/cart/items', {
    productId: parseInt(productId, 10),
    quantity: parseInt(quantity, 10) || 1
  });
}

/**
 * Updates the quantity of an existing item in the customer's cart.
 * @param {number|string} cartItemId - ID of the cart item (CartItem.id)
 * @param {number} quantity - New quantity
 * @returns {Promise<object>} Updated CartResponse DTO
 */
function updateCartItemQty(cartItemId, quantity) {
  return apiPut(`/cart/items/${cartItemId}`, {
    quantity: parseInt(quantity, 10)
  });
}

/**
 * Removes an item from the customer's cart.
 * @param {number|string} cartItemId - ID of the cart item (CartItem.id)
 * @returns {Promise<object>} Updated CartResponse DTO
 */
function deleteCartItem(cartItemId) {
  return apiDelete(`/cart/items/${cartItemId}`);
}

/**
 * Empties all items from the customer's cart.
 * @returns {Promise<object>} Empty CartResponse DTO
 */
function clearBackendCart() {
  return apiDelete('/cart');
}

/**
 * Places an order by submitting the authenticated customer's cart: POST /api/orders/checkout
 * @param {string} shippingAddress - Delivery street address, city, state, PIN
 * @param {string} [paymentMethod='SIMULATED_CARD'] - Simulated payment method
 * @returns {Promise<object>} OrderResponse DTO
 */
function checkoutCart(shippingAddress, paymentMethod = 'SIMULATED_CARD') {
  return apiPost('/orders/checkout', {
    shippingAddress: (shippingAddress || '').trim(),
    paymentMethod: paymentMethod || 'SIMULATED_CARD'
  });
}

/**
 * Retrieves the authenticated customer's placed orders: GET /api/orders
 * @returns {Promise<Array>} Array of OrderResponse DTOs
 */
function fetchOrders() {
  return apiGet('/orders');
}

/**
 * Retrieves a single order by ID: GET /api/orders/{id}
 * @param {number|string} orderId - Order ID
 * @returns {Promise<object>} OrderResponse DTO
 */
function fetchOrderById(orderId) {
  return apiGet(`/orders/${orderId}`);
}

// -----------------------------------------------------------------------------
// 5. Admin API Wrappers (Requires ADMIN Role)
// -----------------------------------------------------------------------------

/**
 * Creates a new eco-friendly product in the catalog (Admin only): POST /api/products
 * @param {object} productData - Product payload (name, price, category, stockQuantity, carbonFootprint, etc.)
 * @returns {Promise<object>} Created Product entity with generated id
 */
function createProduct(productData) {
  return apiPost('/products', productData);
}

/**
 * Updates an existing product in the catalog (Admin only): PUT /api/products/{productId}
 * @param {number|string} productId - ID of product to update
 * @param {object} productData - Updated product fields
 * @returns {Promise<object>} Updated Product entity
 */
function updateProduct(productId, productData) {
  return apiPut(`/products/${productId}`, productData);
}

/**
 * Deletes a product from the catalog (Admin only): DELETE /api/products/{productId}
 * Handles 204 No Content response cleanly.
 * @param {number|string} productId - ID of product to delete
 * @returns {Promise<boolean|any>} True on successful 204 deletion
 */
function deleteProduct(productId) {
  return apiDelete(`/products/${productId}`);
}

/**
 * Retrieves all customer orders across the platform (Admin only): GET /api/orders/admin/all
 * @returns {Promise<Array>} Array of OrderResponse DTOs
 */
function fetchAllOrdersAdmin() {
  return apiGet('/orders/admin/all');
}

/**
 * Updates an order's lifecycle status (Admin only): PUT /api/orders/{orderId}/status
 * @param {number|string} orderId - ID of order to transition
 * @param {string} status - Target status ('PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')
 * @returns {Promise<object>} Updated OrderResponse DTO
 */
function updateOrderStatus(orderId, status) {
  return apiPut(`/orders/${orderId}/status`, { status });
}

// -----------------------------------------------------------------------------
// 6. Global Export Namespace (window.EcoBazaarApi and individual window globals)
// -----------------------------------------------------------------------------
window.EcoBazaarApi = {
  API_BASE_URL,
  STORAGE_TOKEN_KEY,
  STORAGE_USER_KEY,
  getToken,
  setToken,
  getLoggedInUser,
  setLoggedInUser,
  isLoggedIn,
  logout,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  checkBackendHealth,
  fetchProducts,
  fetchProductById,
  fetchCart,
  addCartItem,
  updateCartItemQty,
  deleteCartItem,
  clearBackendCart,
  checkoutCart,
  fetchOrders,
  fetchOrderById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchAllOrdersAdmin,
  updateOrderStatus
};

// Also bind directly on window for direct access across scripts
window.apiRequest = apiRequest;
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPut = apiPut;
window.apiDelete = apiDelete;
window.getToken = getToken;
window.setToken = setToken;
window.getLoggedInUser = getLoggedInUser;
window.setLoggedInUser = setLoggedInUser;
window.isLoggedIn = isLoggedIn;
window.logout = logout;
window.checkBackendHealth = checkBackendHealth;
window.fetchProducts = fetchProducts;
window.fetchProductById = fetchProductById;
window.fetchCart = fetchCart;
window.addCartItem = addCartItem;
window.updateCartItemQty = updateCartItemQty;
window.deleteCartItem = deleteCartItem;
window.clearBackendCart = clearBackendCart;
window.checkoutCart = checkoutCart;
window.fetchOrders = fetchOrders;
window.fetchOrderById = fetchOrderById;
window.createProduct = createProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.fetchAllOrdersAdmin = fetchAllOrdersAdmin;
window.updateOrderStatus = updateOrderStatus;
