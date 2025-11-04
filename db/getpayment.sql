CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- User info
    fullname VARCHAR(150) NOT NULL,
    email VARCHAR(150) DEFAULT NULL,
    nin VARCHAR(50) DEFAULT NULL,
    mobile VARCHAR(50) DEFAULT NULL,
    gender VARCHAR(20) DEFAULT NULL,

    -- Payment info
    channel VARCHAR(50) DEFAULT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00,
    price DECIMAL(10,2) DEFAULT NULL,        -- ✅ lodge price
    reference VARCHAR(255) NOT NULL UNIQUE,
    order_id VARCHAR(255) DEFAULT NULL,
    paid_at DATETIME DEFAULT NULL,

    -- Lodge info
    lodge_title VARCHAR(255) DEFAULT NULL,
    lodge_location VARCHAR(255) DEFAULT NULL,
    amenities TEXT DEFAULT NULL,
    bathroomType VARCHAR(100) DEFAULT NULL,
    capacity VARCHAR(50) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    lodge_email VARCHAR(150) DEFAULT NULL,
    type VARCHAR(100) DEFAULT NULL,
    lodge_nin VARCHAR(50) DEFAULT NULL,

    -- Booking info
    startDate DATE DEFAULT NULL,
    endDate DATE DEFAULT NULL,
    nights INT DEFAULT 0,

    -- Image URLs
    image_first_url VARCHAR(255) DEFAULT NULL,
    image_second_url VARCHAR(255) DEFAULT NULL,
    image_third_url VARCHAR(255) DEFAULT NULL,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
