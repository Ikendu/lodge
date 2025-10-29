-- SQL DDL to create the `lodges` table used by api/add_lodge.php
-- Run this on your MySQL server (adjust types/lengths as needed)

CREATE TABLE IF NOT EXISTS `lodges` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userUid` VARCHAR(255) DEFAULT NULL,
  `userLoginMail` VARCHAR(255) DEFAULT NULL,
  `nin` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `price` VARCHAR(50) DEFAULT NULL,
  `type` VARCHAR(100) DEFAULT NULL,
  `description` TEXT,
  `amenities` TEXT,
  `capacity` INT DEFAULT NULL,
  `bathroomType` VARCHAR(100) DEFAULT NULL,
  `image_first` VARCHAR(255) DEFAULT NULL,
  `image_second` VARCHAR(255) DEFAULT NULL,
  `image_third` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`nin`),
  INDEX (`userUid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
