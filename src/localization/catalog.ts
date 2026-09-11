import { enUSMessages } from './locales/en-US.ts'
import { localeRegistry } from './registry.ts'
import type {
  MessageKey,
  MessageParameters,
  SupportedLocale,
} from './types.ts'

function resolvePluralExpressions(
  template: string,
  locale: SupportedLocale,
  parameters: MessageParameters,
): string {
  return template.replace(
    /\{(\w+), plural, one \{([^{}]*)\} other \{([^{}]*)\}\}/g,
    (_match, name: string, singular: string, plural: string) => {
      const value = parameters[name]
      if (typeof value !== 'number') {
        throw new Error(`Localization plural parameter "${name}" must be a number.`)
      }
      return new Intl.PluralRules(locale).select(value) === 'one' ? singular : plural
    },
  )
}

/** Resolves a semantic key through locale override, baseline, then interpolation. */
export function translate(
  locale: SupportedLocale,
  key: MessageKey,
  parameters: MessageParameters = {},
): string {
  const template = localeRegistry[locale].messages[key] ?? enUSMessages[key]
  if (template === undefined) {
    throw new Error(`Missing baseline localization message: ${key}`)
  }

  const parameterTemplate = template.replace(
    /\{(\w+), plural, one \{[^{}]*\} other \{[^{}]*\}\}/g,
    '{$1}',
  )
  const expectedNames = new Set(
    [...parameterTemplate.matchAll(/\{(\w+)\}/g)].map((match) => match[1]),
  )
  for (const name of expectedNames) {
    if (parameters[name] === undefined) {
      throw new Error(`Missing localization parameter "${name}" for ${key}.`)
    }
  }
  for (const name of Object.keys(parameters)) {
    if (!expectedNames.has(name)) {
      throw new Error(`Unexpected localization parameter "${name}" for ${key}.`)
    }
  }

  return resolvePluralExpressions(template, locale, parameters).replace(
    /\{(\w+)\}/g,
    (_match, name: string) => {
      const value = parameters[name]
      if (value === undefined) {
        throw new Error(`Missing localization parameter "${name}" for ${key}.`)
      }
      return String(value)
    },
  )
}

export function translateDescriptor(
  locale: SupportedLocale,
  descriptor: import('./types.ts').MessageDescriptor,
): string {
  return translate(locale, descriptor.key, descriptor.parameters)
}
