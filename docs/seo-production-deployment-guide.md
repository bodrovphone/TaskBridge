# SEO Production Deployment Guide

This guide documents the final steps for deploying Trudify with full SEO optimization.

## Pre-Deployment Checklist

### Local Testing (Before Production)

Run these commands and verify everything works:

```bash
# 1. Build the project locally
npm run build

# 2. Start production server
npm run start

# 3. Test these URLs in your browser:
```

**Pages to Test:**
- [ ] Homepage: `http://localhost:3000/bg` (and /en, /ru, /ua)
- [ ] Browse Tasks: `http://localhost:3000/bg/browse-tasks`
- [ ] Professionals: `http://localhost:3000/bg/professionals`
- [ ] Create Task: `http://localhost:3000/bg/create-task`
- [ ] Categories: `http://localhost:3000/bg/categories`
- [ ] About: `http://localhost:3000/bg/about`
- [ ] How It Works: `http://localhost:3000/bg/how-it-works`
- [ ] FAQ: `http://localhost:3000/bg/faq`
- [ ] For Professionals: `http://localhost:3000/bg/for-professionals`
- [ ] Testimonials: `http://localhost:3000/bg/testimonials`

**Verify for Each Page:**
- [ ] Page loads without errors
- [ ] Content displays in correct language
- [ ] Navigation works (language switcher, menu links)
- [ ] Mobile responsive layout works

### Technical SEO Verification

```bash
# View generated sitemap (after build)
curl http://localhost:3000/sitemap.xml

# View robots.txt
curl http://localhost:3000/robots.txt

# View OG image
open http://localhost:3000/opengraph-image
```

---

## Environment Variables

### Required for Production

Add these to Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `NEXT_PUBLIC_BASE_URL` | Your production domain | `https://trudify.com` |
| `ALLOW_INDEXING` | Enable search engine indexing | `true` |
| `GOOGLE_SITE_VERIFICATION` | GSC verification code | `abc123...` (get from GSC) |

### Existing Variables (Verify They're Set)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

---

## Domain Setup Steps

### 1. Connect Domain to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add `trudify.com`
3. Add `www.trudify.com` (redirect to apex domain)
4. Copy the DNS records provided by Vercel

### 2. Configure DNS Records

At your domain registrar, add these records:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

Wait for DNS propagation (usually 5-30 minutes, can take up to 48 hours).

### 3. Verify SSL Certificate

Vercel automatically provisions SSL. Verify by:
1. Visiting `https://trudify.com`
2. Checking the padlock icon in browser
3. Certificate should show as valid

---

## Google Search Console Setup

### 1. Add Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add property"
3. Choose "URL prefix" method
4. Enter: `https://trudify.com`

### 2. Verify Ownership

**Option A: HTML Tag (Recommended)**
1. Choose "HTML tag" verification
2. Copy the content value: `<meta name="google-site-verification" content="YOUR_CODE_HERE" />`
3. Extract just the code (everything inside `content="..."`)
4. Add to Vercel: `GOOGLE_SITE_VERIFICATION=YOUR_CODE_HERE`
5. Deploy and click "Verify" in GSC

**Option B: DNS Record**
1. Choose "DNS record" verification
2. Add TXT record at your registrar
3. Click "Verify"

### 3. Submit Sitemap

1. In GSC, go to Sitemaps
2. Enter: `sitemap.xml`
3. Click Submit

### 4. Request Indexing

For important pages, manually request indexing:
1. Use URL Inspection tool
2. Enter URL (e.g., `https://trudify.com/bg`)
3. Click "Request Indexing"

Priority pages to index:
- `https://trudify.com/bg` (Bulgarian homepage)
- `https://trudify.com/en` (English homepage)
- `https://trudify.com/bg/browse-tasks`
- `https://trudify.com/bg/professionals`
- `https://trudify.com/bg/for-professionals`

---

## Post-Deployment Verification

### Immediate Checks (Day 1)

```bash
# 1. Verify production site loads
curl -I https://trudify.com

# 2. Verify robots.txt allows indexing
curl https://trudify.com/robots.txt

# 3. Verify sitemap is accessible
curl https://trudify.com/sitemap.xml

# 4. Test OG image
curl -I https://trudify.com/opengraph-image
```

### Social Media Preview Testing

Use these tools to verify OG tags work:
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

Enter `https://trudify.com/bg` and verify:
- [ ] Title shows correctly
- [ ] Description shows correctly
- [ ] Image displays (Trudify logo on white background)

### Mobile-Friendly Test

1. Go to: https://search.google.com/test/mobile-friendly
2. Enter: `https://trudify.com/bg`
3. Verify: "Page is mobile-friendly"

### Page Speed Test

1. Go to: https://pagespeed.web.dev/
2. Test: `https://trudify.com/bg`
3. Target scores:
   - Performance: > 80
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90

---

## Monitoring (Ongoing)

### Weekly Tasks

- [ ] Check GSC for crawl errors
- [ ] Review Coverage report for indexing issues
- [ ] Monitor Core Web Vitals

### Monthly Tasks

- [ ] Review search performance in GSC
- [ ] Check for new keyword opportunities
- [ ] Update content pages if needed
- [ ] Verify all links still work

---

## Troubleshooting

### Sitemap Not Found

```bash
# Verify sitemap route exists
curl -I https://trudify.com/sitemap.xml

# If 404, check build logs for errors
```

### Pages Not Indexing

1. Check robots.txt isn't blocking
2. Verify `ALLOW_INDEXING=true` in production
3. Use URL Inspection in GSC
4. Check for noindex meta tags

### OG Image Not Showing

1. Clear social media cache using debug tools
2. Verify image URL is accessible: `https://trudify.com/opengraph-image`
3. Check image dimensions (should be 1200x630)

### Wrong Language Showing

1. Verify hreflang tags in page source
2. Check alternates in metadata
3. Test with `?hl=bg` parameter

---

## Files Modified in SEO Update

For reference, these files were created/modified:

**New Files:**
- `src/app/robots.ts` - Dynamic robots.txt
- `src/app/sitemap.ts` - Dynamic sitemap
- `src/app/opengraph-image.tsx` - Dynamic OG image
- `src/lib/utils/metadata.ts` - Localized metadata
- `src/components/seo/json-ld.tsx` - Structured data
- `src/components/content/*.tsx` - 7 shared components
- `src/app/[lang]/about/*` - About page
- `src/app/[lang]/how-it-works/*` - How It Works page
- `src/app/[lang]/faq/*` - FAQ page
- `src/app/[lang]/for-professionals/*` - For Professionals page
- `src/app/[lang]/testimonials/*` - Testimonials page
- `src/lib/intl/*/content-pages.ts` - Translations (en, bg, ru, ua)

**Updated Files:**
- `src/app/layout.tsx` - Enhanced metadata
- `src/app/[lang]/layout.tsx` - JSON-LD structured data
- `src/lib/intl/*/index.ts` - Added content-pages export
- Various page.tsx files - Added generateMetadata

---

## Quick Reference Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Test production locally
npm run start

# Type check
npm run type-check

# Lint
npm run lint
```

---

*Last updated: December 2025*
