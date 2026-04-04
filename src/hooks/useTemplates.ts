import { useState, useEffect } from 'react'
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc, increment, writeBatch } from 'firebase/firestore'
import { db, HOUSEHOLD_ID } from '../firebase'
import type { Template } from '../types'
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates'

export function useTemplates() {
  const [firestoreTemplates, setFirestoreTemplates] = useState<(Template & { deleted: boolean })[]>([])

  useEffect(() => {
    const ref = collection(db, 'households', HOUSEHOLD_ID, 'templates')
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const templates = snapshot.docs.map((d) => ({
        id: d.id,
        name: d.data().name as string,
        emoji: (d.data().emoji as string) ?? '📋',
        items: (d.data().items ?? []) as Template['items'],
        isDefault: false,
        deleted: (d.data().deleted as boolean) ?? false,
        useCount: (d.data().useCount as number) ?? 0,
      }))
      setFirestoreTemplates(templates)
    })
    return unsubscribe
  }, [])

  const firestoreById = new Map(firestoreTemplates.map((t) => [t.id, t]))
  // IDs of default templates that have been soft-deleted in Firestore
  const deletedDefaultIds = new Set(
    firestoreTemplates.filter((t) => t.deleted).map((t) => t.id)
  )

  const allTemplates: Template[] = [
    // Default templates, minus soft-deleted ones, overridden by Firestore edits
    ...DEFAULT_TEMPLATES
      .filter((d) => !deletedDefaultIds.has(d.id))
      .map((d) => {
        const fs = firestoreById.get(d.id)
        return fs && !fs.deleted ? { ...fs, isDefault: true } : d
      }),
    // Pure custom templates (not overriding any default, not deleted)
    ...firestoreTemplates.filter(
      (t) => !DEFAULT_TEMPLATES.some((d) => d.id === t.id) && !t.deleted
    ),
  ]

  async function createTemplate(name: string, emoji: string, items: Template['items']) {
    const ref = collection(db, 'households', HOUSEHOLD_ID, 'templates')
    await addDoc(ref, { name, emoji, items })
  }

  // setDoc creates or overwrites — works for both custom and default template overrides
  async function updateTemplate(id: string, name: string, emoji: string, items: Template['items']) {
    const ref = doc(db, 'households', HOUSEHOLD_ID, 'templates', id)
    await setDoc(ref, { name, emoji, items })
  }

  async function recordTemplateUse(id: string) {
    const ref = doc(db, 'households', HOUSEHOLD_ID, 'templates', id)
    await setDoc(ref, { useCount: increment(1) }, { merge: true })
  }

  async function resetTemplateUseCounts() {
    const batch = writeBatch(db)
    for (const t of firestoreTemplates.filter((t) => (t.useCount ?? 0) > 0)) {
      batch.update(doc(db, 'households', HOUSEHOLD_ID, 'templates', t.id), { useCount: 0 })
    }
    await batch.commit()
  }

  async function deleteTemplate(id: string) {
    const ref = doc(db, 'households', HOUSEHOLD_ID, 'templates', id)
    if (DEFAULT_TEMPLATES.some((d) => d.id === id)) {
      // Soft-delete: mark in Firestore so it's filtered out of allTemplates
      await setDoc(ref, { deleted: true })
    } else {
      await deleteDoc(ref)
    }
  }

  return { allTemplates, createTemplate, updateTemplate, deleteTemplate, recordTemplateUse, resetTemplateUseCounts }
}
