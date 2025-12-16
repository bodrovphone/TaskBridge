-- Migration: Convert BGN to EUR
-- Date: 2025-12-16
-- Description: Convert all currency values from Bulgarian Lev (BGN) to Euro (EUR)
-- Conversion rate: ~1 BGN = 0.51 EUR (approximately half, using ROUND for cleaner values)

-- ============================================================================
-- TASKS TABLE: Convert budget values
-- ============================================================================

-- Convert budget_min_bgn (divide by 2 and round to nearest integer)
UPDATE tasks
SET budget_min_bgn = ROUND(budget_min_bgn / 2.0)
WHERE budget_min_bgn IS NOT NULL AND budget_min_bgn > 0;

-- Convert budget_max_bgn (divide by 2 and round to nearest integer)
UPDATE tasks
SET budget_max_bgn = ROUND(budget_max_bgn / 2.0)
WHERE budget_max_bgn IS NOT NULL AND budget_max_bgn > 0;

-- ============================================================================
-- APPLICATIONS TABLE: Convert proposed price values
-- ============================================================================

-- Convert proposed_price_bgn (divide by 2 and round to nearest integer)
UPDATE applications
SET proposed_price_bgn = ROUND(proposed_price_bgn / 2.0)
WHERE proposed_price_bgn IS NOT NULL AND proposed_price_bgn > 0;

-- ============================================================================
-- USERS TABLE: Convert hourly rate values
-- ============================================================================

-- Convert hourly_rate_bgn for professionals (divide by 2 and round to nearest integer)
UPDATE users
SET hourly_rate_bgn = ROUND(hourly_rate_bgn / 2.0)
WHERE hourly_rate_bgn IS NOT NULL AND hourly_rate_bgn > 0;

-- ============================================================================
-- Notes:
-- - All BGN values are approximately halved to convert to EUR
-- - Values are rounded to nearest integer for cleaner display
-- - Column names still reference "bgn" but now contain EUR values
-- - Consider renaming columns in a future migration (e.g., budget_min_bgn → budget_min_eur)
-- ============================================================================
