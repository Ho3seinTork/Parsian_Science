import { describe, expect, it, vi } from 'vitest'

import {
  roundTableConcludeRequestSchema,
  roundTableTurnRequestSchema,
  type RoundTableTurnRequest
} from '../../shared/round-table'
import { conclusionPrompt, formatRecord, turnPrompt } from './prompts'
import { RoundTableService } from './service'

const request = (overrides: Partial<RoundTableTurnRequest> = {}): RoundTableTurnRequest => ({
  topic: 'Should the trial stop early?',
  language: 'Persian',
  seats: [
    { name: 'Ana', role: 'Statistician' },
    { name: 'Bo', role: 'Clinician', provider: 'Second Lab', model: 'model-x' }
  ],
  entries: [
    { speaker: 'Ana', round: 1, text: 'Interim data are thin.' },
    { speaker: 'User', text: 'Consider patient safety first.' }
  ],
  seatIndex: 1,
  round: 1,
  ...overrides
})

describe('round-table prompts', () => {
  it('speaks as the chosen seat, names the others, and carries the user remark', () => {
    const prompt = turnPrompt(request())
    expect(prompt).toContain(
      'You are Bo, taking part in a round-table discussion. Your role: Clinician'
    )
    expect(prompt).toContain('The other participants: Ana (Statistician).')
    expect(prompt).toContain('Write in Persian.')
    expect(prompt).toContain(
      'User (the user who convened the table):\nConsider patient safety first.'
    )
    expect(prompt).toContain('Ana (round 1):\nInterim data are thin.')
    expect(prompt).toContain('POSITION:')
  })

  it('opens the discussion when nothing has been said and keeps long records bounded', () => {
    expect(turnPrompt(request({ entries: [] }))).toContain('You speak first.')
    const long = Array.from({ length: 30 }, (_, index) => ({
      speaker: 'Ana',
      round: index + 1,
      text: `${index}:` + 'x'.repeat(5000)
    }))
    const prompt = turnPrompt(request({ entries: long }))
    expect(prompt).toContain('[earlier discussion omitted]')
    expect(prompt).toContain('29:')
    expect(Buffer.byteLength(prompt, 'utf8')).toBeLessThan(64 * 1024)
  })

  it('asks the rapporteur for a faithful outcome without inventing consensus', () => {
    const prompt = conclusionPrompt({ ...request(), rapporteurIndex: 0 })
    expect(prompt).toContain('rapporteur')
    expect(prompt).toContain('say so plainly instead of inventing a consensus')
    expect(prompt).toContain('- Bo: Clinician')
    expect(prompt).toContain(formatRecord(request().entries))
  })
})

describe('round-table request validation', () => {
  it('rejects duplicate seat names, out-of-range seats and too few seats', () => {
    expect(roundTableTurnRequestSchema.safeParse(request()).success).toBe(true)
    expect(
      roundTableTurnRequestSchema.safeParse(
        request({
          seats: [
            { name: 'A', role: 'r' },
            { name: 'A', role: 'r' }
          ]
        })
      ).success
    ).toBe(false)
    expect(roundTableTurnRequestSchema.safeParse(request({ seatIndex: 2 })).success).toBe(false)
    expect(
      roundTableTurnRequestSchema.safeParse(
        request({ seats: [{ name: 'A', role: 'r' }], seatIndex: 0 })
      ).success
    ).toBe(false)
    expect(
      roundTableConcludeRequestSchema.safeParse({
        ...request(),
        seatIndex: undefined,
        round: undefined,
        rapporteurIndex: 5
      }).success
    ).toBe(false)
  })
})

describe('RoundTableService', () => {
  it('runs each turn on the seat provider and model and trims the reply', async () => {
    const call = vi.fn(async () => ({
      text: '  I agree with Ana.  ',
      model: 'model-x',
      stopReason: 'end_turn' as const
    }))
    const service = new RoundTableService({ call, catalog: vi.fn() } as never)

    await expect(service.turn(request())).resolves.toEqual({
      text: 'I agree with Ana.',
      model: 'model-x'
    })
    expect(call).toHaveBeenCalledWith({
      request: {
        prompt: expect.stringContaining('You are Bo'),
        model: 'model-x',
        provider: 'Second Lab'
      }
    })

    await service.conclude({ ...request(), rapporteurIndex: 0 })
    expect(call).toHaveBeenLastCalledWith({
      request: { prompt: expect.stringContaining('rapporteur') }
    })
  })

  it('reports an empty reply instead of recording a blank turn', async () => {
    const service = new RoundTableService({
      call: async () => ({ text: '   ', model: 'm', stopReason: 'end_turn' }),
      catalog: vi.fn()
    } as never)
    await expect(service.turn(request())).rejects.toThrow('empty reply')
  })

  it('returns a plain, mutable copy of the model catalog', async () => {
    const service = new RoundTableService({
      call: vi.fn(),
      catalog: async () =>
        Object.freeze({
          activeProviderId: 'p1',
          providers: Object.freeze([
            Object.freeze({ id: 'p1', name: 'Lab', models: Object.freeze(['m1']) })
          ])
        })
    } as never)
    const catalog = await service.catalog()
    expect(catalog).toEqual({
      activeProviderId: 'p1',
      providers: [{ id: 'p1', name: 'Lab', models: ['m1'] }]
    })
    expect(Object.isFrozen(catalog.providers[0]!.models)).toBe(false)
  })
})
