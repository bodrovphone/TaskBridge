# SEO Blog Content Pages

## Task Description
Create blog/content pages targeting high-intent Bulgarian keywords that link to browse pages with pre-applied filters. This improves SEO without refactoring the existing filtering system.

## Requirements
- Create blog infrastructure (route, layout, components)
- Write 10 initial blog articles targeting top service+city keyword combinations
- Each article should be 500-800 words with real value (not SEO filler)
- Include clear CTAs linking to browse pages with relevant filters pre-applied
- Full i18n support (start with BG, add EN/RU later)
- Add blog pages to sitemap

## Blog Topics (Priority Order)

### Tier 0 - GOLDEN KEYWORD (5,000 searches/month, LOW competition)
0. ✅ "Търся работа в България - 7 начина да намерите работа бързо през 2026"
   - Target: търся работа (5,000/month, LOW competition)
   - Links to: /bg/browse-tasks
   - Status: **PUBLISHED** - `/bg/tarsya-rabota-v-bulgaria` (no /blog/ prefix)

### Tier 1 - National (All Bulgaria)
1. "Цени за почистване на апартамент в България 2026"
   - Target: почистване на апартамент цена
   - Links to: /bg/browse-tasks?category=cleaning-services

2. "Колко струва преместване в България - пълен гайд 2026"
   - Target: преместване цена, хамали цени
   - Links to: /bg/browse-tasks?category=logistics

3. "Топ 5 съвета при избор на електротехник"
   - Target: електротехник, електричар
   - Links to: /bg/browse-tasks?category=electrician

4. "Боядисване на апартамент - цени и съвети 2026"
   - Target: боядисване на апартамент цена
   - Links to: /bg/browse-tasks?category=finishing-work

### Tier 2 - Burgas (Beta City - Priority!)
5. "Хамали Бургас - цени и съвети за преместване 2026"
   - Target: хамали Бургас, преместване Бургас
   - Links to: /bg/browse-tasks?category=logistics&city=burgas

6. "Майстор на час в Бургас - как да намерите надежден"
   - Target: майстор Бургас, домашен майстор Бургас
   - Links to: /bg/browse-tasks?category=handyman&city=burgas

7. "Почистване на апартамент в Бургас - цени 2026"
   - Target: почистване Бургас, чистачка Бургас
   - Links to: /bg/browse-tasks?category=cleaning-services&city=burgas

### Tier 3 - Sofia (Largest Market)
8. "Хамали София - цени и препоръки 2026"
   - Target: хамали София (5,000/month, HIGH competition)
   - Links to: /bg/browse-tasks?category=logistics&city=sofia

9. "Майстор на час в София - какво да очаквате"
   - Target: майстор на час София
   - Links to: /bg/browse-tasks?category=handyman&city=sofia

### Tier 4 - Plovdiv & Varna
10. "Хамали Пловдив - цени за преместване 2026"
    - Target: хамали Пловдив, преместване Пловдив
    - Links to: /bg/browse-tasks?category=logistics&city=plovdiv

11. "Хамали Варна - цени и съвети за лятото"
    - Target: хамали Варна (seasonal - summer)
    - Links to: /bg/browse-tasks?category=logistics&city=varna

12. "Почистване на апартамент Варна - цени за сезона"
    - Target: почистване Варна (seasonal - vacation rentals)
    - Links to: /bg/browse-tasks?category=cleaning-services&city=varna

## Technical Implementation

### Route Structure (Updated - No /blog/ prefix)
```
/src/app/[lang]/[slug]/
  └── page.tsx              # Individual article at root level

/src/features/blog/
  ├── lib/
  │   ├── types.ts          # Article types
  │   └── articles/         # Article content
  │       ├── index.ts      # Article utilities
  │       └── bg/           # Bulgarian articles
  └── index.ts              # Barrel exports
```

**URL Examples:**
- `/bg/tarsya-rabota-v-bulgaria` (not `/bg/blog/tarsya-rabota-v-bulgaria`)
- `/bg/hamali-burgas-ceni-2026`
- `/bg/pochistvane-apartament-ceni`

### SEO Requirements per Article
- Unique meta title with primary keyword
- Meta description 150-160 chars with keyword
- H1 with primary keyword
- 2-3 H2 subheadings with secondary keywords
- FAQ schema (2-3 questions per article)
- Breadcrumb schema
- Internal links to related articles
- CTA button linking to filtered browse page

### Content Guidelines
- Write for humans first, SEO second
- Include practical tips and real value
- Use Bulgarian naturally (not keyword-stuffed)
- Add pricing ranges where relevant (helps with featured snippets)
- Include "what to look for" checklists

## Acceptance Criteria
- [x] Blog route infrastructure created ✅
- [x] Blog listing page with card grid ✅
- [x] Individual blog post page with proper layout ✅
- [ ] At least 3 Tier 1 articles published (1 of 3 done)
- [x] All articles have proper meta tags and schema ✅
- [x] Articles link to correct filtered browse pages ✅
- [x] Blog pages added to sitemap ✅
- [x] Mobile responsive design (using NextUI) ✅
- [x] Canonical URLs configured ✅
- [x] FAQ schema for rich snippets ✅
- [x] Article schema (JSON-LD) ✅
- [x] Breadcrumb schema ✅

## Technical Notes
- Use MDX or store content in translation files for i18n
- Consider Supabase for blog content storage (future CMS capability)
- Reuse existing ContentSection, CTASection components from /src/components/content/

## Priority
High - Direct impact on SEO and organic traffic

## Estimated Effort
- Infrastructure: 1 day
- Per article: 2-3 hours (writing + implementation)
- Total: 3-4 days for MVP (infrastructure + 3 articles)
