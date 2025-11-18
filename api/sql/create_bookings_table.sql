-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- use UNSIGNED to match common primary key definitions (adjust if your lodges.id is signed)
  lodge_id INT UNSIGNED NOT NULL,
  user_uid VARCHAR(255) DEFAULT NULL,
  payment_id INT UNSIGNED DEFAULT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  nights INT DEFAULT 0,
  status ENUM('booked','cancelled','pending','conflict') DEFAULT 'booked',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(lodge_id),
  INDEX(payment_id),
  -- foreign key: ensure lodges.id is INT UNSIGNED and uses InnoDB/utf8mb4
  CONSTRAINT fk_booking_lodge FOREIGN KEY (lodge_id) REFERENCES lodges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
