import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearDraft, getDraft, saveDraft } from '../draft-store'

const DATE = '2026-05-21'

beforeEach(async () => {
  await clearDraft(DATE)
})

afterEach(async () => {
  await clearDraft(DATE)
})

describe('getDraft', () => {
  it('returns null when no draft is stored', async () => {
    expect(await getDraft(DATE)).toBeNull()
  })
})

describe('saveDraft / getDraft round-trip', () => {
  it('stores and retrieves a draft', async () => {
    await saveDraft(DATE, { response: 'hello world', taskDone: true, checkinWord: 'calm' })
    const draft = await getDraft(DATE)
    expect(draft).toEqual({ response: 'hello world', taskDone: true, checkinWord: 'calm' })
  })

  it('overwrites an existing draft', async () => {
    await saveDraft(DATE, { response: 'first', taskDone: false, checkinWord: '' })
    await saveDraft(DATE, { response: 'second', taskDone: true, checkinWord: 'steady' })
    expect(await getDraft(DATE)).toEqual({ response: 'second', taskDone: true, checkinWord: 'steady' })
  })
})

describe('clearDraft', () => {
  it('removes a stored draft', async () => {
    await saveDraft(DATE, { response: 'to delete', taskDone: false, checkinWord: '' })
    await clearDraft(DATE)
    expect(await getDraft(DATE)).toBeNull()
  })

  it('is idempotent when no draft exists', async () => {
    await expect(clearDraft(DATE)).resolves.toBeUndefined()
  })
})
