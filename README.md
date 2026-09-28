# EcoBazaar — Carbon-Aware Smart Shopping Platform

EcoBazaar is a B.Tech academic project demonstrating a sustainable e-commerce web platform. It helps consumers evaluate the environmental impact of everyday purchases by displaying estimated lifecycle carbon emissions (**kg CO2e**) alongside prices in Indian Rupees (**₹**).

---

## 🎓 Project Highlights

- **Student-Built Architecture**: Built using clean, understandable, and standard HTML5, CSS3, and Vanilla JavaScript.
- **Academic Focus**: Demonstrates frontend component design, client-side state persistence with `localStorage`, and real-time carbon calculation logic without relying on third-party frameworks.
- **Unified Aesthetic**: Simple, clean styling with a forest green and warm cream palette.
- **Clean Navigation Order**: `Home` → `Products` → `Dashboard` → `Cart` → `Login` → `Register` on all pages with clear cart item counting.

---

## 🌿 Technology Stack

- **Frontend**: HTML5, CSS3, Plain JavaScript (No React, Angular, Vue, TypeScript, Bootstrap, or Tailwind)
- **Client-Side State**: Browser `localStorage` for cart persistence and simulated user sessions
- **Backend (Future Phase)**: Java Spring Boot
- **Database (Future Phase)**: MySQL

---

## 📁 Project Directory Structure

```text
EcoBazaar/
├── backend/                      # Reserved for future Java Spring Boot backend
├── database/                     # Reserved for future MySQL database scripts & migrations
├── frontend/                     # Client-side web application
│   ├── css/
│   │   └── style.css             # Clean, responsive CSS with forest green & cream palette
│   ├── js/
│   │   └── main.js               # Vanilla JavaScript for catalog, cart math, and simulated auth
│   ├── pages/                    # Subpages
│   │   ├── login.html            # User login with validation
│   │   ├── register.html         # User registration with validation
│   │   ├── products.html         # Catalog with search, category filtering & sorting
│   │   ├── product-details.html  # Product details with lifecycle carbon breakdown
│   │   ├── cart.html             # Cart with quantity modification & simulated checkout
│   │   └── dashboard.html        # User profile, sustainability summary & order history
│   └── index.html                # Project Homepage
└── README.md                     # Project documentation
```

---

## 🚀 Running and Testing the Platform Locally

Because EcoBazaar uses standard web technologies, you do not need any build tools or web servers to run it.

### Method 1: Direct File Launch (Easiest)
1. Navigate to the `frontend/` directory.
2. Double-click [`index.html`](frontend/index.html) to open the project in any web browser.

### Method 2: VS Code Live Server
1. Open the `EcoBazaar` folder in VS Code.
2. Right-click [`frontend/index.html`](frontend/index.html) and choose **"Open with Live Server"**.

### Method 3: Local HTTP Server (Node.js)
```powershell
# From project root:
npx serve frontend
```
Then visit `http://localhost:3000`.

---

## 🧪 Testing Features Across the 7 Pages

1. **Homepage (`index.html`)**:
   - Check the top navigation: **Home → Products → Dashboard → Cart → Login → Register**.
   - Browse the hero section, carbon emissions comparison box, project features, and featured products.
   - Click **"Add to Cart"** on any item; note the cart count badge immediately increments.
2. **Catalog Page (`pages/products.html`)**:
   - Search for products (e.g., "bamboo", "solar", "bag", "soap").
   - Filter by category using the filter pills (*Personal Care*, *Fashion*, *Tech*, *Lifestyle*).
   - Sort by *Price* or *Carbon Footprint (Lowest First)*.
3. **Product Details (`pages/product-details.html`)**:
   - Click any product to view its details (e.g. `?id=1` or `?id=3`).
   - Check the lifecycle emissions breakdown, sustainable materials, and quantity stepper.
4. **Shopping Cart (`pages/cart.html`)**:
   - View items saved in `localStorage`.
   - Use `+` and `−` to adjust item quantities; verify total price and total kg CO2e update automatically.
   - Click **"Proceed to Green Checkout"** to view the simulated zero-plastic checkout confirmation.
5. **Login & Register (`pages/login.html`, `pages/register.html`)**:
   - Test client-side validation for empty fields, invalid emails, and mismatched passwords.
   - Submitting sets mock user data and routes to the dashboard.
6. **Dashboard (`pages/dashboard.html`)**:
   - View mock user details, sustainability statistics (CO2e saved, spend, diverted plastic, trees planted), and past orders table.
   - Click **"Log Out"** to clear the session and return to the login screen.
