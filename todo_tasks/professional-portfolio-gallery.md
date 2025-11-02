# Professional Portfolio Gallery

## Task Description
Implement portfolio gallery feature for professionals to showcase their work with before/after photos.

## Decision Needed
- **Option A**: JSONB field in users table (simpler, good for MVP)
- **Option B**: Separate `professional_portfolio` table (more scalable, better for search/filtering)

## Requirements (Future)
- Upload before/after images to Supabase Storage
- Add title, description, tags per portfolio item
- Display in professional profile page
- Allow CRUD operations on portfolio items
- Image optimization and CDN delivery

## Priority
Low - Not needed for MVP

## References
- Design already exists in `/src/app/[lang]/profile/components/portfolio-gallery-manager.tsx`
- Audit document: `/docs/profile-crud-audit-and-plan.md`
