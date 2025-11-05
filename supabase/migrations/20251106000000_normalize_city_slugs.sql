-- City Slug Normalization Migration
-- Converts all city values to lowercase slugs for locale-independent filtering
--
-- BEFORE: "Бургас", "София", "Burgas", "Sofia"
-- AFTER:  "burgas", "sofia", "burgas", "sofia"
--
-- Status: Ready for production
-- Date: 2025-11-06

-- ============================================================================
-- STEP 1: Normalize tasks.city to slugs
-- ============================================================================

-- Sofia variations
UPDATE tasks SET city = 'sofia'
WHERE city IN ('София', 'Sofia', 'sofia', 'СОФИЯ', 'SOFIA', 'Sofia, Bulgaria');

-- Plovdiv variations
UPDATE tasks SET city = 'plovdiv'
WHERE city IN ('Пловдив', 'Plovdiv', 'plovdiv', 'ПЛОВДИВ', 'PLOVDIV');

-- Varna variations
UPDATE tasks SET city = 'varna'
WHERE city IN ('Варна', 'Varna', 'varna', 'ВАРНА', 'VARNA');

-- Burgas variations
UPDATE tasks SET city = 'burgas'
WHERE city IN ('Бургас', 'Burgas', 'burgas', 'БУРГАС', 'BURGAS', 'Bourgas');

-- Ruse variations
UPDATE tasks SET city = 'ruse'
WHERE city IN ('Русе', 'Ruse', 'ruse', 'РУСЕ', 'RUSE', 'Rousse');

-- Stara Zagora variations
UPDATE tasks SET city = 'stara-zagora'
WHERE city IN ('Стара Загора', 'Stara Zagora', 'stara-zagora', 'Stara-Zagora', 'СТАРА ЗАГОРА', 'STARA ZAGORA');

-- Pleven variations
UPDATE tasks SET city = 'pleven'
WHERE city IN ('Плевен', 'Pleven', 'pleven', 'ПЛЕВЕН', 'PLEVEN');

-- Sliven variations
UPDATE tasks SET city = 'sliven'
WHERE city IN ('Сливен', 'Sliven', 'sliven', 'СЛИВЕН', 'SLIVEN');

-- ============================================================================
-- STEP 2: Normalize users.city to slugs (same pattern)
-- ============================================================================

-- Sofia variations
UPDATE users SET city = 'sofia'
WHERE city IN ('София', 'Sofia', 'sofia', 'СОФИЯ', 'SOFIA', 'Sofia, Bulgaria');

-- Plovdiv variations
UPDATE users SET city = 'plovdiv'
WHERE city IN ('Пловдив', 'Plovdiv', 'plovdiv', 'ПЛОВДИВ', 'PLOVDIV');

-- Varna variations
UPDATE users SET city = 'varna'
WHERE city IN ('Варна', 'Varna', 'varna', 'ВАРНА', 'VARNA');

-- Burgas variations
UPDATE users SET city = 'burgas'
WHERE city IN ('Бургас', 'Burgas', 'burgas', 'БУРГАС', 'BURGAS', 'Bourgas');

-- Ruse variations
UPDATE users SET city = 'ruse'
WHERE city IN ('Русе', 'Ruse', 'ruse', 'РУСЕ', 'RUSE', 'Rousse');

-- Stara Zagora variations
UPDATE users SET city = 'stara-zagora'
WHERE city IN ('Стара Загора', 'Stara Zagora', 'stara-zagora', 'Stara-Zagora', 'СТАРА ЗАГОРА', 'STARA ZAGORA');

-- Pleven variations
UPDATE users SET city = 'pleven'
WHERE city IN ('Плевен', 'Pleven', 'pleven', 'ПЛЕВЕН', 'PLEVEN');

-- Sliven variations
UPDATE users SET city = 'sliven'
WHERE city IN ('Сливен', 'Sliven', 'sliven', 'СЛИВЕН', 'SLIVEN');

-- ============================================================================
-- STEP 3: Add CHECK constraints to prevent invalid city values
-- ============================================================================

-- Drop existing constraints if they exist (for re-running migration)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_city_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_city_valid;

-- Add CHECK constraint to tasks.city (required field)
ALTER TABLE tasks
ADD CONSTRAINT tasks_city_valid
CHECK (city IN ('sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven'));

-- Add CHECK constraint to users.city (optional field, so allow NULL)
ALTER TABLE users
ADD CONSTRAINT users_city_valid
CHECK (city IS NULL OR city IN ('sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven'));

-- ============================================================================
-- VERIFICATION QUERIES (Run manually after migration to verify)
-- ============================================================================

-- Check tasks city distribution
-- SELECT city, COUNT(*) as count
-- FROM tasks
-- GROUP BY city
-- ORDER BY count DESC;

-- Check users city distribution
-- SELECT city, COUNT(*) as count
-- FROM users
-- WHERE city IS NOT NULL
-- GROUP BY city
-- ORDER BY count DESC;

-- Check for any invalid city values (should return 0 rows)
-- SELECT id, city FROM tasks
-- WHERE city NOT IN ('sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven');

-- SELECT id, city FROM users
-- WHERE city IS NOT NULL
-- AND city NOT IN ('sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven', 'sliven');
