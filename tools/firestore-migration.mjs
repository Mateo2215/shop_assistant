// CLI for inventorying, atomically copying, and verifying one household via Firestore REST.
import { GoogleAuth } from 'google-auth-library'
import {
  assertMigrationSafety,
  compareInventories,
  expectedConfirmation,
  hashDocumentFields,
  parseArguments,
  summarizeDocuments,
  transformRestFields,
} from './firestore-migration-core.mjs'

const VALID_COMMANDS = new Set(['inventory', 'migrate', 'verify'])
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/cloud-platform'

function printUsage() {
  console.log(`
Usage:
  node tools/firestore-migration.mjs inventory [options]
  node tools/firestore-migration.mjs migrate --confirm <value> [options]
  FIRESTORE_MIGRATION_CONFIRMATION=<value> node tools/firestore-migration.mjs migrate
  node tools/firestore-migration.mjs verify [options]

Options:
  --source <project-id>       Default: zakupowo-28267
  --target <project-id>       Default: zakupowo-v2
  --household <household-id>  Default: nasze-zakupy
  --confirm <value>           Required only for migrate
`)
}

function encodeFirestorePath(path) {
  return path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function documentResource(projectId, documentPath = '') {
  const base = `projects/${projectId}/databases/(default)/documents`
  return documentPath ? `${base}/${documentPath}` : base
}

function documentBaseUrl(projectId) {
  return `https://firestore.googleapis.com/v1/${documentResource(projectId)}`
}

function relativeDocumentPath(documentName) {
  const marker = '/documents/'
  const index = documentName.indexOf(marker)
  if (index < 0) throw new Error(`Invalid Firestore document name: ${documentName}`)
  return documentName.slice(index + marker.length)
}

async function request(client, projectId, options) {
  try {
    return await client.request(options)
  } catch (error) {
    const status = error.response?.status
    const apiMessage = error.response?.data?.error?.message
    const suffix = status ? ` HTTP ${status}.` : ''
    throw new Error(
      `Cannot access Firestore project "${projectId}".${suffix} ${
        apiMessage ?? error.message
      }`.trim(),
      { cause: error }
    )
  }
}

async function getDocument(client, projectId, path) {
  try {
    const response = await client.request({
      url: `${documentBaseUrl(projectId)}/${encodeFirestorePath(path)}`,
      method: 'GET',
    })
    return response.data
  } catch (error) {
    if (error.response?.status === 404) return null
    throw error
  }
}

async function listCollectionIds(client, projectId, documentPath) {
  const collectionIds = []
  let pageToken

  do {
    const response = await request(client, projectId, {
      url: `${documentBaseUrl(projectId)}/${encodeFirestorePath(
        documentPath
      )}:listCollectionIds`,
      method: 'POST',
      data: { pageSize: 100, pageToken },
    })
    collectionIds.push(...(response.data.collectionIds ?? []))
    pageToken = response.data.nextPageToken
  } while (pageToken)

  return collectionIds.sort()
}

async function listDocuments(client, projectId, collectionPath) {
  const segments = collectionPath.split('/')
  const collectionId = segments.pop()
  const parentPath = segments.join('/')
  const documents = []
  let pageToken

  do {
    const response = await request(client, projectId, {
      url: `${documentBaseUrl(projectId)}/${encodeFirestorePath(
        parentPath
      )}/${encodeURIComponent(collectionId)}`,
      method: 'GET',
      params: {
        pageSize: 300,
        pageToken,
      },
    })
    documents.push(...(response.data.documents ?? []))
    pageToken = response.data.nextPageToken
  } while (pageToken)

  return documents
}

async function collectDocumentTree(client, projectId, householdId) {
  const rootPath = `households/${householdId}`
  const documents = []

  async function collectDocument(documentPath, providedDocument) {
    const document =
      providedDocument ?? (await getDocument(client, projectId, documentPath))
    if (document) {
      documents.push({
        path: documentPath,
        fields: document.fields ?? {},
        hash: hashDocumentFields(document.fields),
      })
    }

    const collectionIds = await listCollectionIds(client, projectId, documentPath)
    for (const collectionId of collectionIds) {
      const children = await listDocuments(
        client,
        projectId,
        `${documentPath}/${collectionId}`
      )
      for (const child of children) {
        await collectDocument(relativeDocumentPath(child.name), child)
      }
    }
  }

  await collectDocument(rootPath)
  documents.sort((left, right) => left.path.localeCompare(right.path))
  return documents
}

function printInventory(label, projectId, documents) {
  const summary = summarizeDocuments(documents)
  console.log(`\n${label}: ${projectId}`)
  console.log(`Household documents: ${summary.documentCount}`)

  const entries = Object.entries(summary.collectionCounts)
  if (entries.length === 0) {
    console.log('Collections: empty')
    return
  }

  console.log('Collections:')
  for (const [path, count] of entries) console.log(`  ${path}: ${count}`)
}

async function migrateDocuments(
  client,
  sourceProjectId,
  targetProjectId,
  sourceDocuments
) {
  const maximumAtomicWrites = 500
  if (sourceDocuments.length > maximumAtomicWrites) {
    throw new Error(
      `Source contains ${sourceDocuments.length} documents. The safe atomic migration limit is ${maximumAtomicWrites}; no writes were started.`
    )
  }

  const writes = sourceDocuments.map((document) => ({
    update: {
      name: documentResource(targetProjectId, document.path),
      fields: transformRestFields(
        document.fields,
        sourceProjectId,
        targetProjectId
      ),
    },
    currentDocument: { exists: false },
  }))

  await request(client, targetProjectId, {
    url: `${documentBaseUrl(targetProjectId)}:commit`,
    method: 'POST',
    data: { writes },
  })
}

function printVerification(result) {
  if (result.matches) {
    console.log('\nVerification: PASS — all document paths and checksums match.')
    return
  }

  console.error('\nVerification: FAIL')
  console.error(`Missing documents: ${result.missing.length}`)
  console.error(`Extra documents: ${result.extra.length}`)
  console.error(`Changed documents: ${result.changed.length}`)
  process.exitCode = 2
}

async function main() {
  const config = parseArguments(process.argv.slice(2))
  config.confirmation ??= process.env.FIRESTORE_MIGRATION_CONFIRMATION
  if (!VALID_COMMANDS.has(config.command)) {
    printUsage()
    throw new Error(`Command must be one of: ${[...VALID_COMMANDS].join(', ')}`)
  }
  if (config.sourceProjectId === config.targetProjectId) {
    throw new Error('Source and target projects must be different.')
  }

  const client = await new GoogleAuth({ scopes: [FIRESTORE_SCOPE] }).getClient()
  const [sourceDocuments, targetDocuments] = await Promise.all([
    collectDocumentTree(client, config.sourceProjectId, config.householdId),
    collectDocumentTree(client, config.targetProjectId, config.householdId),
  ])

  printInventory('Source', config.sourceProjectId, sourceDocuments)
  printInventory('Target', config.targetProjectId, targetDocuments)

  if (config.command === 'inventory') {
    console.log(
      `\nRequired migration confirmation:\n${expectedConfirmation(
        config.sourceProjectId,
        config.targetProjectId,
        config.householdId
      )}`
    )
    return
  }
  if (config.command === 'verify') {
    printVerification(compareInventories(sourceDocuments, targetDocuments))
    return
  }

  assertMigrationSafety({
    ...config,
    sourceDocumentCount: sourceDocuments.length,
    targetDocumentCount: targetDocuments.length,
  })

  console.log(`\nStarting atomic copy of ${sourceDocuments.length} documents...`)
  await migrateDocuments(
    client,
    config.sourceProjectId,
    config.targetProjectId,
    sourceDocuments
  )

  const migratedDocuments = await collectDocumentTree(
    client,
    config.targetProjectId,
    config.householdId
  )
  const verification = compareInventories(sourceDocuments, migratedDocuments)
  printInventory('Target after migration', config.targetProjectId, migratedDocuments)
  printVerification(verification)

  if (!verification.matches) {
    throw new Error('Migration completed writes but verification failed.')
  }
}

main().catch((error) => {
  console.error(`\nMigration tool error: ${error.message}`)
  process.exitCode = 1
})
