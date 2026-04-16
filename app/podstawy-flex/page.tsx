import type { Metadata } from 'next'
import BasicsHubClient from '@/components/basics/BasicsHubClient'

export const metadata: Metadata = {
  title: 'Podstawy flex',
  description:
    'Zrozum biura elastyczne od podstaw: definicje, modele, scenariusze użycia i praktyczne kryteria wyboru.',
  openGraph: {
    title: 'Podstawy flex — Colliers',
    description:
      'Jedna sekcja wiedzy, która porządkuje temat biur elastycznych i prowadzi do narzędzi oraz raportów miejskich.',
  },
}

export default function BasicsHubPage() {
  return <BasicsHubClient />
}
