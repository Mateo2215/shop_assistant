// Pure helpers for safe Firestore REST inventory, migration, and verification.
import { createHash } from 'node:crypto'

export const DEFAULT_MIGRATION_CONFIG = Object.freeze({
  sourceProjectId: 'zakupowo-28267',
  targetProjectId: 'zakupowo-v2',
  householdId: 'nasze-zakupy',
})

export function parseArguments(argv) {
  const [command, ...tokens] = argv
  const options = {}

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!token.startsWith('--')) throw new Error(`Unknown argument: ${token}`)

    const key = token.slice(2)
    const value = tokens[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`)

    options[key] = value
    index += 1
  }

  return {
    command,
    sourceProjectId: options.source ?? DEFAULT_MIGRATION_CONFIG.sourceProjectId,
    targetProjectId: options.target ?? DEFAULT_MIGRATION_CONFIG.targetProjectId,
    householdId: options.household ?? DEFAULT_MIGRATION_CONFIG.householdId,
    confirmation: options.confirm,
  }
}

export function expectedConfirmation(sourceProjectId, targetProjectId, householdId) {
  return `${sourceProjectId}:${householdId}->${targetProjectId}:${householdId}`
}

export function assertMigrationSafety({
  sourceProjectId,
  targetProjectId,
  householdId,
  confirmation,
  sourceDocumentCount,
  targetDocumentCount,
}) {
  if (sourceProjectId === targetProjectId) {
    throw new Error('Source and target projects must be different.')
  }
  if (sourceDocumentCount === 0) {
    throw new Error('Source household contains no documents. Migration aborted.')
  }
  if (targetDocumentCount > 0) {
    throw new Error(
      `Target household is not empty (${targetDocumentCount} documents). Migration will not overwrite data.`
    )
  }

  const expected = expectedConfirmation(sourceProjectId, targetProjectId, householdId)
  if (confirmation !== expected) {
    throw new Error(`Migration confirmation mismatch. Required value: ${expected}`)
  }
}

function relativeReferencePath(referenceValue) {
  const marker = '/documents/'
  const index = referenceValue.indexOf(marker)
  return index >= 0 ? referenceValue.slice(index + marker.length) : referenceValue
}

export function transformRestFields(fields, sourceProjectId, targetProjectId) {
  function transform(value) {
    if (Array.isArray(value)) return value.map(transform)
    if (!value || typeof value !== 'object') return value

    if (typeof value.referenceValue === 'string') {
      const sourcePrefix = `projects/${sourceProjectId}/databases/(default)/documents/`
      const targetPrefix = `projects/${targetProjectId}/databases/(default)/documents/`
      return {
        ...value,
        referenceValue: value.referenceValue.startsWith(sourcePrefix)
          ? `${targetPrefix}${value.referenceValue.slice(sourcePrefix.length)}`
          : value.referenceValue,
      }
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, transform(entry)])
    )
  }

  return transform(fields ?? {})
}

export function canonicalizeRestFields(value) {
  if (Array.isArray(value)) return value.map(canonicalizeRestFields)
  if (!value || typeof value !== 'object') return value

  if (typeof value.referenceValue === 'string') {
    return { referenceValue: relativeReferencePath(value.referenceValue) }
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalizeRestFields(value[key])])
  )
}

export function hashDocumentFields(fields) {
  const canonical = JSON.stringify(canonicalizeRestFields(fields ?? {}))
  return createHash('sha256').update(canonical).digest('hex')
}

export function summarizeDocuments(documents) {
  const collections = new Map()

  for (const document of documents) {
    const segments = document.path.split('/')
    const collectionPath = segments.slice(0, -1).join('/')
    collections.set(collectionPath, (collections.get(collectionPath) ?? 0) + 1)
  }

  return {
    documentCount: documents.length,
    collectionCounts: Object.fromEntries(
      [...collections.entries()].sort(([left], [right]) => left.localeCompare(right))
    ),
  }
}

export function compareInventories(sourceDocuments, targetDocuments) {
  const source = new Map(sourceDocuments.map((document) => [document.path, document.hash]))
  const target = new Map(targetDocuments.map((document) => [document.path, document.hash]))
  const missing = []
  const extra = []
  const changed = []

  for (const [path, hash] of source) {
    if (!target.has(path)) missing.push(path)
    else if (target.get(path) !== hash) changed.push(path)
  }
  for (const path of target.keys()) {
    if (!source.has(path)) extra.push(path)
  }

  return {
    matches: missing.length === 0 && extra.length === 0 && changed.length === 0,
    missing,
    extra,
    changed,
  }
}
