/**
 * EcoBazaar - Carbon-Aware Smart Shopping Platform
 * Script: main.js
 * 
 * Features:
 * 1. Comprehensive eco-conscious sample product catalog.
 * 2. Persistent Cart using localStorage (works across all 7 pages).
 * 3. Dynamic Homepage featured products rendering.
 * 4. Catalog page (products.html): real-time search, category filter, and price/carbon sorting.
 * 5. Product details page (product-details.html): URL query param parsing, detailed specs, carbon breakdown, quantity picker.
 * 6. Cart page (cart.html): quantity adjustments, item removal, total INR and total kg CO2e calculations, simulated checkout.
 * 7. Login & Register pages (login.html, register.html): frontend validation & simulated auth state.
 * 8. Dashboard page (dashboard.html): user profile, order history, lifetime carbon savings summary.
 * 9. Toast notification feedback system and responsive navigation.
 */

'use strict';

// -----------------------------------------------------------------------------
// 1. Master Product Catalog (12 Sample Sustainable Products)
// -----------------------------------------------------------------------------
const sampleProducts = [
  {
    id: 1,
    name: "Bamboo Charcoal Toothbrush (Set of 4)",
    category: "personal-care",
    categoryLabel: "Personal Care",
    price: 349,
    carbonKg: 0.15,
    badge: "100% Biodegradable",
    carbonRating: "low",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80",
    description: "Sustainably harvested bamboo handle with natural activated charcoal bristles. Plastic-free packaging.",
    materials: "100% Wild Moso Bamboo & Castor Bean Bristles",
    origin: "Karnataka, India",
    conventionalEmissions: 1.40,
    packaging: "Unbleached recycled kraft paper mailer"
  },
  {
    id: 2,
    name: "Organic Cotton Canvas Market Tote",
    category: "fashion",
    categoryLabel: "Fashion",
    price: 499,
    carbonKg: 0.28,
    badge: "GOTS Certified Organic",
    carbonRating: "low",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    description: "Heavy-duty unbleached organic cotton tote bag designed to replace over 500 single-use shopping bags.",
    materials: "100% Certified Organic Canvas (320 GSM)",
    origin: "Gujarat, India",
    conventionalEmissions: 1.65,
    packaging: "Biodegradable cornstarch sleeve"
  },
  {
    id: 3,
    name: "Solar-Powered Portable Charger (10,000mAh)",
    category: "tech",
    categoryLabel: "Tech & Solar",
    price: 1899,
    carbonKg: 1.35,
    badge: "Renewable Energy",
    carbonRating: "moderate",
    image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=80",
    description: "High-efficiency monocrystalline solar panels with dual USB fast-charge outputs and rugged casing.",
    materials: "Recycled ABS housing & Monocrystalline PV cells",
    origin: "Pune, India",
    conventionalEmissions: 4.80,
    packaging: "100% Recyclable corrugated board"
  },
  {
    id: 4,
    name: "Zero-Waste Solid Shampoo Bar",
    category: "personal-care",
    categoryLabel: "Personal Care",
    price: 399,
    carbonKg: 0.12,
    badge: "Zero Water Waste",
    carbonRating: "low",
    image: "https://images.unsplash.com/photo-1608248597359-28197ff76ef2?auto=format&fit=crop&w=600&q=80",
    description: "Infused with cold-pressed coconut and argan oils. Replaces 3 plastic shampoo bottles.",
    materials: "Cold-pressed virgin coconut oil, rosemary & plant extracts",
    origin: "Kerala, India",
    conventionalEmissions: 1.10,
    packaging: "Compostable botanical paper wrap"
  },
  {
    id: 5,
    name: "Recycled Ocean Plastic Sunglasses",
    category: "fashion",
    categoryLabel: "Fashion",
    price: 1299,
    carbonKg: 0.58,
    badge: "Upcycled Ocean Waste",
    carbonRating: "moderate",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
    description: "UV400 polarized lenses set in frames crafted from 100% recovered ocean ghost fishing nets.",
    materials: "Recovered nylon ghost fishing nets & polarized mineral glass",
    origin: "Goa, India",
    conventionalEmissions: 2.90,
    packaging: "Recycled RPET felt slip pouch"
  },
  {
    id: 6,
    name: "Plant-Based Compostable Phone Case",
    category: "tech",
    categoryLabel: "Tech & Solar",
    price: 699,
    carbonKg: 0.22,
    badge: "Flaxseed & Biopolymer",
    carbonRating: "low",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80",
    description: "Shock-absorbing phone protection made from wheat straw and bioplastics. Fully compostable in 180 days.",
    materials: "Flax shive fibers & plant-derived PLA biopolymers",
    origin: "Bengaluru, India",
    conventionalEmissions: 1.85,
    packaging: "Seed-paper carton you can plant"
  },
  {
    id: 7,
    name: "Handcrafted Jute Storage Basket",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    price: 799,
    carbonKg: 0.45,
    badge: "Artisan Made",
    carbonRating: "low",
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
    description: "Woven by local artisan cooperatives using naturally rain-fed natural golden jute fibers.",
    materials: "100% Natural Golden Jute & Organic Cotton Stitching",
    origin: "West Bengal, India",
    conventionalEmissions: 2.10,
    packaging: "Cotton thread bound with kraft tag"
  },
  {
    id: 8,
    name: "Stainless Steel Insulated Thermal Flask (750ml)",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    price: 899,
    carbonKg: 0.72,
    badge: "Lifetime Reusable",
    carbonRating: "moderate",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    description: "Double-wall vacuum insulation keeps drinks cold for 24h or hot for 12h. Zero toxic coatings.",
    materials: "Food-grade 304 (18/8) Stainless Steel & Bamboo cap",
    origin: "Maharashtra, India",
    conventionalEmissions: 3.20,
    packaging: "Recycled cardboard cylinder box"
  },
  {
    id: 9,
    name: "Solar Garden Lantern with Warm LED",
    category: "tech",
    categoryLabel: "Tech & Solar",
    price: 1499,
    carbonKg: 0.95,
    badge: "Solar Powered",
    carbonRating: "moderate",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80",
    description: "Weatherproof solar outdoor lantern with auto dusk-to-dawn sensor and hand-blown recycled glass.",
    materials: "Recycled wrought iron and upcycled bottle glass",
    origin: "Rajasthan, India",
    conventionalEmissions: 3.80,
    packaging: "Molded pulp interior with kraft shell"
  },
  {
    id: 10,
    name: "Hemp Fiber Everyday Daypack",
    category: "fashion",
    categoryLabel: "Fashion",
    price: 2199,
    carbonKg: 0.88,
    badge: "Durable Pure Hemp",
    carbonRating: "moderate",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    description: "Naturally antimicrobial, tear-resistant industrial hemp backpack with padded laptop sleeve.",
    materials: "100% Himalayan Industrial Hemp & Brass hardware",
    origin: "Uttarakhand, India",
    conventionalEmissions: 4.10,
    packaging: "Reusable canvas dust cover"
  },
  {
    id: 11,
    name: "Pure Handcrafted Copper Bottle (950ml)",
    category: "lifestyle",
    categoryLabel: "Lifestyle",
    price: 1049,
    carbonKg: 0.60,
    badge: "Ayurvedic Heritage",
    carbonRating: "moderate",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    description: "Hammered pure copper bottle crafted by traditional thatheras. Naturally alkalizes drinking water.",
    materials: "99.4% Pure Virgin Sheet Copper",
    origin: "Punjab, India",
    conventionalEmissions: 2.70,
    packaging: "Handmade jute drawstring pouch"
  },
  {
    id: 12,
    name: "Ayurvedic Neem & Tulsi Bath Bar (Set of 3)",
    category: "personal-care",
    categoryLabel: "Personal Care",
    price: 299,
    carbonKg: 0.10,
    badge: "Chemical-Free",
    carbonRating: "low",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    description: "Cold-saponified botanical bar with pure neem oil, tulsi leaves, and nourishing shea butter.",
    materials: "Organic neem oil, basil extract, saponified coconut oil",
    origin: "Tamil Nadu, India",
    conventionalEmissions: 0.90,
    packaging: "Recycled paper wrapping"
  }
];

// -----------------------------------------------------------------------------
// 1b. Product Normalizer & Central Catalog Store
// -----------------------------------------------------------------------------
/**
 * Normalizes backend product entities into standard frontend objects with
 * consistent property names, carbon impact ratings, and display badges.
 */
function normalizeProduct(p) {
  if (!p) return null;

  const numericId = parseInt(p.id, 10);
  const sample = (typeof sampleProducts !== 'undefined' && sampleProducts.find(s => s.id === numericId || s.name === p.name)) || {};

  const category = (p.category || sample.category || 'lifestyle').toLowerCase();
  const categoryLabels = {
    'personal-care': 'Personal Care',
    'fashion': 'Fashion',
    'tech': 'Tech & Solar',
    'lifestyle': 'Lifestyle'
  };
  const categoryLabel = p.categoryLabel || sample.categoryLabel || categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);

  const price = typeof p.price === 'number' ? p.price : (parseFloat(p.price) || sample.price || 0);

  // Carbon footprint: backend returns `carbonFootprint`, frontend uses `carbonKg`
  const carbonKg = typeof p.carbonFootprint === 'number' 
    ? p.carbonFootprint 
    : (typeof p.carbonKg === 'number' 
        ? p.carbonKg 
        : (parseFloat(p.carbonFootprint) || sample.carbonKg || 0.5));

  const carbonRating = carbonKg < 0.5 ? 'low' : (carbonKg < 1.5 ? 'moderate' : 'high');
  const badge = p.badge || sample.badge || (carbonRating === 'low' ? 'Low Carbon Impact 🌱' : 'Sustainable Choice');

  // Conventional emissions for carbon savings breakdown
  const conventionalEmissions = typeof sample.conventionalEmissions === 'number'
    ? sample.conventionalEmissions
    : Math.max(parseFloat((carbonKg * 3.2).toFixed(2)), parseFloat((carbonKg + 1.2).toFixed(2)));

  const image = p.imageUrl || p.image || sample.image || 'https://placehold.co/600x400/2d5a46/ffffff?text=EcoBazaar+Product';

  return {
    id: numericId,
    name: p.name || sample.name || 'Sustainable Product',
    category: category,
    categoryLabel: categoryLabel,
    price: price,
    carbonKg: carbonKg,
    carbonFootprint: carbonKg,
    carbonRating: carbonRating,
    badge: badge,
    image: image,
    imageUrl: image,
    description: p.description || sample.description || 'Eco-friendly and sustainably crafted product for conscious living.',
    stockQuantity: p.stockQuantity !== undefined ? p.stockQuantity : (sample.stockQuantity || 50),
    ecoFriendly: p.ecoFriendly !== undefined ? p.ecoFriendly : true,
    materials: p.materials || sample.materials || 'Sustainable & Responsibly Sourced Materials',
    origin: p.origin || sample.origin || 'Ethically Made in India',
    conventionalEmissions: conventionalEmissions,
    packaging: p.packaging || sample.packaging || '100% Recyclable Plastic-Free Packaging'
  };
}

// Active products store, initialized with normalized sample products as instant fallback
let activeProducts = sampleProducts.map(normalizeProduct);

/**
 * Looks up a product by ID from active catalog or fallback sample products.
 */
function getCatalogProduct(productId) {
  const numericId = parseInt(productId, 10);
  return (activeProducts && activeProducts.find(p => p.id === numericId)) ||
         (sampleProducts && sampleProducts.find(p => p.id === numericId)) ||
         null;
}
window.normalizeProduct = normalizeProduct;
window.getCatalogProduct = getCatalogProduct;

// -----------------------------------------------------------------------------
// 2. Global Path Helper
// -----------------------------------------------------------------------------
/**
 * Detects whether the current page is inside the /pages/ subfolder.
 */
function isInsidePages() {
  return window.location.pathname.includes('/pages/') || 
         window.location.href.includes('/pages/');
}

/**
 * Returns correct relative path to product details page.
 */
function getProductDetailsUrl(id) {
  return isInsidePages() ? `product-details.html?id=${id}` : `pages/product-details.html?id=${id}`;
}

/**
 * Escapes special HTML characters to prevent XSS.
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes single and double quotes for safe embedding in inline JS attributes.
 */
function escapeQuote(str) {
  if (str == null) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// -----------------------------------------------------------------------------
// 3. Persistent Cart Management (Spring Boot Backend API)
// -----------------------------------------------------------------------------
let cachedCartResponse = null;

/**
 * Updates all cart badge counters in the DOM.
 * @param {number} [count] - Optional explicit count
 */
function updateCartCountBadge(count) {
  const finalCount = count !== undefined ? count : (cachedCartResponse ? (cachedCartResponse.itemCount || 0) : 0);
  const badges = document.querySelectorAll('#cart-count');
  badges.forEach(badge => {
    badge.textContent = finalCount;
  });
}

/**
 * Refreshes cart item count badge from the backend if authenticated.
 */
async function refreshCartBadge() {
  const authenticated = typeof isLoggedIn === 'function' ? isLoggedIn() : (typeof window !== 'undefined' && typeof window.isLoggedIn === 'function' && window.isLoggedIn());
  if (!authenticated) {
    cachedCartResponse = null;
    updateCartCountBadge(0);
    return 0;
  }

  try {
    const fetchFn = typeof fetchCart === 'function' ? fetchCart : (typeof window !== 'undefined' && typeof window.fetchCart === 'function' ? window.fetchCart : () => apiGet('/cart'));
    const cart = await fetchFn();
    cachedCartResponse = cart;
    const count = (cart && cart.itemCount !== undefined) ? cart.itemCount : 0;
    updateCartCountBadge(count);
    return count;
  } catch (err) {
    console.warn('Failed to refresh cart count from backend:', err.message);
    updateCartCountBadge(cachedCartResponse ? (cachedCartResponse.itemCount || 0) : 0);
    return 0;
  }
}

/**
 * Adds a product to the customer's cart via the Spring Boot backend: POST /api/cart/items
 * Requires the customer to be logged in. If unauthenticated, prompts and redirects to login.
 *
 * @param {number|string} productId - Product ID
 * @param {number} [quantity=1] - Quantity to add
 * @param {HTMLElement|null} [buttonElement=null] - Optional button for feedback state
 */
async function addToCart(productId, quantity = 1, buttonElement = null) {
  const numericId = parseInt(productId, 10);
  const product = getCatalogProduct(numericId);
  const productName = product ? product.name : `Product #${numericId}`;

  const authenticated = typeof isLoggedIn === 'function' ? isLoggedIn() : (typeof window !== 'undefined' && typeof window.isLoggedIn === 'function' && window.isLoggedIn());

  if (!authenticated) {
    showToast("Sign In Required", "Please sign in to add products to your eco cart.");
    setTimeout(() => {
      const isPages = typeof isInsidePages === 'function' ? isInsidePages() : window.location.pathname.includes('/pages/');
      window.location.href = isPages ? 'login.html' : 'pages/login.html';
    }, 1200);
    return;
  }

  const originalHtml = buttonElement ? buttonElement.innerHTML : '';
  if (buttonElement) {
    buttonElement.disabled = true;
    buttonElement.innerHTML = `Adding...`;
  }

  try {
    const addFn = typeof addCartItem === 'function' ? addCartItem : (typeof window !== 'undefined' && typeof window.addCartItem === 'function' ? window.addCartItem : (id, qty) => apiPost('/cart/items', { productId: id, quantity: qty }));
    const updatedCart = await addFn(numericId, quantity);
    cachedCartResponse = updatedCart;

    updateCartCountBadge(updatedCart.itemCount);

    if (buttonElement) {
      buttonElement.classList.add('added');
      buttonElement.innerHTML = `✓ Added`;
      setTimeout(() => {
        buttonElement.classList.remove('added');
        buttonElement.innerHTML = originalHtml;
        buttonElement.disabled = false;
      }, 1400);
    }

    const itemFootprint = product ? (product.carbonKg * quantity).toFixed(2) : '0.00';
    showToast(
      `Added to Cart!`,
      `${productName} (x${quantity}) added. Footprint: ${itemFootprint} kg CO2e`
    );

    // If currently on cart page, re-render cart view
    if (typeof window.renderCartFromResponse === 'function') {
      window.renderCartFromResponse(updatedCart);
    }
  } catch (err) {
    console.error('Add to cart failed:', err);
    if (buttonElement) {
      buttonElement.innerHTML = originalHtml;
      buttonElement.disabled = false;
    }
    showToast("Error", err.message || "Failed to add item to cart. Please try again.");
  }
}
window.addToCart = addToCart;
window.updateCartCountBadge = updateCartCountBadge;
window.refreshCartBadge = refreshCartBadge;

// -----------------------------------------------------------------------------
// 4. Toast Notification Utility
// -----------------------------------------------------------------------------
let toastTimer = null;

function showToast(title, message) {
  const toastElement = document.getElementById('toast-notification');
  if (!toastElement) return;

  const titleEl = toastElement.querySelector('.toast-title');
  const msgEl = toastElement.querySelector('.toast-desc');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  toastElement.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.classList.remove('show');
  }, 3500);
}

// -----------------------------------------------------------------------------
// 5. Global Mobile Menu & Newsletter
// -----------------------------------------------------------------------------
function setupMobileNavigation() {
  const mobileMenuToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!mobileMenuToggle || !navMenu) return;

  mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isExpanded = navMenu.classList.contains('open');
    mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
  });

  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupNewsletter() {
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterStatus = document.getElementById('newsletter-status');

  if (!newsletterForm || !newsletterStatus) return;

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    if (!emailInput || !emailInput.value.trim()) return;

    const email = emailInput.value.trim();
    newsletterStatus.textContent = `Thank you for subscribing! Green tips sent to ${email}`;
    newsletterStatus.style.color = '#8edaa0';
    emailInput.value = '';

    setTimeout(() => {
      newsletterStatus.textContent = '';
    }, 5000);
  });
}

// -----------------------------------------------------------------------------
// 5b. Dynamic Navigation Authentication State
// -----------------------------------------------------------------------------
function updateNavigationAuthState() {
  const navMenu = document.getElementById('nav-menu');
  if (!navMenu) return;

  // Retrieve or identify login and register nav links
  let loginLink = navMenu.querySelector('[data-nav-auth="login"]');
  let registerLink = navMenu.querySelector('[data-nav-auth="register"]');

  if (!loginLink) {
    loginLink = navMenu.querySelector('a[href*="login.html"]');
    if (loginLink) {
      loginLink.setAttribute('data-nav-auth', 'login');
      loginLink.setAttribute('data-orig-href', loginLink.getAttribute('href'));
      loginLink.setAttribute('data-orig-text', loginLink.textContent.trim());
    }
  }

  if (!registerLink) {
    registerLink = navMenu.querySelector('.nav-register-btn') || navMenu.querySelector('a[href*="register.html"]');
    if (registerLink) {
      registerLink.setAttribute('data-nav-auth', 'register');
      registerLink.setAttribute('data-orig-href', registerLink.getAttribute('href'));
      registerLink.setAttribute('data-orig-text', registerLink.textContent.trim());
    }
  }

  const authenticated = (typeof isLoggedIn === 'function' ? isLoggedIn() : false) ||
                        (typeof window !== 'undefined' && typeof window.isLoggedIn === 'function' ? window.isLoggedIn() : false);
  const user = authenticated 
    ? (typeof getLoggedInUser === 'function' ? getLoggedInUser() : (typeof window !== 'undefined' && typeof window.getLoggedInUser === 'function' ? window.getLoggedInUser() : null))
    : null;

  if (authenticated && user) {
    const rawName = user.fullName || user.name || 'User';
    const firstName = rawName.trim().split(' ')[0];

    // Determine dashboard path relative to current page
    const existingDashLink = navMenu.querySelector('a[href*="dashboard.html"]');
    const dashboardHref = existingDashLink 
      ? existingDashLink.getAttribute('href') 
      : (window.location.pathname.includes('/pages/') ? 'dashboard.html' : 'pages/dashboard.html');

    if (loginLink) {
      loginLink.href = dashboardHref;
      loginLink.textContent = `Hi, ${firstName}`;
      loginLink.title = `Signed in as ${rawName} (${user.email || ''})`;
      if (window.location.pathname.endsWith('dashboard.html')) {
        loginLink.classList.add('active');
      } else {
        loginLink.classList.remove('active');
      }
    }

    if (registerLink) {
      registerLink.href = '#';
      registerLink.textContent = 'Log Out';
      registerLink.className = 'nav-link nav-logout-btn';
      registerLink.onclick = (e) => {
        e.preventDefault();
        if (typeof logout === 'function') {
          logout();
        } else if (typeof window !== 'undefined' && typeof window.logout === 'function') {
          window.logout();
        }
        showToast('Logged Out', 'You have successfully logged out of EcoBazaar.');
        updateNavigationAuthState();

        const isPagesDir = window.location.pathname.includes('/pages/') || 
                           (loginLink && loginLink.getAttribute('data-orig-href') && !loginLink.getAttribute('data-orig-href').startsWith('pages/'));
        const loginPageHref = isPagesDir ? 'login.html' : 'pages/login.html';

        if (window.location.pathname.includes('dashboard.html')) {
          setTimeout(() => {
            window.location.href = loginPageHref;
          }, 800);
        }
      };
    }
  } else {
    // Unauthenticated state - restore original login and register links
    if (loginLink) {
      const origHref = loginLink.getAttribute('data-orig-href') || 'login.html';
      const origText = loginLink.getAttribute('data-orig-text') || 'Login';
      loginLink.href = origHref;
      loginLink.textContent = origText;
      loginLink.title = '';
      if (window.location.pathname.endsWith('login.html')) {
        loginLink.classList.add('active');
      } else {
        loginLink.classList.remove('active');
      }
    }

    if (registerLink) {
      const origHref = registerLink.getAttribute('data-orig-href') || 'register.html';
      const origText = registerLink.getAttribute('data-orig-text') || 'Register';
      registerLink.href = origHref;
      registerLink.textContent = origText;
      registerLink.className = 'nav-link nav-register-btn';
      registerLink.onclick = null;
      if (window.location.pathname.endsWith('register.html')) {
        registerLink.classList.add('active');
      } else {
        registerLink.classList.remove('active');
      }
    }
  }
}
window.updateNavigationAuthState = updateNavigationAuthState;

// -----------------------------------------------------------------------------
// 6. Homepage: Featured Products Initializer
// -----------------------------------------------------------------------------
async function initHomePage() {
  const productsGrid = document.getElementById('products-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!productsGrid) return;

  let currentHomeCategory = 'all';

  function render(category = 'all') {
    currentHomeCategory = category;
    const sourceList = (activeProducts && activeProducts.length > 0) ? activeProducts : sampleProducts.map(normalizeProduct);
    const filtered = category === 'all'
      ? sourceList.slice(0, 8) // Show top 8 on homepage
      : sourceList.filter(item => item.category === category);

    productsGrid.innerHTML = '';

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
          <p style="color: var(--color-text-muted);">No featured products available in this category.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(product => {
      const card = document.createElement('article');
      card.className = 'product-card';
      const carbonBadgeClass = product.carbonRating === 'low' ? 'low' : 'moderate';
      const carbonIcon = product.carbonRating === 'low' ? '🌱' : '⚖️';
      const detailLink = getProductDetailsUrl(product.id);

      card.innerHTML = `
        <div class="product-image-box">
          <a href="${detailLink}">
            <img 
              src="${escapeHtml(product.image)}" 
              alt="${escapeHtml(product.name)}" 
              class="product-image"
              loading="lazy"
              onerror="this.onerror=null; this.src='https://placehold.co/600x400/2d5a46/ffffff?text=EcoBazaar+Product';"
            />
          </a>
          <div class="card-badges">
            <span class="eco-badge">${escapeHtml(product.badge)}</span>
            <span class="carbon-badge ${carbonBadgeClass}" title="Estimated carbon footprint">
              ${carbonIcon} ${product.carbonKg.toFixed(2)} kg CO2e
            </span>
          </div>
        </div>

        <div class="product-content">
          <span class="product-category">${escapeHtml(product.categoryLabel)}</span>
          <h3 class="product-title">
            <a href="${detailLink}">${escapeHtml(product.name)}</a>
          </h3>
          <p class="product-desc">${escapeHtml(product.description)}</p>

          <div class="product-carbon-meter" title="Carbon footprint impact per unit">
            <span class="carbon-meter-label">
              <svg fill="currentColor" viewBox="0 0 24 24" width="14" height="14">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C7 7.35 5.5 8.7 4 10.5c3.5-1 7.5-1.5 13-2.5z"/>
              </svg>
              Estimated Emissions
            </span>
            <span class="carbon-meter-value">${product.carbonKg.toFixed(2)} kg CO2e</span>
          </div>

          <div class="product-footer">
            <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
            <button 
              type="button" 
              class="btn-add-cart" 
              onclick="addToCart(${product.id}, 1, this)"
              aria-label="Add ${escapeHtml(product.name)} to cart"
            >
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }

  // Filter Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-filter');
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(cat);
    });
  });

  // Display initial loading indicator while fetching catalog
  productsGrid.innerHTML = `
    <div class="catalog-loading">
      <div class="loading-spinner"></div>
      <p style="color: var(--color-text-muted);">Loading sustainable products...</p>
    </div>
  `;

  // Fetch real products from backend: GET /api/products
  try {
    const fetchFn = (typeof fetchProducts === 'function' ? fetchProducts : (typeof window !== 'undefined' && typeof window.fetchProducts === 'function' ? window.fetchProducts : () => apiGet('/products')));
    const backendProducts = await fetchFn();
    if (Array.isArray(backendProducts) && backendProducts.length > 0) {
      activeProducts = backendProducts.map(normalizeProduct);
    }
  } catch (err) {
    console.warn('Backend product fetch failed on homepage, falling back to local catalog:', err.message);
  } finally {
    render(currentHomeCategory);
  }
}

// -----------------------------------------------------------------------------
// 7. Products Catalog Page (products.html)
// -----------------------------------------------------------------------------
async function initCatalogPage() {
  const catalogGrid = document.getElementById('catalog-grid');
  const searchInput = document.getElementById('catalog-search');
  const sortSelect = document.getElementById('catalog-sort');
  const resultsCountEl = document.getElementById('results-count');
  const filterButtons = document.querySelectorAll('.filter-btn');

  if (!catalogGrid) return;

  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = 'default';

  function applyFiltersAndRender() {
    const sourceList = (activeProducts && activeProducts.length > 0) ? activeProducts : sampleProducts.map(normalizeProduct);
    let items = [...sourceList];

    // 1. Category Filter
    if (currentCategory !== 'all') {
      items = items.filter(p => p.category === currentCategory);
    }

    // 2. Search Keyword Filter
    if (currentSearch.trim() !== '') {
      const term = currentSearch.toLowerCase().trim();
      items = items.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.categoryLabel.toLowerCase().includes(term) ||
        p.badge.toLowerCase().includes(term)
      );
    }

    // 3. Sorting
    if (currentSort === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'carbon-low') {
      items.sort((a, b) => a.carbonKg - b.carbonKg);
    }

    // Update count display
    const totalCount = sourceList.length;
    if (resultsCountEl) {
      resultsCountEl.textContent = `Showing ${items.length} of ${totalCount} eco-friendly products`;
    }

    // Render items
    catalogGrid.innerHTML = '';

    if (items.length === 0) {
      catalogGrid.innerHTML = `
        <div class="catalog-error">
          <h3>No matching sustainable products found</h3>
          <p>Try adjusting your search keywords or choosing a different category filter.</p>
        </div>
      `;
      return;
    }

    items.forEach(product => {
      const card = document.createElement('article');
      card.className = 'product-card';
      const carbonBadgeClass = product.carbonRating === 'low' ? 'low' : 'moderate';
      const carbonIcon = product.carbonRating === 'low' ? '🌱' : '⚖️';
      const detailLink = `product-details.html?id=${product.id}`;

      card.innerHTML = `
        <div class="product-image-box">
          <a href="${detailLink}">
            <img 
              src="${escapeHtml(product.image)}" 
              alt="${escapeHtml(product.name)}" 
              class="product-image"
              loading="lazy"
              onerror="this.onerror=null; this.src='https://placehold.co/600x400/2d5a46/ffffff?text=EcoBazaar+Product';"
            />
          </a>
          <div class="card-badges">
            <span class="eco-badge">${escapeHtml(product.badge)}</span>
            <span class="carbon-badge ${carbonBadgeClass}" title="Estimated carbon footprint in kg CO2e">
              ${carbonIcon} ${product.carbonKg.toFixed(2)} kg CO2e
            </span>
          </div>
        </div>

        <div class="product-content">
          <span class="product-category">${escapeHtml(product.categoryLabel)}</span>
          <h3 class="product-title">
            <a href="${detailLink}">${escapeHtml(product.name)}</a>
          </h3>
          <p class="product-desc">${escapeHtml(product.description)}</p>

          <div class="product-carbon-meter" title="Carbon footprint impact per unit">
            <span class="carbon-meter-label">
              <svg fill="currentColor" viewBox="0 0 24 24" width="14" height="14">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C7 7.35 5.5 8.7 4 10.5c3.5-1 7.5-1.5 13-2.5z"/>
              </svg>
              Estimated Emissions
            </span>
            <span class="carbon-meter-value">${product.carbonKg.toFixed(2)} kg CO2e</span>
          </div>

          <div class="product-footer">
            <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
            <button 
              type="button" 
              class="btn-add-cart" 
              onclick="addToCart(${product.id}, 1, this)"
              aria-label="Add ${escapeHtml(product.name)} to cart"
            >
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      `;
      catalogGrid.appendChild(card);
    });
  }

  // Bind Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Bind Sort Dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Bind Category Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-filter');
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFiltersAndRender();
    });
  });

  // Display initial loading indicator while fetching catalog
  catalogGrid.innerHTML = `
    <div class="catalog-loading">
      <div class="loading-spinner"></div>
      <p style="color: var(--color-text-muted);">Loading sustainable catalog...</p>
    </div>
  `;

  // Fetch real products from backend: GET /api/products
  try {
    const fetchFn = (typeof fetchProducts === 'function' ? fetchProducts : (typeof window !== 'undefined' && typeof window.fetchProducts === 'function' ? window.fetchProducts : () => apiGet('/products')));
    const backendProducts = await fetchFn();
    if (Array.isArray(backendProducts) && backendProducts.length > 0) {
      activeProducts = backendProducts.map(normalizeProduct);
    }
  } catch (err) {
    console.warn('Backend product fetch failed on catalog page, falling back to local catalog:', err.message);
  } finally {
    applyFiltersAndRender();
  }
}

// -----------------------------------------------------------------------------
// 8. Product Details Page (product-details.html)
// -----------------------------------------------------------------------------
async function initDetailPage() {
  const container = document.getElementById('product-detail-container');
  if (!container) return;

  // Parse product ID from query parameter e.g. ?id=3
  const params = new URLSearchParams(window.location.search);
  const idParam = parseInt(params.get('id'), 10) || 1;

  // Show loading indicator
  container.innerHTML = `
    <div style="text-align: center; padding: 5rem 1rem;">
      <div class="loading-spinner"></div>
      <p style="color: var(--color-text-muted); margin-top: 1rem;">Loading eco product details...</p>
    </div>
  `;

  let product = null;

  // Attempt to fetch from backend: GET /api/products/{id}
  try {
    const fetchFn = (typeof fetchProductById === 'function' ? fetchProductById : (typeof window !== 'undefined' && typeof window.fetchProductById === 'function' ? window.fetchProductById : (id) => apiGet(`/products/${id}`)));
    const backendProduct = await fetchFn(idParam);
    if (backendProduct && backendProduct.id) {
      product = normalizeProduct(backendProduct);
    }
  } catch (err) {
    console.warn(`Could not fetch product ${idParam} from backend, checking local catalog:`, err.message);
  }

  // Fallback to local catalog if backend fetch didn't return product
  if (!product) {
    const local = getCatalogProduct(idParam);
    if (local) {
      product = normalizeProduct(local);
    }
  }

  // If still not found, show friendly not-found message
  if (!product) {
    container.innerHTML = `
      <div class="catalog-error" style="padding: 5rem 1rem;">
        <h3>Product Not Found</h3>
        <p>We couldn't locate the sustainable product you requested.</p>
        <a href="products.html" class="btn-primary">Back to Products Catalog</a>
      </div>
    `;
    return;
  }

  const savingsKg = (product.conventionalEmissions - product.carbonKg).toFixed(2);
  const savingsPct = Math.round((savingsKg / product.conventionalEmissions) * 100);

  // Set document title
  document.title = `${product.name} — EcoBazaar`;

  container.innerHTML = `
    <div class="detail-grid">
      <!-- Product Gallery & Badges -->
      <div class="detail-gallery">
        <img 
          src="${escapeHtml(product.image)}" 
          alt="${escapeHtml(product.name)}" 
          class="detail-main-img"
          onerror="this.onerror=null; this.src='https://placehold.co/800x600/2d5a46/ffffff?text=EcoBazaar+Product';"
        />
        <div class="detail-badges">
          <span class="eco-badge">${escapeHtml(product.badge)}</span>
          <span class="carbon-badge ${product.carbonRating === 'low' ? 'low' : 'moderate'}">
            ${product.carbonRating === 'low' ? '🌱' : '⚖️'} ${product.carbonKg.toFixed(2)} kg CO2e
          </span>
        </div>
      </div>

      <!-- Product Information -->
      <div class="detail-info">
        <span class="detail-category">${escapeHtml(product.categoryLabel)}</span>
        <h1 class="detail-title">${escapeHtml(product.name)}</h1>
        
        <div class="detail-price-box">
          <span class="detail-price">₹${product.price.toLocaleString('en-IN')}</span>
          <span class="detail-tax-note">Includes all taxes • Carbon-neutral shipping</span>
        </div>

        <p class="detail-desc">${escapeHtml(product.description)}</p>

        <!-- Carbon Impact Breakdown Box -->
        <div class="detail-carbon-highlight">
          <div class="carbon-highlight-header">
            <span class="carbon-highlight-title">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style="color: var(--color-leaf);">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C7 7.35 5.5 8.7 4 10.5c3.5-1 7.5-1.5 13-2.5z"/>
              </svg>
              Carbon & Ethical Verification
            </span>
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--color-leaf);">
              -${savingsPct}% CO2e vs. Standard
            </span>
          </div>

          <ul class="carbon-spec-list">
            <li class="carbon-spec-item">
              <span>Estimated Lifecycle Emissions:</span>
              <strong>${product.carbonKg.toFixed(2)} kg CO2e</strong>
            </li>
            <li class="carbon-spec-item">
              <span>Conventional Alternative Emissions:</span>
              <span style="color: #b45309;">~${product.conventionalEmissions.toFixed(2)} kg CO2e</span>
            </li>
            <li class="carbon-spec-item">
              <span>Primary Sustainable Materials:</span>
              <span>${escapeHtml(product.materials)}</span>
            </li>
            <li class="carbon-spec-item">
              <span>Artisan / Origin:</span>
              <span>${escapeHtml(product.origin)}</span>
            </li>
            <li class="carbon-spec-item">
              <span>Packaging Standard:</span>
              <span>${escapeHtml(product.packaging)}</span>
            </li>
          </ul>
        </div>

        <!-- Quantity & Add to Cart Controls -->
        <div class="detail-actions-row">
          <div class="qty-picker">
            <button type="button" class="qty-btn" id="qty-minus" aria-label="Decrease quantity">−</button>
            <input type="text" id="detail-qty" class="qty-input" value="1" readonly />
            <button type="button" class="qty-btn" id="qty-plus" aria-label="Increase quantity">+</button>
          </div>

          <button type="button" class="btn-primary" id="detail-add-btn" style="flex-grow: 1; justify-content: center;">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="20" height="20">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Eco Cart
          </button>
        </div>
      </div>
    </div>
  `;

  // Bind Stepper
  const minusBtn = document.getElementById('qty-minus');
  const plusBtn = document.getElementById('qty-plus');
  const qtyInput = document.getElementById('detail-qty');
  const addBtn = document.getElementById('detail-add-btn');

  let currentQty = 1;

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty -= 1;
        qtyInput.value = currentQty;
      }
    });
  }

  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      if (currentQty < 10) {
        currentQty += 1;
        qtyInput.value = currentQty;
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addToCart(product.id, currentQty, addBtn);
    });
  }
}

// -----------------------------------------------------------------------------
// 9. Cart Page (cart.html)
// -----------------------------------------------------------------------------
function initCartPage() {
  const itemsContainer = document.getElementById('cart-items-container');
  const summaryContainer = document.getElementById('cart-summary-container');
  const checkoutModal = document.getElementById('checkout-modal');
  let isSubmittingCheckout = false;

  if (!itemsContainer) return;

  const loginPath = isInsidePages() ? 'login.html' : 'pages/login.html';
  const registerPath = isInsidePages() ? 'register.html' : 'pages/register.html';
  const catalogPath = isInsidePages() ? 'products.html' : 'pages/products.html';

  function renderUnauthenticatedState() {
    itemsContainer.innerHTML = `
      <div class="empty-cart-box">
        <svg class="empty-cart-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        <h3 style="color: var(--color-primary-dark); font-size: 1.4rem; margin-bottom: 0.5rem;">Sign In to View Your Green Cart</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 440px; margin-left: auto; margin-right: auto;">
          Sign in to your EcoBazaar account to access your saved items, calculate total carbon savings, and continue to green checkout.
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="${loginPath}" class="btn-primary">Sign In to Your Account</a>
          <a href="${registerPath}" class="btn-secondary">Create Free Account</a>
        </div>
      </div>
    `;
    if (summaryContainer) {
      summaryContainer.style.display = 'none';
      summaryContainer.innerHTML = '';
    }
  }

  function renderLoadingState() {
    itemsContainer.innerHTML = `
      <div class="catalog-loading" style="padding: 3.5rem 0; text-align: center;">
        <div class="spinner"></div>
        <p style="margin-top: 1rem; color: var(--color-text-muted);">Loading your green cart...</p>
      </div>
    `;
    if (summaryContainer) {
      summaryContainer.style.display = 'none';
    }
  }

  function renderErrorState(message) {
    itemsContainer.innerHTML = `
      <div class="empty-cart-box">
        <svg class="empty-cart-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: #b91c1c;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 style="color: var(--color-primary-dark); font-size: 1.4rem; margin-bottom: 0.5rem;">Unable to Load Cart</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 440px; margin-left: auto; margin-right: auto;">
          ${escapeHtml(message || 'An error occurred while fetching your shopping cart.')}
        </p>
        <button type="button" class="btn-primary" onclick="initCartPage()">Retry Loading Cart</button>
      </div>
    `;
    if (summaryContainer) {
      summaryContainer.style.display = 'none';
    }
  }

  function renderCart(cart) {
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-cart-box">
          <svg class="empty-cart-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h3 style="color: var(--color-primary-dark); font-size: 1.4rem; margin-bottom: 0.5rem;">Your Green Cart is Empty</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 420px; margin-left: auto; margin-right: auto;">
            Explore our curated catalog of sustainable products and start lowering your household carbon footprint today.
          </p>
          <a href="${catalogPath}" class="btn-primary">Browse Sustainable Catalog</a>
        </div>
      `;
      if (summaryContainer) {
        summaryContainer.style.display = 'none';
        summaryContainer.innerHTML = '';
      }
      return;
    }

    let totalConventional = 0;
    let itemsHtml = `
      <div class="cart-items-card">
        <div class="cart-table-header">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span style="text-align: right;">Action</span>
        </div>
    `;

    cart.items.forEach(item => {
      const product = getCatalogProduct(item.productId);
      const itemSubtotal = Number(item.subtotal != null ? item.subtotal : (item.unitPrice * item.quantity));
      const unitPrice = Number(item.unitPrice || (product ? product.price : 0));
      const itemFootprint = Number(item.itemCarbonTotal != null ? item.itemCarbonTotal : ((item.carbonFootprint || 0.5) * item.quantity)).toFixed(2);
      const unitFootprint = Number(item.carbonFootprint != null ? item.carbonFootprint : (product ? product.carbonKg : 0.5)).toFixed(2);
      const conventionalPerUnit = product && product.conventionalEmissions ? product.conventionalEmissions : (item.carbonFootprint || 0.5) * 3.2;
      totalConventional += conventionalPerUnit * item.quantity;

      const itemImg = item.imageUrl || (product ? product.image : '') || 'https://placehold.co/100x100/2d5a46/ffffff?text=Item';
      const detailUrl = getProductDetailsUrl(item.productId);
      const isAtMaxStock = item.stockQuantity != null && item.quantity >= item.stockQuantity;

      itemsHtml += `
        <div class="cart-item-row" id="cart-item-${item.id}">
          <div class="cart-item-prod">
            <a href="${detailUrl}">
              <img 
                src="${escapeHtml(itemImg)}" 
                alt="${escapeHtml(item.productName)}" 
                class="cart-item-img"
                onerror="this.onerror=null; this.src='https://placehold.co/100x100/2d5a46/ffffff?text=Item';"
              />
            </a>
            <div class="cart-item-info">
              <h4><a href="${detailUrl}" style="color: inherit; text-decoration: none;">${escapeHtml(item.productName)}</a></h4>
              <span class="cart-item-carbon" title="${unitFootprint} kg CO2e per unit">🌱 ${itemFootprint} kg CO2e</span>
            </div>
          </div>

          <div class="cart-item-price">
            ₹${itemSubtotal.toLocaleString('en-IN')}
            <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">₹${unitPrice.toLocaleString('en-IN')} each</div>
          </div>

          <div>
            <div class="qty-picker">
              <button type="button" class="qty-btn" onclick="modifyCartItemQty(${item.id}, ${item.quantity - 1})" aria-label="Decrease quantity">−</button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly aria-label="Quantity" />
              <button type="button" class="qty-btn" onclick="modifyCartItemQty(${item.id}, ${item.quantity + 1})" aria-label="Increase quantity" ${isAtMaxStock ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>+</button>
            </div>
            ${isAtMaxStock ? `<div style="font-size: 0.7rem; color: #b91c1c; margin-top: 0.25rem;">Max stock (${item.stockQuantity})</div>` : ''}
          </div>

          <div style="text-align: right;">
            <button type="button" class="cart-item-remove" onclick="removeBackendCartItem(${item.id}, '${escapeQuote(item.productName)}')" aria-label="Remove ${escapeHtml(item.productName)}">
              ✕ Remove
            </button>
          </div>
        </div>
      `;
    });

    itemsHtml += `</div>`;
    itemsContainer.innerHTML = itemsHtml;

    // Render Order & Carbon Summary
    const subtotal = Number(cart.totalAmount || 0);
    const shipping = subtotal > 499 || subtotal === 0 ? 0 : 49;
    const finalTotal = subtotal + shipping;
    const totalCarbon = Number(cart.totalCarbonKg || 0);
    const savedCarbon = Math.max(0, totalConventional - totalCarbon).toFixed(2);

    if (summaryContainer) {
      summaryContainer.style.display = 'block';
      summaryContainer.innerHTML = `
        <div class="cart-summary-card">
          <h3 class="summary-title">Order & Carbon Summary</h3>

          <div class="summary-row">
            <span>Items Subtotal:</span>
            <strong>₹${subtotal.toLocaleString('en-IN')}</strong>
          </div>

          <div class="summary-row">
            <span>Carbon-Neutral Delivery:</span>
            <span>${shipping === 0 ? '<strong style="color: var(--color-leaf);">FREE</strong>' : `₹${shipping}`}</span>
          </div>

          <div class="carbon-summary-box">
            <div class="carbon-summary-title">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C7 7.35 5.5 8.7 4 10.5c3.5-1 7.5-1.5 13-2.5z"/>
              </svg>
              Total Estimated Cart Footprint
            </div>
            <div class="carbon-summary-val">${totalCarbon.toFixed(2)} kg CO2e</div>
            <div style="font-size: 0.78rem; color: var(--color-carbon-low-text); margin-top: 0.25rem;">
              🌱 You save approx. <strong>${savedCarbon} kg CO2e</strong> compared to conventional retail!
            </div>
          </div>

          <div class="summary-row total">
            <span>Estimated Total:</span>
            <span>₹${finalTotal.toLocaleString('en-IN')}</span>
          </div>

          <!-- Shipping Address Collection -->
          <div class="checkout-address-group" style="margin-top: 1.25rem; margin-bottom: 0.85rem; text-align: left;">
            <label for="checkout-shipping-address" class="form-label" style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; display: block; color: var(--color-text-dark);">
              Delivery Shipping Address <span style="color: #b91c1c;">*</span>
            </label>
            <textarea 
              id="checkout-shipping-address" 
              class="form-input" 
              rows="2" 
              placeholder="Enter street address, city, state & PIN code"
              style="font-size: 0.85rem; width: 100%; border-radius: var(--radius-sm); border: 1px solid var(--color-border); padding: 0.6rem; font-family: inherit; resize: vertical;"
              required
            ></textarea>
            <span class="form-error" id="checkout-address-error" style="display: none; font-size: 0.78rem; color: #b91c1c; margin-top: 0.25rem;">
              Please enter a delivery shipping address.
            </span>
          </div>

          <!-- Demo Simulated Payment Notice -->
          <div class="demo-payment-note" style="font-size: 0.76rem; color: var(--color-primary-dark); background-color: var(--color-cream-subtle); border: 1px dashed var(--color-border); border-radius: var(--radius-sm); padding: 0.55rem 0.75rem; margin-bottom: 1.15rem; text-align: left; line-height: 1.45;">
            💳 <strong>Demo Checkout:</strong> Simulated payment method is applied automatically (no credit card charge). 100% plastic-free packaging guaranteed.
          </div>

          <!-- Checkout Error Alert -->
          <div class="auth-alert error" id="checkout-error-alert" style="display: none; margin-bottom: 1rem; text-align: left; font-size: 0.85rem;"></div>

          <button type="button" class="btn-submit-full" id="checkout-trigger-btn">
            Proceed to Green Checkout
          </button>

          <p style="font-size: 0.75rem; color: var(--color-text-muted); text-align: center; margin-top: 0.75rem;">
            🔒 Safe simulated checkout. 100% plastic-free packaging guaranteed.
          </p>
        </div>
      `;

      // Bind Checkout Button
      const triggerBtn = document.getElementById('checkout-trigger-btn');
      const addressInput = document.getElementById('checkout-shipping-address');
      const addressError = document.getElementById('checkout-address-error');
      const errorAlert = document.getElementById('checkout-error-alert');

      if (triggerBtn) {
        triggerBtn.addEventListener('click', async () => {
          // 1. Authentication check
          const authenticated = typeof isLoggedIn === 'function' ? isLoggedIn() : (typeof window !== 'undefined' && typeof window.isLoggedIn === 'function' && window.isLoggedIn());
          if (!authenticated) {
            showToast("Sign In Required", "Please sign in to complete your green order.");
            setTimeout(() => {
              window.location.href = isInsidePages() ? 'login.html' : 'pages/login.html';
            }, 1200);
            return;
          }

          // 2. Empty cart check
          if (!cachedCartResponse || !cachedCartResponse.items || cachedCartResponse.items.length === 0) {
            showToast("Empty Cart", "Cannot checkout with an empty cart. Please add sustainable items first.");
            return;
          }

          // 3. Shipping address validation
          const address = addressInput ? addressInput.value.trim() : '';
          if (!address) {
            if (addressError) addressError.style.display = 'block';
            if (addressInput) {
              addressInput.style.borderColor = '#b91c1c';
              addressInput.focus();
            }
            return;
          } else {
            if (addressError) addressError.style.display = 'none';
            if (addressInput) addressInput.style.borderColor = 'var(--color-border)';
          }

          // 4. Duplicate submission prevention
          if (isSubmittingCheckout) return;
          isSubmittingCheckout = true;
          triggerBtn.disabled = true;
          triggerBtn.innerHTML = `Placing Green Order...`;
          if (errorAlert) {
            errorAlert.style.display = 'none';
            errorAlert.textContent = '';
          }

          try {
            const checkoutFn = typeof checkoutCart === 'function' ? checkoutCart : (typeof window !== 'undefined' && typeof window.checkoutCart === 'function' ? window.checkoutCart : (addr) => apiPost('/orders/checkout', { shippingAddress: addr, paymentMethod: 'SIMULATED_CARD' }));
            const order = await checkoutFn(address, 'SIMULATED_CARD');

            // Success: update modal with actual backend order details
            const modalRef = document.getElementById('modal-order-number');
            if (modalRef) modalRef.textContent = '#' + (order.orderNumber || order.id);

            const modalId = document.getElementById('modal-order-id');
            if (modalId) modalId.textContent = '#' + order.id;

            const modalAmount = document.getElementById('modal-order-amount');
            if (modalAmount) modalAmount.textContent = '₹' + Number(order.totalAmount).toLocaleString('en-IN');

            const modalAddress = document.getElementById('modal-order-address');
            if (modalAddress) modalAddress.textContent = order.shippingAddress;

            const modalCarbon = document.getElementById('modal-order-carbon');
            if (modalCarbon) modalCarbon.textContent = (order.totalCarbonKg != null ? Number(order.totalCarbonKg).toFixed(2) : '0.00') + ' kg CO2e saved 🌱';

            // Clear cached cart and reset navbar badge
            cachedCartResponse = { id: cachedCartResponse ? cachedCartResponse.id : null, items: [], itemCount: 0, totalAmount: 0, totalCarbonKg: 0 };
            updateCartCountBadge(0);

            // Open confirmation modal
            if (checkoutModal) {
              checkoutModal.classList.add('open');
            }

            showToast("Order Confirmed!", `Order #${order.orderNumber} successfully placed.`);
          } catch (err) {
            console.error('Checkout error:', err);
            let errMsg = err.message || 'An error occurred while placing your order.';
            if (err.errors && err.errors.shippingAddress) {
              errMsg = err.errors.shippingAddress;
            }
            if (errorAlert) {
              errorAlert.textContent = errMsg;
              errorAlert.style.display = 'block';
            }
            showToast("Order Placement Failed", errMsg);
          } finally {
            isSubmittingCheckout = false;
            triggerBtn.disabled = false;
            triggerBtn.innerHTML = `Proceed to Green Checkout`;
          }
        });
      }
    }
  }

  // Exposed helper to re-render without reloading if cart object is already available
  window.renderCartFromResponse = function(cart) {
    cachedCartResponse = cart;
    renderCart(cart);
  };

  // Main loader: fetches cart from backend
  async function loadAndRenderCart() {
    const authenticated = typeof isLoggedIn === 'function' ? isLoggedIn() : (typeof window !== 'undefined' && typeof window.isLoggedIn === 'function' && window.isLoggedIn());

    if (!authenticated) {
      renderUnauthenticatedState();
      updateCartCountBadge(0);
      return;
    }

    renderLoadingState();

    try {
      const fetchFn = typeof fetchCart === 'function' ? fetchCart : (typeof window !== 'undefined' && typeof window.fetchCart === 'function' ? window.fetchCart : () => apiGet('/cart'));
      const cart = await fetchFn();
      cachedCartResponse = cart;
      updateCartCountBadge(cart ? cart.itemCount : 0);
      renderCart(cart);
    } catch (err) {
      console.error('Failed to load cart from backend:', err);
      if (err.status === 401) {
        renderUnauthenticatedState();
        updateCartCountBadge(0);
      } else {
        renderErrorState(err.message || 'Could not connect to the backend server to load your cart.');
      }
    }
  }

  window.loadAndRenderCart = loadAndRenderCart;

  // Global functions for inline button click handlers
  window.modifyCartItemQty = async function(cartItemId, newQty) {
    const numericItemId = parseInt(cartItemId, 10);
    if (!numericItemId) return;

    if (newQty <= 0) {
      await window.removeBackendCartItem(numericItemId);
      return;
    }

    try {
      const updateFn = typeof updateCartItemQty === 'function' ? updateCartItemQty : (typeof window !== 'undefined' && typeof window.updateCartItemQty === 'function' ? window.updateCartItemQty : (id, qty) => apiPut(`/cart/items/${id}`, { quantity: qty }));
      const updatedCart = await updateFn(numericItemId, newQty);
      cachedCartResponse = updatedCart;
      updateCartCountBadge(updatedCart.itemCount);
      renderCart(updatedCart);
    } catch (err) {
      console.error('Failed to update cart item quantity:', err);
      showToast("Stock Alert", err.message || "Could not update item quantity.");
      if (cachedCartResponse) {
        renderCart(cachedCartResponse);
      }
    }
  };

  window.removeBackendCartItem = async function(cartItemId, productName = 'Item') {
    const numericItemId = parseInt(cartItemId, 10);
    if (!numericItemId) return;

    try {
      const deleteFn = typeof deleteCartItem === 'function' ? deleteCartItem : (typeof window !== 'undefined' && typeof window.deleteCartItem === 'function' ? window.deleteCartItem : (id) => apiDelete(`/cart/items/${id}`));
      const updatedCart = await deleteFn(numericItemId);
      cachedCartResponse = updatedCart;
      updateCartCountBadge(updatedCart.itemCount);
      renderCart(updatedCart);
      showToast("Item Removed", `${productName} was removed from your cart.`);
    } catch (err) {
      console.error('Failed to remove cart item:', err);
      showToast("Remove Failed", err.message || "Could not remove item from cart.");
    }
  };

  // Backwards-compatible aliases
  window.updateItemQuantity = function(id, delta) {
    if (!cachedCartResponse || !cachedCartResponse.items) return;
    const numId = parseInt(id, 10);
    const item = cachedCartResponse.items.find(i => i.id === numId || i.productId === numId);
    if (!item) return;
    window.modifyCartItemQty(item.id, item.quantity + delta);
  };

  window.removeCartItem = function(id) {
    if (!cachedCartResponse || !cachedCartResponse.items) return;
    const numId = parseInt(id, 10);
    const item = cachedCartResponse.items.find(i => i.id === numId || i.productId === numId);
    if (!item) return;
    window.removeBackendCartItem(item.id, item.productName);
  };

  // Close checkout modal handler
  window.closeCheckoutModal = function(redirectToDashboard = false) {
    if (checkoutModal) checkoutModal.classList.remove('open');
    if (redirectToDashboard) {
      window.location.href = isInsidePages() ? 'dashboard.html' : 'pages/dashboard.html';
    } else {
      // Re-load and render cart: backend cart was emptied upon order placement
      loadAndRenderCart();
    }
  };

  // Refresh active catalog to ensure product details and conventional emissions are available
  if (typeof fetchProducts === 'function' || (typeof window !== 'undefined' && typeof window.fetchProducts === 'function')) {
    const fetchFn = typeof fetchProducts === 'function' ? fetchProducts : window.fetchProducts;
    fetchFn().then(products => {
      if (Array.isArray(products) && products.length > 0) {
        activeProducts = products.map(normalizeProduct);
        if (cachedCartResponse) {
          renderCart(cachedCartResponse);
        }
      }
    }).catch(() => {});
  }

  loadAndRenderCart();
}

// -----------------------------------------------------------------------------
// 10. Login Page (login.html)
// -----------------------------------------------------------------------------
function initLoginPage() {
  const form = document.getElementById('login-form');
  const alertEl = document.getElementById('login-alert');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    let hasError = false;

    // Basic frontend email validation
    const emailError = document.getElementById('email-error');
    if (!email || !email.includes('@') || !email.includes('.')) {
      if (emailError) emailError.classList.add('active');
      hasError = true;
    } else {
      if (emailError) emailError.classList.remove('active');
    }

    // Basic frontend password validation
    const passError = document.getElementById('password-error');
    if (!password || password.length < 6) {
      if (passError) passError.classList.add('active');
      hasError = true;
    } else {
      if (passError) passError.classList.remove('active');
    }

    if (hasError) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Sign In';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
    }

    // Reset previous alert
    if (alertEl) {
      alertEl.className = 'auth-alert';
      alertEl.textContent = '';
      alertEl.style.display = 'none';
    }

    try {
      // Connect to Spring Boot backend: POST /api/auth/login
      const authResponse = await apiPost('/auth/login', { email, password });

      // Save verified JWT token and user profile via api.js session manager
      setToken(authResponse.token);
      setLoggedInUser({
        id: authResponse.id,
        fullName: authResponse.fullName,
        name: authResponse.fullName,
        email: authResponse.email,
        role: authResponse.role
      });

      if (alertEl) {
        alertEl.className = 'auth-alert success';
        alertEl.textContent = `Welcome back, ${authResponse.fullName}! Redirecting to Dashboard...`;
        alertEl.style.display = 'block';
      }

      updateNavigationAuthState();

      setTimeout(() => {
        window.location.href = isInsidePages() ? 'dashboard.html' : 'pages/dashboard.html';
      }, 1000);
    } catch (err) {
      if (alertEl) {
        alertEl.className = 'auth-alert error';
        alertEl.style.display = 'block';

        if (err.status === 401) {
          alertEl.textContent = 'Invalid email or password. Please verify your credentials.';
        } else if (err.isNetworkError) {
          alertEl.textContent = err.message;
        } else {
          alertEl.textContent = err.message || 'Login failed. Please check your credentials and try again.';
        }
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
}

// -----------------------------------------------------------------------------
// 11. Register Page (register.html)
// -----------------------------------------------------------------------------
function initRegisterPage() {
  const form = document.getElementById('register-form');
  const alertEl = document.getElementById('register-alert');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm');
    const termsCheck = document.getElementById('reg-terms');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const confirmPass = confirmInput ? confirmInput.value : '';

    let hasError = false;

    // Name check
    const nameError = document.getElementById('name-error');
    if (!name || name.length < 2) {
      if (nameError) nameError.classList.add('active');
      hasError = true;
    } else {
      if (nameError) nameError.classList.remove('active');
    }

    // Email check
    const emailError = document.getElementById('email-error');
    if (!email || !email.includes('@') || !email.includes('.')) {
      if (emailError) emailError.classList.add('active');
      hasError = true;
    } else {
      if (emailError) emailError.classList.remove('active');
    }

    // Password length check
    const passError = document.getElementById('password-error');
    if (!password || password.length < 6) {
      if (passError) passError.classList.add('active');
      hasError = true;
    } else {
      if (passError) passError.classList.remove('active');
    }

    // Confirm password match check
    const confirmError = document.getElementById('confirm-error');
    if (password !== confirmPass) {
      if (confirmError) confirmError.classList.add('active');
      hasError = true;
    } else {
      if (confirmError) confirmError.classList.remove('active');
    }

    // Terms checkbox check
    const termsError = document.getElementById('terms-error');
    if (termsCheck && !termsCheck.checked) {
      if (termsError) termsError.classList.add('active');
      hasError = true;
    } else {
      if (termsError) termsError.classList.remove('active');
    }

    if (hasError) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Create Account';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';
    }

    // Reset previous alert
    if (alertEl) {
      alertEl.className = 'auth-alert';
      alertEl.textContent = '';
      alertEl.style.display = 'none';
    }

    try {
      // Connect to Spring Boot backend: POST /api/auth/register
      const response = await apiPost('/auth/register', {
        fullName: name,
        email: email,
        password: password
      });

      if (alertEl) {
        alertEl.className = 'auth-alert success';
        alertEl.textContent = `Account created successfully for ${response.fullName}! Redirecting to login...`;
        alertEl.style.display = 'block';
      }

      form.reset();

      setTimeout(() => {
        window.location.href = isInsidePages() ? 'login.html' : 'pages/login.html';
      }, 1500);
    } catch (err) {
      if (alertEl) {
        alertEl.className = 'auth-alert error';
        alertEl.style.display = 'block';

        if (err.errors && typeof err.errors === 'object') {
          const fieldMsgs = Object.values(err.errors).join('. ');
          alertEl.textContent = fieldMsgs || err.message;
        } else if (err.isNetworkError) {
          alertEl.textContent = err.message;
        } else {
          alertEl.textContent = err.message || 'Registration failed. Please try again.';
        }
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
}

// -----------------------------------------------------------------------------
// 12. Dashboard Page (dashboard.html)
// -----------------------------------------------------------------------------
async function initDashboardPage() {
  const container = document.getElementById('dashboard-view');
  if (!container) return;

  const loginPath = isInsidePages() ? 'login.html' : 'pages/login.html';
  const registerPath = isInsidePages() ? 'register.html' : 'pages/register.html';
  const productsPath = isInsidePages() ? 'products.html' : 'pages/products.html';

  // 1. Authentication Check
  const authenticated = typeof isLoggedIn === 'function' ? isLoggedIn() : (typeof window !== 'undefined' && typeof window.isLoggedIn === 'function' && window.isLoggedIn());
  const user = typeof getLoggedInUser === 'function' ? getLoggedInUser() : (typeof window !== 'undefined' && typeof window.getLoggedInUser === 'function' ? window.getLoggedInUser() : null);

  if (!authenticated || !user) {
    container.innerHTML = `
      <div class="empty-cart-box" style="padding: 4rem 1rem; text-align: center;">
        <svg class="empty-cart-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        <h3 style="color: var(--color-primary-dark); font-size: 1.4rem; margin-bottom: 0.5rem;">Sign In to Access Your Dashboard</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 440px; margin-left: auto; margin-right: auto;">
          Please sign in to your EcoBazaar account to view your verified orders, itemized carbon footprints, and sustainability profile.
        </p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <a href="${loginPath}" class="btn-primary">Sign In to Your Account</a>
          <a href="${registerPath}" class="btn-secondary">Create Free Account</a>
        </div>
      </div>
    `;
    return;
  }

  // 2. Loading State
  container.innerHTML = `
    <div class="catalog-loading" style="padding: 4rem 1rem; text-align: center;">
      <div class="spinner"></div>
      <p style="margin-top: 1rem; color: var(--color-text-muted);">Loading your sustainability dashboard and orders...</p>
    </div>
  `;

  // 3. Fetch Real Orders from Backend
  let orders = [];
  try {
    const fetchOrdersFn = typeof fetchOrders === 'function' ? fetchOrders : (typeof window !== 'undefined' && typeof window.fetchOrders === 'function' ? window.fetchOrders : () => apiGet('/orders'));
    orders = await fetchOrdersFn();
    if (!Array.isArray(orders)) {
      orders = [];
    }
  } catch (err) {
    console.error('Failed to fetch dashboard orders:', err);
    if (err.status === 401) {
      if (typeof logout === 'function') logout();
      container.innerHTML = `
        <div class="empty-cart-box" style="padding: 4rem 1rem; text-align: center;">
          <svg class="empty-cart-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 style="color: var(--color-primary-dark); font-size: 1.4rem; margin-bottom: 0.5rem;">Session Expired</h3>
          <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 440px; margin-left: auto; margin-right: auto;">
            Your login session has expired. Please sign in again to view your dashboard.
          </p>
          <a href="${loginPath}" class="btn-primary">Sign In Again</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="empty-cart-box" style="padding: 3.5rem 1rem; text-align: center;">
        <svg class="empty-cart-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="color: #b91c1c;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 style="color: var(--color-primary-dark); font-size: 1.4rem; margin-bottom: 0.5rem;">Unable to Load Orders</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 1.5rem; max-width: 440px; margin-left: auto; margin-right: auto;">
          ${escapeHtml(err.message || 'Could not connect to the backend server to retrieve your order history.')}
        </p>
        <button type="button" class="btn-primary" onclick="initDashboardPage()">Retry Loading</button>
      </div>
    `;
    return;
  }

  // 4. Compute Metrics strictly from actual backend data
  const totalOrdersCount = orders.length;
  let totalSpend = 0;
  let totalCarbonKg = 0;
  let totalItemsCount = 0;

  orders.forEach(o => {
    totalSpend += Number(o.totalAmount || 0);
    totalCarbonKg += Number(o.totalCarbonKg || 0);
    if (Array.isArray(o.items)) {
      o.items.forEach(i => {
        totalItemsCount += Number(i.quantity || 0);
      });
    }
  });

  const displayName = escapeHtml((user.fullName || user.name || "Customer").trim());
  const displayEmail = escapeHtml(user.email || "");
  const isAdmin = user.role === 'ADMIN';
  const displayTier = isAdmin 
    ? 'Platform Administrator 🛡️' 
    : (totalOrdersCount > 0 ? 'Eco Champion 🌱' : 'Eco Pioneer 🌱');

  // Avatar initials
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'EB';

  // 5. Render Orders Table or Empty State
  let ordersContentHtml = '';

  if (orders.length === 0) {
    ordersContentHtml = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <svg class="empty-cart-icon" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--color-text-muted);">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h4 style="color: var(--color-primary-dark); font-size: 1.15rem; margin-bottom: 0.35rem;">No Orders Placed Yet</h4>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; max-width: 400px; margin: 0 auto 1.25rem;">
          You haven't placed any sustainable orders yet. Explore our eco-friendly catalog and start tracking your carbon footprint!
        </p>
        <a href="${productsPath}" class="btn-primary">Browse Sustainable Catalog</a>
      </div>
    `;
  } else {
    let rowsHtml = '';
    orders.forEach(order => {
      // Date formatting
      let formattedDate = '—';
      if (order.createdAt) {
        try {
          const d = new Date(order.createdAt);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
          }
        } catch (e) {
          formattedDate = String(order.createdAt).substring(0, 10);
        }
      }

      // Items summary
      let itemsSummary = '—';
      if (Array.isArray(order.items) && order.items.length > 0) {
        itemsSummary = order.items
          .map(i => `${escapeHtml(i.productName || 'Product')} (x${i.quantity})`)
          .join(', ');
      }

      // Status pill formatting
      const rawStatus = (order.status || 'PLACED').toUpperCase();
      let statusClass = 'placed';
      let statusLabel = 'Placed';

      switch (rawStatus) {
        case 'PLACED':
          statusClass = 'placed';
          statusLabel = 'Placed';
          break;
        case 'CONFIRMED':
          statusClass = 'confirmed';
          statusLabel = 'Confirmed';
          break;
        case 'SHIPPED':
          statusClass = 'shipped';
          statusLabel = 'Shipped (Zero Plastic)';
          break;
        case 'DELIVERED':
          statusClass = 'delivered';
          statusLabel = 'Delivered (Zero Plastic)';
          break;
        case 'CANCELLED':
          statusClass = 'cancelled';
          statusLabel = 'Cancelled';
          break;
        default:
          statusClass = 'placed';
          statusLabel = rawStatus;
      }

      const orderRef = escapeHtml(order.orderNumber || String(order.id));
      const orderAmount = Number(order.totalAmount || 0).toLocaleString('en-IN');
      const orderCarbon = Number(order.totalCarbonKg || 0).toFixed(2);

      rowsHtml += `
        <tr>
          <td>
            <strong>#${orderRef}</strong>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: normal;">ID: #${order.id}</div>
          </td>
          <td>${formattedDate}</td>
          <td style="max-width: 240px; word-break: break-word;">${itemsSummary}</td>
          <td><span style="color: var(--color-leaf); font-weight: 700;">🌱 ${orderCarbon} kg CO2e</span></td>
          <td><strong>₹${orderAmount}</strong></td>
          <td><span class="order-status-pill ${statusClass}">${statusLabel}</span></td>
        </tr>
      `;
    });

    ordersContentHtml = `
      <div style="overflow-x: auto;">
        <table class="order-table">
          <thead>
            <tr>
              <th>Order Reference</th>
              <th>Date</th>
              <th>Items</th>
              <th>Carbon Footprint</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  // 6. Complete Dashboard Markup
  container.innerHTML = `
    <!-- User Welcome Banner -->
    <div class="dashboard-user-card">
      <div class="user-profile-info">
        <div class="user-avatar-circle">${initials}</div>
        <div class="user-meta">
          <h2>Welcome back, ${displayName}!</h2>
          <p>${displayEmail} • Role: <strong>${escapeHtml(user.role || 'CUSTOMER')}</strong></p>
          <span class="user-tier-badge">${displayTier}</span>
          ${isAdmin ? `<span style="font-size: 0.75rem; background: rgba(255,255,255,0.25); color: #fff; padding: 0.2rem 0.6rem; border-radius: 4px; margin-left: 0.5rem;">Admin View (All Platform Orders)</span>` : ''}
        </div>
      </div>
      <div>
        <button type="button" class="btn-secondary" id="logout-btn" style="background: rgba(255,255,255,0.15); color: #fff; border-color: rgba(255,255,255,0.3);">
          Log Out
        </button>
      </div>
    </div>

    <!-- Sustainability Impact Metrics Grid (Computed strictly from live orders) -->
    <div class="impact-stats-grid">
      <div class="impact-stat-card">
        <div class="impact-stat-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.75C7 7.35 5.5 8.7 4 10.5c3.5-1 7.5-1.5 13-2.5z"/>
          </svg>
        </div>
        <div>
          <div class="impact-stat-val">${totalCarbonKg.toFixed(2)} kg</div>
          <div class="impact-stat-label">Lifetime CO2e Tracked</div>
        </div>
      </div>

      <div class="impact-stat-card">
        <div class="impact-stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div>
          <div class="impact-stat-val">₹${totalSpend.toLocaleString('en-IN')}</div>
          <div class="impact-stat-label">Total Sustainable Spend</div>
        </div>
      </div>

      <div class="impact-stat-card">
        <div class="impact-stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
        <div>
          <div class="impact-stat-val">${totalOrdersCount} ${totalOrdersCount === 1 ? 'order' : 'orders'}</div>
          <div class="impact-stat-label">Total Orders Placed</div>
        </div>
      </div>

      <div class="impact-stat-card">
        <div class="impact-stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
          </svg>
        </div>
        <div>
          <div class="impact-stat-val">${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'}</div>
          <div class="impact-stat-label">Total Eco Items Purchased</div>
        </div>
      </div>
    </div>

    <!-- Orders Section -->
    <div class="dashboard-card">
      <div class="dashboard-card-title">
        <span>${isAdmin ? 'All Platform Customer Orders' : 'Your Order History'} (${totalOrdersCount})</span>
        <a href="${productsPath}" class="btn-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Shop Catalog</a>
      </div>

      ${ordersContentHtml}
    </div>
  `;

  // 7. Bind Working Logout Button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (typeof logout === 'function') {
        logout();
      } else {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        window.dispatchEvent(new CustomEvent('ecobazaar:auth-changed'));
      }
      showToast("Logged Out", "You have successfully logged out of EcoBazaar.");
      setTimeout(() => {
        window.location.href = loginPath;
      }, 900);
    });
  }
}

// -----------------------------------------------------------------------------
// 13. DOM Ready Dispatcher
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Update cart badge across all pages
  updateCartCountBadge();
  refreshCartBadge();

  // Setup header mobile menu & footer newsletter
  setupMobileNavigation();
  setupNewsletter();

  // Dynamic navigation authentication state
  updateNavigationAuthState();

  // Listen for authentication state changes across the app
  window.addEventListener('ecobazaar:auth-changed', () => {
    updateNavigationAuthState();
    refreshCartBadge();
    if (document.getElementById('cart-items-container')) {
      initCartPage();
    }
    if (document.getElementById('dashboard-view')) {
      initDashboardPage();
    }
  });

  // Route to page-specific initializers based on element presence
  if (document.getElementById('products-grid')) initHomePage();
  if (document.getElementById('catalog-grid')) initCatalogPage();
  if (document.getElementById('product-detail-container')) initDetailPage();
  if (document.getElementById('cart-items-container')) initCartPage();
  if (document.getElementById('login-form')) initLoginPage();
  if (document.getElementById('register-form')) initRegisterPage();
  if (document.getElementById('dashboard-view')) initDashboardPage();
});

// Expose page initializers on window
window.initHomePage = initHomePage;
window.initCatalogPage = initCatalogPage;
window.initDetailPage = initDetailPage;
window.initCartPage = initCartPage;
window.initLoginPage = initLoginPage;
window.initRegisterPage = initRegisterPage;
window.initDashboardPage = initDashboardPage;
