import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BasicsArticleClient from '@/components/basics/BasicsArticleClient'
import {
  BASICS_ORDER,
  getBasicsTopic,
  getBasicsNextLinks,
  type BasicsSlug,
} from '@/lib/basics/flexBasics'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return BASICS_ORDER.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const topic = getBasicsTopic(params.slug)
  if (!topic) return {}
  return {
    title: topic.h1,
    description: topic.lead,
    openGraph: {
      title: `${topic.h1} — Podstawy flex`,
      description: topic.lead,
    },
  }
}

export default function BasicsArticlePage({ params }: PageProps) {
  const topic = getBasicsTopic(params.slug)
  if (!topic) return notFound()

  const nextLinks = getBasicsNextLinks(topic.slug as BasicsSlug)
  return <BasicsArticleClient topic={topic} nextLinks={nextLinks} />
}

export const dynamicParams = false
