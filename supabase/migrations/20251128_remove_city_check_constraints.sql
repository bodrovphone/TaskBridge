-- Migration: Expand city CHECK constraints to support 51 Bulgarian cities
-- Date: 2024-11-28
-- Description:
--   Expands city support to include major cities + resort/expat areas
--   Maintains CHECK constraints for data integrity

-- ============================================================================
-- STEP 1: Drop existing constraints
-- ============================================================================
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_city_valid;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_city_check;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_city_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_city_check;

-- ============================================================================
-- STEP 2: Add expanded CHECK constraint to tasks.city (required field)
-- 51 cities: major cities + regional centers + resort/expat areas
-- ============================================================================
ALTER TABLE tasks
ADD CONSTRAINT tasks_city_valid
CHECK (city IN (
  -- Major cities (>100k population)
  'sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven',
  -- Regional centers (50k-100k)
  'sliven', 'dobrich', 'shumen', 'pernik', 'haskovo', 'yambol', 'pazardzhik',
  'blagoevgrad', 'veliko-tarnovo', 'vratsa', 'gabrovo', 'asenovgrad',
  -- Smaller cities (30k-50k)
  'vidin', 'kazanlak', 'kardzhali', 'kyustendil', 'montana', 'targovishte',
  'dimitrovgrad', 'silistra', 'lovech', 'razgrad', 'dupnitsa', 'gorna-oryahovitsa',
  'smolyan', 'petrich', 'sandanski', 'samokov', 'sevlievo', 'lom', 'karlovo', 'troyan',
  -- Popular tourist/resort areas (high expat populations)
  'bansko', 'nesebar', 'sunny-beach', 'sveti-vlas', 'sozopol', 'pomorie',
  'primorsko', 'golden-sands', 'albena', 'balchik', 'obzor', 'borovets'
));

-- ============================================================================
-- STEP 3: Add expanded CHECK constraint to users.city (optional field, allow NULL)
-- ============================================================================
ALTER TABLE users
ADD CONSTRAINT users_city_valid
CHECK (city IS NULL OR city IN (
  -- Major cities (>100k population)
  'sofia', 'plovdiv', 'varna', 'burgas', 'ruse', 'stara-zagora', 'pleven',
  -- Regional centers (50k-100k)
  'sliven', 'dobrich', 'shumen', 'pernik', 'haskovo', 'yambol', 'pazardzhik',
  'blagoevgrad', 'veliko-tarnovo', 'vratsa', 'gabrovo', 'asenovgrad',
  -- Smaller cities (30k-50k)
  'vidin', 'kazanlak', 'kardzhali', 'kyustendil', 'montana', 'targovishte',
  'dimitrovgrad', 'silistra', 'lovech', 'razgrad', 'dupnitsa', 'gorna-oryahovitsa',
  'smolyan', 'petrich', 'sandanski', 'samokov', 'sevlievo', 'lom', 'karlovo', 'troyan',
  -- Popular tourist/resort areas (high expat populations)
  'bansko', 'nesebar', 'sunny-beach', 'sveti-vlas', 'sozopol', 'pomorie',
  'primorsko', 'golden-sands', 'albena', 'balchik', 'obzor', 'borovets'
));

-- Add comments documenting the constraint
COMMENT ON CONSTRAINT tasks_city_valid ON tasks IS '51 Bulgarian cities: major cities + resort/expat areas';
COMMENT ON CONSTRAINT users_city_valid ON users IS '51 Bulgarian cities: major cities + resort/expat areas (nullable)';

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
