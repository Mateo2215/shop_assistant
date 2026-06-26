// Dependency-free smoke tests for migration safeguards and REST checksum behavior.
import assert from 'node:assert/strict'
import {
  assertMigrationSafety,
  compareInventories,
  expectedConfirmation,
  hashDocumentFields,
  parseArguments,
  summarizeDocuments,
  transformRestFields,
} from './firestore-migration-core.mjs'

const parsed = parseArguments([
  'migrate',
  '--source',
  'old-project',
  '--target',
  'new-project',
  '--household',
  'home',
  '--confirm',
  'old-project:home->new-project:home',
])
assert.equal(parsed.command, 'migrate')
assert.equal(parsed.sourceProjectId, 'old-project')
assert.equal(parsed.targetProjectId, 'new-project')
assert.equal(parsed.householdId, 'home')
assert.equal(
  expectedConfirmation('old-project', 'new-project', 'home'),
  'old-project:home->new-project:home'
)

assert.throws(
  () =>
    assertMigrationSafety({
      ...parsed,
      confirmation: undefined,
      sourceDocumentCount: 1,
      targetDocumentCount: 0,
    }),
  /confirmation mismatch/i
)
assert.throws(
  () =>
    assertMigrationSafety({
      ...parsed,
      sourceDocumentCount: 1,
      targetDocumentCount: 1,
    }),
  /not empty/i
)
assert.doesNotThrow(() =>
  assertMigrationSafety({
    ...parsed,
    sourceDocumentCount: 2,
    targetDocumentCount: 0,
  })
)

const firstHash = hashDocumentFields({
  beta: { integerValue: '2' },
  alpha: { mapValue: { fields: { value: { integerValue: '1' } } } },
})
const secondHash = hashDocumentFields({
  alpha: { mapValue: { fields: { value: { integerValue: '1' } } } },
  beta: { integerValue: '2' },
})
assert.equal(firstHash, secondHash)
assert.notEqual(
  firstHash,
  hashDocumentFields({
    alpha: { mapValue: { fields: { value: { integerValue: '2' } } } },
    beta: { integerValue: '2' },
  })
)

assert.deepEqual(
  transformRestFields(
    {
      linked: {
        referenceValue:
          'projects/old-project/databases/(default)/documents/households/home/products/milk',
      },
    },
    'old-project',
    'new-project'
  ),
  {
    linked: {
      referenceValue:
        'projects/new-project/databases/(default)/documents/households/home/products/milk',
    },
  }
)

const documents = [
  { path: 'households/home/history/one', hash: 'a' },
  { path: 'households/home/history/two', hash: 'b' },
  { path: 'households/home/products/milk', hash: 'c' },
]
assert.deepEqual(summarizeDocuments(documents), {
  documentCount: 3,
  collectionCounts: {
    'households/home/history': 2,
    'households/home/products': 1,
  },
})
assert.equal(compareInventories(documents, documents).matches, true)
assert.deepEqual(
  compareInventories(documents, [
    documents[0],
    { ...documents[1], hash: 'changed' },
  ]),
  {
    matches: false,
    missing: ['households/home/products/milk'],
    extra: [],
    changed: ['households/home/history/two'],
  }
)

console.log('Firestore migration self-test: PASS')
