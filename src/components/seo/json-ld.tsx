/**
 * JSON-LD Structured Data Components for SEO
 * These help search engines understand your content better
 */

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trudify.com'

/**
 * Organization Schema - Company information
 * Shows in Google Knowledge Panel
 */
export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Trudify',
    url: baseUrl,
    logo: `${baseUrl}/images/logo/trudify-logo-512.png`,
    description: 'Platform connecting customers with verified professionals in Bulgaria for various services.',
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'Trudify Team',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BG',
      addressLocality: 'Sofia',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@trudify.com',
      availableLanguage: ['Bulgarian', 'English', 'Russian'],
    },
    sameAs: [
      'https://www.instagram.com/trudify_com',
      'https://www.facebook.com/profile.php?id=61584366488168',
      'https://www.linkedin.com/company/trudify',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * WebSite Schema - Site-wide search action
 * Enables sitelinks search box in Google
 */
export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Trudify',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/bg/browse-tasks?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * LocalBusiness Schema - For local SEO in Bulgaria
 */
export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#business`,
    name: 'Trudify',
    description: 'Online platform for finding verified local professionals in Bulgaria',
    url: baseUrl,
    logo: `${baseUrl}/images/logo/trudify-logo-512.png`,
    image: `${baseUrl}/images/logo/trudify-logo-512.png`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 42.6977,
      longitude: 23.3219,
    },
    areaServed: [
      { '@type': 'City', name: 'Sofia' },
      { '@type': 'City', name: 'Plovdiv' },
      { '@type': 'City', name: 'Varna' },
      { '@type': 'City', name: 'Burgas' },
      { '@type': 'City', name: 'Ruse' },
      { '@type': 'City', name: 'Stara Zagora' },
      { '@type': 'City', name: 'Pleven' },
      { '@type': 'City', name: 'Sliven' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * BreadcrumbList Schema - Navigation breadcrumbs
 */
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * FAQPage Schema - For FAQ pages
 * Enables FAQ rich snippets in search results
 */
interface FAQItem {
  question: string
  answer: string
}

interface FAQJsonLdProps {
  faqs: FAQItem[]
}

export function FAQJsonLd({ faqs }: FAQJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Service Schema - For task/service listings
 */
interface ServiceJsonLdProps {
  name: string
  description: string
  category: string
  provider?: string
  areaServed?: string
}

export function ServiceJsonLd({ name, description, category, provider, areaServed }: ServiceJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    category,
    provider: provider
      ? {
          '@type': 'Person',
          name: provider,
        }
      : {
          '@type': 'Organization',
          name: 'Trudify',
        },
    areaServed: areaServed
      ? {
          '@type': 'City',
          name: areaServed,
        }
      : {
          '@type': 'Country',
          name: 'Bulgaria',
        },
    serviceType: category,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * ProfilePage Schema - For professional profiles
 */
interface ProfileJsonLdProps {
  name: string
  description: string
  image?: string
  jobTitle?: string
  url: string
}

export function ProfileJsonLd({ name, description, image, jobTitle, url }: ProfileJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name,
      description,
      image: image || `${baseUrl}/images/logo/trudify-logo-512.png`,
      jobTitle: jobTitle || 'Professional',
      url: url.startsWith('http') ? url : `${baseUrl}${url}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
