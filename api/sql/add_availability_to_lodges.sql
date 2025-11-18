-- Add an availability column to lodges table
-- Run this on your database (adjust table name/schema if necessary)
ALTER TABLE `lodges`
  ADD COLUMN `availability` TINYINT(1) NOT NULL DEFAULT 1 AFTER `price`;

-- Note:
-- 1 = available, 0 = not available
-- If your `lodges` table uses different column ordering or a different engine/collation,
-- adjust accordingly. Verify with: SHOW CREATE TABLE lodges\G
