# Refactor dangerouslySetInnerHTML Usage

## Task Description
Replace extensive `dangerouslySetInnerHTML` usage in content pages (terms, privacy) with safer alternatives.

## Requirements
- Review all usages of `dangerouslySetInnerHTML` in the codebase
- Consider using MDX or structured content components instead
- Ensure HTML content is properly sanitized if keeping innerHTML

## Affected Pages
- `/terms/page.tsx`
- `/privacy/page.tsx`

## Priority
Medium
