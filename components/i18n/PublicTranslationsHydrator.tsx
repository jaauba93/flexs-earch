'use client'

import type { ReactNode } from 'react'
import {
  setRuntimeTranslationOverrides,
  type RuntimeTranslationOverrides,
} from '@/lib/i18n/runtime'

export default function PublicTranslationsHydrator({
  children,
  translations,
}: {
  children: ReactNode
  translations: RuntimeTranslationOverrides
}) {
  setRuntimeTranslationOverrides(translations)
  return <>{children}</>
}
