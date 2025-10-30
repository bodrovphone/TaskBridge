---
name: check
description: Run TypeScript type-check and ESLint, then fix any errors found. Use when you need to validate code quality or fix linting issues.
---

# TypeScript and ESLint Check & Fix

Run TypeScript type-check and ESLint, then fix any errors found.

## Instructions

1. **Run the check command**:
   - Execute `npm run check` to run both TypeScript type-check and ESLint
   - Capture and analyze all errors and warnings

2. **If errors are found**:
   - **Analyze each error carefully** before making changes
   - **Fix TypeScript errors**:
     - Resolve type mismatches
     - Add missing type annotations
     - Fix import/export issues
     - Ensure proper null/undefined handling
   - **Fix ESLint errors**:
     - **CRITICAL**: For `no-unused-vars` errors, **DELETE** unused code completely
     - **DO NOT** prefix variables with underscores - remove them instead
     - Fix import order and formatting issues
     - Resolve any other ESLint rule violations
   - **Use appropriate tools**:
     - Use `Edit` tool for file changes (not bash sed/awk)
     - Use `Read` tool to examine files before editing
     - Make targeted, precise fixes

3. **Re-run the check**:
   - After fixing errors, run `npm run check` again
   - Verify all errors are resolved

4. **Repeat until clean**:
   - Continue the fix-and-check cycle until `npm run check` passes without errors
   - Report the final status

## Project-Specific Guidelines

- **Unused Code Policy**: DELETE unused imports, variables, and parameters - don't prefix with underscores
- **Architecture**: Follow `/src/` directory structure with features, components, lib separation
- **Type Safety**: Maintain proper TypeScript types throughout
- **Code Quality**: Ensure all fixes improve code quality, don't just silence errors

## Success Criteria

- ✅ `npm run check` completes with exit code 0
- ✅ No TypeScript errors
- ✅ No ESLint errors or warnings
- ✅ All unused code removed (not just prefixed)
- ✅ Code remains functional after fixes
