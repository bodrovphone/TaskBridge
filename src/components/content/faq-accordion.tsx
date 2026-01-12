'use client'

import { Accordion, AccordionItem } from '@heroui/react'
import { FAQJsonLd } from '@/components/seo/json-ld'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQItem[]
  includeSchema?: boolean
}

export function FAQAccordion({ faqs, includeSchema = true }: FAQAccordionProps) {
  return (
    <>
      {includeSchema && <FAQJsonLd faqs={faqs} />}
      <Accordion
        variant="splitted"
        className="gap-4"
        itemClasses={{
          base: 'px-6 py-2 bg-white shadow-sm border border-gray-100 rounded-xl',
          title: 'font-semibold text-gray-900',
          trigger: 'py-4',
          content: 'text-gray-600 pb-4',
        }}
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            aria-label={faq.question}
            title={faq.question}
          >
            <div className="prose prose-gray max-w-none">
              {faq.answer}
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  )
}
