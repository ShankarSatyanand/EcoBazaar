-- =============================================================================
-- EcoBazaar: Carbon-Aware Smart Shopping Platform
-- Database Seed Script: 10 Sustainable Products
-- Target Database: ecobazaar
-- Table: products
-- =============================================================================

USE ecobazaar;

-- Insert 10 realistic eco-friendly products.
-- Uses ON DUPLICATE KEY UPDATE so executing this script multiple times
-- updates existing records rather than creating duplicate rows.
INSERT INTO products (id, name, description, price, category, image_url, carbon_footprint, stock_quantity, eco_friendly)
VALUES
(
    1,
    'Bamboo Charcoal Toothbrush (Set of 4)',
    'Sustainably harvested bamboo handle with natural activated charcoal bristles. Plastic-free biodegradable packaging.',
    349.00,
    'personal-care',
    'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80',
    0.15,
    120,
    true
),
(
    2,
    'Organic Cotton Canvas Market Tote',
    'Heavy-duty unbleached organic cotton tote bag designed to replace over 500 single-use shopping bags.',
    499.00,
    'fashion',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    0.28,
    85,
    true
),
(
    3,
    'Solar-Powered Portable Charger (10,000mAh)',
    'High-efficiency monocrystalline solar panels with dual USB fast-charge outputs and rugged recycled casing.',
    1899.00,
    'tech',
    'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=80',
    1.35,
    45,
    true
),
(
    4,
    'Zero-Waste Solid Shampoo Bar',
    'Infused with cold-pressed coconut and argan oils. Equal to 3 bottles of liquid shampoo with zero plastic bottle waste.',
    399.00,
    'personal-care',
    'https://images.unsplash.com/photo-1608248597359-28197ff76ef2?auto=format&fit=crop&w=600&q=80',
    0.12,
    150,
    true
),
(
    5,
    'Recycled Ocean Plastic Sunglasses',
    'UV400 polarized lenses set in frames crafted from 100% recovered ocean ghost fishing nets.',
    1299.00,
    'fashion',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    0.58,
    60,
    true
),
(
    6,
    'Plant-Based Compostable Phone Case',
    'Shock-absorbing smartphone protection made from wheat straw and plant biopolymers. Fully compostable.',
    699.00,
    'tech',
    'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80',
    0.22,
    110,
    true
),
(
    7,
    'Handcrafted Jute Storage Basket',
    'Woven by local artisan cooperatives using naturally rain-fed golden jute fibers. Zero synthetic dyes.',
    799.00,
    'lifestyle',
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
    0.45,
    75,
    true
),
(
    8,
    'Stainless Steel Insulated Thermal Flask (750ml)',
    'Double-wall vacuum insulation keeps drinks cold for 24h or hot for 12h. Crafted from food-grade stainless steel.',
    899.00,
    'lifestyle',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    0.72,
    95,
    true
),
(
    9,
    'Solar Garden Lantern with Warm LED',
    'Weatherproof solar outdoor lantern with auto dusk-to-dawn sensor and hand-blown recycled glass housing.',
    1499.00,
    'tech',
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
    0.95,
    50,
    true
),
(
    10,
    'Hammered Pure Copper Water Bottle (1L)',
    'Traditional hammered Ayurvedic copper vessel that naturally alkalizes water and replaces single-use plastic bottles.',
    1199.00,
    'lifestyle',
    'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=600&q=80',
    0.85,
    65,
    true
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    price = VALUES(price),
    category = VALUES(category),
    image_url = VALUES(image_url),
    carbon_footprint = VALUES(carbon_footprint),
    stock_quantity = VALUES(stock_quantity),
    eco_friendly = VALUES(eco_friendly);
