# Public Assets Folder

This folder contains static assets that are served directly by Next.js.

## Folder Structure

- `/images/` - General images (photos, illustrations, graphics)
- `/icons/` - Icons, favicons, and small graphics
- `/assets/` - Other static assets (fonts, documents, etc.)

## Usage

Files in this folder are accessible at the root URL. For example:
- `public/images/logo.png` → `/images/logo.png`
- `public/icons/favicon.ico` → `/favicon.ico`

## Best Practices

1. **Optimize images** before adding them here
2. **Use descriptive names** for better organization
3. **Keep file sizes reasonable** for web performance
4. **Use appropriate formats** (WebP for photos, SVG for icons when possible)

## Common Files to Add

- `favicon.ico` - Website favicon
- `logo.svg` - Company/app logo
- `hero-bg.jpg` - Hero section backgrounds
- `category-icons/` - Category illustration icons
- `avatars/` - Default user avatars
- `testimonials/` - User testimonial photos