-- Додавання користувачів (з оновленою структурою)
INSERT INTO users (first_name, last_name, phone_number, email, password_hash, avatar_url, role) VALUES
('Адміністратор', 'Сайту', '+380501234567', 'admin@example.com', '$2a$12$1234567890abcdefghijkl', 'https://example.com/avatars/admin.jpg', 'admin'),
('Іван', 'Петренко', '+380671234567', 'ivan@example.com', '$2a$12$abcdefghijkl1234567890', 'https://example.com/avatars/ivan.jpg', 'customer'),
('Марія', 'Коваленко', '+380931234567', 'maria@example.com', '$2a$12$qwertyuiopasdfghjklzxc', 'https://example.com/avatars/maria.jpg', 'customer'),
('Олена', 'Сидоренко', '+380661234567', 'olena@example.com', '$2a$12$zxcvbnmasdfghjklqwerty', 'https://example.com/avatars/olena.jpg', 'customer'),
('Петро', 'Мельник', '+380951234567', 'petro@example.com', '$2a$12$asdfghjklqwertyuiopzxc', 'https://example.com/avatars/petro.jpg', 'customer');

-- Додавання брендів
INSERT INTO brands (name) VALUES
('Nike'),
('Adidas'),
('Puma'),
('New Balance'),
('Under Armour'),
('Reebok'),
('Fila'),
('Champion'),
('Columbia'),
('The North Face');

-- Додавання категорій
INSERT INTO categories (name, description) VALUES
('Взуття', 'Різноманітне взуття для спорту та повсякденного життя'),
('Одяг', 'Модний та зручний одяг для чоловіків, жінок та дітей'),
('Аксесуари', 'Сумки, рюкзаки, головні убори та інші аксесуари'),
('Спортивне обладнання', 'Інвентар для спорту та фітнесу'),
('Верхній одяг', 'Куртки, плащі, пальто для будь-якої погоди');

-- Додавання кольорів
INSERT INTO colors (name, hex_code) VALUES
('Чорний', '#000000'),
('Білий', '#FFFFFF'),
('Червоний', '#FF0000'),
('Синій', '#0000FF'),
('Зелений', '#00FF00'),
('Сірий', '#808080'),
('Жовтий', '#FFFF00'),
('Фіолетовий', '#800080'),
('Помаранчевий', '#FFA500'),
('Рожевий', '#FFC0CB');

-- Додавання розмірів
INSERT INTO sizes (size) VALUES
('XS'),
('S'),
('M'),
('L'),
('XL'),
('XXL'),
('36'),
('38'),
('40'),
('42'),
('44'),
('46'),
('48'),
('50'),
('52');

-- Додавання тегів
INSERT INTO tags (name) VALUES
('Новинка'),
('Бестселер'),
('Знижка'),
('Обмежена серія'),
('Спорт'),
('Вечірка'),
('Повсякденне'),
('Туризм'),
('Біг'),
('Фітнес');

-- Додавання знижок
INSERT INTO discounts (name, description, discount_percentage, start_date, end_date, is_active) VALUES
('Весняна знижка', 'Знижка до початку весняного сезону', 15.00, '2025-03-01 00:00:00', '2025-03-31 23:59:59', true),
('Чорна п''ятниця', 'Спеціальні пропозиції до Чорної п''ятниці', 25.00, '2025-11-27 00:00:00', '2025-11-30 23:59:59', false),
('Літній розпродаж', 'Знижки на літню колекцію', 20.00, '2025-06-01 00:00:00', '2025-06-30 23:59:59', true),
('Зимова акція', 'Розпродаж зимового одягу', 30.00, '2025-12-01 00:00:00', '2025-12-31 23:59:59', true);

-- Додавання продуктів
INSERT INTO products (name, description, price, stock, sales_count) VALUES
('Кросівки Nike Air Max 90', 'Класичні кросівки з амортизуючою подушкою Air', 3499.99, 100, 42),
('Футболка Adidas Originals', 'Стильна футболка з логотипом Adidas', 899.99, 150, 78),
('Спортивні штани Puma', 'Зручні штани для занять спортом і відпочинку', 1299.99, 80, 35),
('Кепка New Balance', 'Спортивна кепка з логотипом New Balance', 499.99, 120, 53),
('Спортивна сумка Under Armour', 'Місткий та стильна сумка для спортзалу', 1199.99, 60, 21),
('Кросівки Reebok Classic Leather', 'Шкіряні кросівки в класичному стилі', 2999.99, 90, 65),
('Худі Champion Reverse Weave', 'Тепле худі з капюшоном', 1799.99, 110, 82),
('Куртка Columbia Watertight II', 'Водонепроникна куртка для активного відпочинку', 3999.99, 70, 48),
('Шорти Nike Dri-FIT', 'Легкі шорти для тренувань', 799.99, 130, 91),
('Легінси Adidas Designed 2 Move', 'Комфортні легінси для йоги та фітнесу', 1199.99, 100, 73),
('Рюкзак The North Face Borealis', 'Місткий рюкзак для міста та подорожей', 2499.99, 50, 39),
('Кросівки Fila Disruptor II', 'Масивні кросівки в стилі 90-х', 2799.99, 85, 57),
('Спортивний костюм Adidas', 'Зручний спортивний костюм для повсякденного носіння', 3599.99, 95, 68),
('Вітровка Nike', 'Легка вітровка для захисту від вітру', 1999.99, 105, 75),
('Годинник Casio G-Shock', 'Надійний годинник для екстремальних умов', 4499.99, 45, 28),
('Кеди Converse Chuck Taylor All Star', 'Класичні кеди для будь-якого образу', 1699.99, 140, 102),
('Шкарпетки Nike Everyday Plus', 'Зручні шкарпетки для щоденного використання', 299.99, 200, 155),
('Поло Lacoste', 'Елегантне поло з бавовни', 2299.99, 75, 51),
('Джинси Levi''s 501', 'Класичні джинси прямого крою', 2799.99, 88, 63),
('Світшот Tommy Hilfiger', 'Стильний світшот з логотипом', 2599.99, 65, 44),
('Пальто Mango', 'Елегантне жіноче пальто', 5999.99, 35, 19),
('Туфлі Ecco', 'Комфортні шкіряні туфлі', 4999.99, 55, 32),
('Плащ Burberry', 'Розкішний плащ для особливих випадків', 12999.99, 15, 8),
('Спідниця Zara', 'Модна спідниця для створення образу', 999.99, 115, 87),
('Блузка H&M', 'Легка блузка для літнього гардеробу', 699.99, 160, 123);

-- Зв'язок продуктів з брендами
INSERT INTO product_brands (product_id, brand_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 8), (8, 9), (9, 1), (10, 2),
(11, 10), (12, 7), (13, 2), (14, 1), (15, 1), (16, 6), (17, 1), (18, 1), (19, 1), (20, 1),
(21, 1), (22, 1), (23, 1), (24, 1), (25,1);

-- Зв'язок продуктів з категоріями
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1), (2, 2), (3, 2), (4, 3), (5, 3), (6, 1), (7, 2), (8, 5), (9, 2), (10, 2),
(11, 3), (12, 1), (13, 2), (14, 5), (15, 3), (16, 1), (17, 3), (18, 2), (19, 2), (20, 2),
(21, 5), (22, 1), (23, 5), (24, 2), (25,2);

-- Зв'язок продуктів з кольорами
INSERT INTO product_colors (product_id, color_id) VALUES
(1, 1), (1, 2), (2, 3), (2, 4), (3, 1), (3, 6), (4, 1), (4, 3), (5, 1), (6, 2),
(7, 1), (8, 4), (9, 1), (10, 1), (11, 1), (12, 2), (13, 4), (14, 2), (15, 1), (16, 2),
(17, 2), (18, 3), (19, 4), (20, 5), (21,6),(22,7),(23,8),(24,9),(25,10);

-- Зв'язок продуктів з розмірами
INSERT INTO product_sizes (product_id, size_id) VALUES
(1, 7), (1, 8), (1, 9), (2, 3), (2, 4), (2, 5), (3, 3), (3, 4), (3, 5), (4, 1),
(5, 1), (6, 7), (6, 8), (7, 3), (7, 4), (8, 4), (8, 5), (9, 2), (9, 3), (10, 2),
(10, 3), (11, 1), (12, 7), (12, 8), (13, 4), (14, 2), (15,1),(16,2),(17,3),(18,4),(19,5),
(20,6),(21,7),(22,8),(23,9),(24,10),(25,11);

-- Зв'язок продуктів з тегами
INSERT INTO product_tags (product_id, tag_id) VALUES
(1, 1), (1, 5), (2, 2), (2, 7), (3, 5), (4, 7), (5, 1), (5, 5), (6, 1), (7, 2),
(8, 8), (9, 5), (10, 5), (11, 8), (12, 4), (13, 7), (14, 4), (15, 6), (16, 7),
(17,1),(18,2),(19,3),(20,4),(21,5),(22,6),(23,7),(24,8),(25,9);

-- Додавання фото продуктів
INSERT INTO product_photos (product_id, photo_url, position) VALUES
(1, 'https://example.com/photos/nike-air-max-90-1.jpg', 0),
(1, 'https://example.com/photos/nike-air-max-90-2.jpg', 1),
(1, 'https://example.com/photos/nike-air-max-90-3.jpg', 2),
(2, 'https://example.com/photos/adidas-tshirt-1.jpg', 0),
(2, 'https://example.com/photos/adidas-tshirt-2.jpg', 1),
(3, 'https://example.com/photos/puma-pants-1.jpg', 0),
(4, 'https://example.com/photos/nb-cap-1.jpg', 0),
(5, 'https://example.com/photos/ua-bag-1.jpg', 0),
(5, 'https://example.com/photos/ua-bag-2.jpg', 1),
(6, 'https://example.com/photos/reebok-classic-1.jpg', 0),
(7, 'https://example.com/photos/champion-hoodie-1.jpg', 0),
(8, 'https://example.com/photos/columbia-jacket-1.jpg', 0),
(9, 'https://example.com/photos/nike-shorts-1.jpg', 0),
(10, 'https://example.com/photos/adidas-leggings-1.jpg', 0),
(11, 'https://example.com/photos/tnf-borealis-1.jpg', 0),
(12, 'https://example.com/photos/fila-disruptor-1.jpg', 0),
(13, 'https://example.com/photos/adidas-tracksuit-1.jpg', 0),
(14, 'https://example.com/photos/nike-windbreaker-1.jpg', 0),
(15, 'https://example.com/photos/casio-gshock-1.jpg', 0),
(16, 'https://example.com/photos/converse-chuck-1.jpg', 0),
(17, 'https://example.com/photos/nike-socks-1.jpg', 0),
(18, 'https://example.com/photos/lacoste-polo-1.jpg', 0),
(19, 'https://example.com/photos/levis-501-1.jpg', 0),
(20, 'https://example.com/photos/tommy-hilfiger-1.jpg', 0),
(21, 'https://example.com/photos/mango-coat-1.jpg', 0),
(22, 'https://example.com/photos/ecco-shoes-1.jpg', 0),
(23, 'https://example.com/photos/burberry-coat-1.jpg', 0),
(24, 'https://example.com/photos/zara-skirt-1.jpg', 0),
(25, 'https://example.com/photos/hm-blouse-1.jpg', 0);

-- Додавання знижок на продукти
INSERT INTO product_discounts (product_id, discount_id) VALUES
(1, 1), (3, 1), (5, 1), (2, 3), (4, 3), (6, 4), (8, 4), (10, 4);

-- Додавання товарів у кошик користувачів
INSERT INTO cart (user_id, product_id, quantity) VALUES
(2, 1, 1), (2, 3, 2), (3, 2, 1), (3, 4, 1), (4, 5, 1), (4, 7, 2), (5, 9, 1), (5, 11, 1);

-- Додавання товарів до улюблених
INSERT INTO favorites (user_id, product_id) VALUES
(2, 5), (3, 1), (3, 3), (4, 2), (4, 6), (5, 8), (5, 10);
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