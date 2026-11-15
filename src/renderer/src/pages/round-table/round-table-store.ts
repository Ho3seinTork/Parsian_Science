import { create } from 'zustand'

import {
  ROUND_TABLE_MAX_SEATS,
  ROUND_TABLE_MIN_SEATS,
  type RoundTableCatalog,
  type RoundTableEntry,
  type RoundTableSeat
} from '../../../../shared/round-table'

// Discussions live in this renderer: the backend runs one stateless model call per turn. They are
// kept in browser storage as a per-device convenience, so a reload or restart resumes them.

export type RoundTableDiscussion = {
  id: string
  topic: string
  language: string
  seats: RoundTableSeat[]
  entries: RoundTableEntry[]
  round: number
  nextSeat: number
  started: boolean
  conclusion?: string
  updatedAt: number
}

type Activity = { kind: 'idle' } | { kind: 'speaking'; seatName: string } | { kind: 'concluding' }

type RoundTableState = {
  discussions: RoundTableDiscussion[]
  activeId: string | undefined
  catalog: RoundTableCatalog | undefined
  catalogError: string | undefined
  activity: Activity
  error: string | undefined
  stopRequested: boolean
  loadCatalog: () => Promise<void>
  create: (template: Pick<RoundTableDiscussion, 'language' | 'seats'>) => void
  select: (id: string) => void
  remove: (id: string) => void
  update: (patch: Partial<Pick<RoundTableDiscussion, 'topic' | 'language' | 'seats'>>) => void
  start: () => void
  remark: (text: string) => void
  nextSpeaker: () => Promise<void>
  runRound: () => Promise<void>
  requestStop: () => void
  conclude: () => Promise<void>
  dismissError: () => void
}

const STORAGE_KEY = 'persian-science-round-tables'

const load = (): Pick<RoundTableState, 'discussions' | 'activeId'> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { discussions: [], activeId: undefined }
    const parsed = JSON.parse(raw) as { discussions?: RoundTableDiscussion[]; activeId?: string }
    const discussions = Array.isArray(parsed.discussions) ? parsed.discussions : []
    return {
      discussions,
      activeId: discussions.some((item) => item.id === parsed.activeId)
        ? parsed.activeId
        : discussions[0]?.id
    }
  } catch {
    return { discussions: [], activeId: undefined }
  }
}

const save = (state: Pick<RoundTableState, 'discussions' | 'activeId'>): void => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ discussions: state.discussions, activeId: state.activeId })
    )
  } catch {
    // Storage is unavailable or full: the discussion still works for this session.
  }
}

const errorText = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error))
    .replace(/^Error invoking remote method '[^']*':\s*/, '')
    .replace(/^Error:\s*/, '')

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

export const seatProblem = (
  seats: readonly RoundTableSeat[]
): 'count' | 'incomplete' | undefined => {
  if (seats.length < ROUND_TABLE_MIN_SEATS || seats.length > ROUND_TABLE_MAX_SEATS) return 'count'
  const names = seats.map((seat) => seat.name.trim())
  if (
    names.some((name) => !name) ||
    seats.some((seat) => !seat.role.trim()) ||
    new Set(names).size !== names.length
  )
    return 'incomplete'
  return undefined
}

const cleanSeats = (seats: readonly RoundTableSeat[]): RoundTableSeat[] =>
  seats.map((seat) => ({
    name: seat.name.trim(),
    role: seat.role.trim(),
    ...(seat.provider ? { provider: seat.provider } : {}),
    ...(seat.model ? { model: seat.model } : {})
  }))

export const transcriptMarkdown = (discussion: RoundTableDiscussion, you: string): string =>
  [
    `# ${discussion.topic.split('\n')[0]}`,
    '',
    discussion.topic,
    '',
    '## Participants',
    '',
    ...discussion.seats.map(
      (seat) => `- **${seat.name}** — ${seat.role}${seat.model ? ` (${seat.model})` : ''}`
    ),
    '',
    '## Discussion',
    '',
    ...discussion.entries.map((entry) =>
      entry.round === undefined
        ? `**${you}:**\n\n${entry.text}\n`
        : `**${entry.speaker}** (${entry.round}${entry.model ? `, ${entry.model}` : ''}):\n\n${entry.text}\n`
    ),
    ...(discussion.conclusion ? ['## Outcome', '', discussion.conclusion, ''] : [])
  ].join('\n')

export const useRoundTableStore = create<RoundTableState>((set, get) => {
  const persist = (): void => save(get())
  const active = (): RoundTableDiscussion | undefined =>
    get().discussions.find((item) => item.id === get().activeId)
  const patchActive = (
    patch: (discussion: RoundTableDiscussion) => Partial<RoundTableDiscussion>
  ): void => {
    set((state) => ({
      discussions: state.discussions.map((item) =>
        item.id === state.activeId ? { ...item, ...patch(item), updatedAt: Date.now() } : item
      )
    }))
    persist()
  }

  // One seat speaks. Returns false when the turn failed, so a running round stops.
  const speak = async (): Promise<boolean> => {
    const discussion = active()
    if (!discussion?.started || discussion.conclusion !== undefined) return false
    const seat = discussion.seats[discussion.nextSeat]!
    set({ activity: { kind: 'speaking', seatName: seat.name }, error: undefined })
    try {
      const reply = await window.api.roundTable.turn({
        topic: discussion.topic,
        ...(discussion.language ? { language: discussion.language } : {}),
        seats: discussion.seats,
        entries: discussion.entries,
        seatIndex: discussion.nextSeat,
        round: discussion.round
      })
      patchActive((current) => {
        const wraps = current.nextSeat + 1 >= current.seats.length
        return {
          entries: [
            ...current.entries,
            { speaker: seat.name, round: current.round, text: reply.text, model: reply.model }
          ],
          nextSeat: wraps ? 0 : current.nextSeat + 1,
          round: wraps ? current.round + 1 : current.round
        }
      })
      return true
    } catch (error) {
      set({ error: errorText(error) })
      return false
    } finally {
      set({ activity: { kind: 'idle' } })
    }
  }

  return {
    ...load(),
    catalog: undefined,
    catalogError: undefined,
    activity: { kind: 'idle' },
    error: undefined,
    stopRequested: false,

    loadCatalog: async () => {
      try {
        set({ catalog: await window.api.roundTable.catalog(), catalogError: undefined })
      } catch (error) {
        set({ catalogError: errorText(error) })
      }
    },

    create: (template) => {
      const discussion: RoundTableDiscussion = {
        id: newId(),
        topic: '',
        language: template.language,
        seats: template.seats,
        entries: [],
        round: 1,
        nextSeat: 0,
        started: false,
        updatedAt: Date.now()
      }
      set((state) => ({
        discussions: [discussion, ...state.discussions],
        activeId: discussion.id,
        error: undefined
      }))
      persist()
    },

    select: (id) => {
      if (get().activity.kind !== 'idle') return
      set({ activeId: id, error: undefined })
      persist()
    },

    remove: (id) => {
      if (get().activity.kind !== 'idle' && get().activeId === id) return
      set((state) => {
        const discussions = state.discussions.filter((item) => item.id !== id)
        return {
          discussions,
          activeId: state.activeId === id ? discussions[0]?.id : state.activeId
        }
      })
      persist()
    },

    update: (patch) => patchActive(() => patch),

    start: () => {
      const discussion = active()
      if (!discussion || !discussion.topic.trim() || seatProblem(discussion.seats)) return
      patchActive((current) => ({
        topic: current.topic.trim(),
        seats: cleanSeats(current.seats),
        started: true
      }))
    },

    remark: (text) => {
      const trimmed = text.trim()
      if (!trimmed) return
      patchActive((current) => ({
        entries: [...current.entries, { speaker: 'User', text: trimmed }]
      }))
    },

    nextSpeaker: async () => {
      if (get().activity.kind !== 'idle') return
      await speak()
    },

    runRound: async () => {
      if (get().activity.kind !== 'idle') return
      set({ stopRequested: false })
      for (;;) {
        if (!(await speak())) break
        if (get().stopRequested || active()?.nextSeat === 0) break
      }
      set({ stopRequested: false })
    },

    requestStop: () => set({ stopRequested: true }),

    conclude: async () => {
      const discussion = active()
      if (!discussion?.started || get().activity.kind !== 'idle') return
      set({ activity: { kind: 'concluding' }, error: undefined })
      try {
        const reply = await window.api.roundTable.conclude({
          topic: discussion.topic,
          ...(discussion.language ? { language: discussion.language } : {}),
          seats: discussion.seats,
          entries: discussion.entries,
          rapporteurIndex: 0
        })
        patchActive(() => ({ conclusion: reply.text }))
      } catch (error) {
        set({ error: errorText(error) })
      } finally {
        set({ activity: { kind: 'idle' } })
      }
    },

    dismissError: () => set({ error: undefined })
  }
})
