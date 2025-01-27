-- Функція для оновлення поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Таблиця users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT DEFAULT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Тригер для оновлення updated_at в таблиці users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Таблиця products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock INT DEFAULT 0 CHECK (stock >= 0),
    sales_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Таблиця для зв'язку продуктів з категоріями
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(product_id, category_id)
);
CREATE TABLE product_discounts (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    discount_id INT NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
     UNIQUE(product_id, discount_id)
);

-- Тригер для оновлення updated_at в таблиці products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Таблиця product_photos
CREATE TABLE product_photos (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    position INT DEFAULT 0 CHECK (position >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця cart
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    UNIQUE(user_id, product_id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця favorites
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES prod ucts(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Тригер для оновлення updated_at в таблиці categories
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- Таблиця discounts
CREATE TABLE discounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Тригер для оновлення updated_at в таблиці discounts
CREATE TRIGGER update_discounts_updated_at
BEFORE UPDATE ON discounts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Таблиця sizes
CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    size VARCHAR(10) UNIQUE NOT NULL
);

-- Таблиця colors
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    hex_code VARCHAR(7) UNIQUE NOT NULL
);

-- Створення функції перевірки HEX-коду
CREATE OR REPLACE FUNCTION validate_hex_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT NEW.hex_code ~ '^#[0-9A-Fa-f]{6}$' THEN
        RAISE EXCEPTION 'Invalid HEX code: %', NEW.hex_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Створення тригера для виклику функції
CREATE TRIGGER check_hex_code_trigger
BEFORE INSERT OR UPDATE ON colors
FOR EACH ROW
EXECUTE FUNCTION validate_hex_code();

-- Таблиця product_sizes
CREATE TABLE product_sizes (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_id INT NOT NULL REFERENCES sizes(id) ON DELETE CASCADE,
    UNIQUE(product_id, size_id)
);

-- Таблиця product_colors
CREATE TABLE product_colors (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_id INT NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
    UNIQUE(product_id, color_id)
);

-- Таблиця brands
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Таблиця product_brands
CREATE TABLE product_brands (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    brand_id INT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    UNIQUE(product_id, brand_id)
);

-- Таблиця tags
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Таблиця product_tags
CREATE TABLE product_tags (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(product_id, tag_id)
);