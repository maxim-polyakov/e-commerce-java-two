-- This file allows us to load static data into the test database before tests are run.

-- Passwords are in the format: Password<UserLetter>123. Unless specified otherwise.
-- Encrypted using https://www.javainuse.com/onlineBcrypt
INSERT INTO local_user (email, first_name, last_name, password, username, email_verified, role)
    VALUES ('UserA@junit.com', 'UserA-FirstName', 'UserA-LastName', '$2a$10$hBn5gu6cGelJNiE6DDsaBOmZgyumCSzVwrOK/37FWgJ6aLIdZSSI2', 'UserA', true, 'USER')
    , ('UserB@junit.com', 'UserB-FirstName', 'UserB-LastName', '$2a$10$TlYbg57fqOy/1LJjispkjuSIvFJXbh3fy0J9fvHnCpuntZOITAjVG', 'UserB', false, 'USER')
    , ('UserC@junit.com', 'UserC-FirstName', 'UserC-LastName', '$2a$10$SYiYAIW80gDh39jwSaPyiuKGuhrLi7xTUjocL..NOx/1COWe5P03.', 'UserC', false, 'USER');

INSERT INTO address(address_line, city, country, user_id)
    VALUES ('123 Tester Hill', 'Testerton', 'England', 1)
    , ('312 Spring Boot', 'Hibernate', 'England', 3);

INSERT INTO product (name, short_description, long_description, price, raiting, image, deleted)
    VALUES ('Product #1', 'Product one short description.', 'This is a very long description of product #1.', 5.50, 0.0, '/images/test-product-1.png', false)
    , ('Product #2', 'Product two short description.', 'This is a very long description of product #2.', 10.56, 0.0, '/images/test-product-2.png', false)
    , ('Product #3', 'Product three short description.', 'This is a very long description of product #3.', 2.74, 0.0, '/images/test-product-3.png', false)
    , ('Product #4', 'Product four short description.', 'This is a very long description of product #4.', 15.69, 0.0, '/images/test-product-4.png', false)
    , ('Product #5', 'Product five short description.', 'This is a very long description of product #5.', 42.59, 0.0, '/images/test-product-5.png', false);

INSERT INTO inventory (product_id, quantity, deleted)
    VALUES (1, 5, false)
    , (2, 8, false)
    , (3, 12, false)
    , (4, 73, false)
    , (5, 2, false);

INSERT INTO web_order (address_id, user_id)
    VALUES (1, 1)
    , (1, 1)
    , (1, 1)
    , (2, 3)
    , (2, 3);

INSERT INTO web_order_quantities (order_id, product_id, quantity)
    VALUES (1, 1, 5)
    , (1, 2, 5)
    , (2, 3, 5)
    , (2, 2, 5)
    , (2, 5, 5)
    , (3, 3, 5)
    , (4, 4, 5)
    , (4, 2, 5)
    , (5, 3, 5)
    , (5, 1, 5);