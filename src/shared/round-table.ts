import { z } from 'zod'

import { defineApplicationCommandContract, validationCodec } from './application-command-contract'

// A round table is a moderated discussion among model agents. The renderer owns the discussion
// state; the main process only runs one stateless model call per turn, so a discussion survives
// restarts in the renderer and the backend holds no per-discussion resources.

export const ROUND_TABLE_MIN_SEATS = 2
export const ROUND_TABLE_MAX_SEATS = 12
export const ROUND_TABLE_MAX_ENTRIES = 400
const MAX_TOPIC = 20_000
const MAX_ENTRY = 20_000
const MAX_NAME = 60
const MAX_ROLE = 2_000
const MAX_SELECTION = 200

const trimmed = (max: number): z.ZodString => z.string().trim().min(1).max(max)

export const roundTableSeatSchema = z.strictObject({
  name: trimmed(MAX_NAME),
  role: trimmed(MAX_ROLE),
  provider: trimmed(MAX_SELECTION).optional(),
  model: trimmed(MAX_SELECTION).optional()
})

export const roundTableEntrySchema = z.strictObject({
  speaker: trimmed(MAX_NAME),
  // Absent for the user's remarks; seat turns carry the round they were spoken in.
  round: z.number().int().min(1).max(10_000).optional(),
  text: trimmed(MAX_ENTRY),
  model: z.string().max(MAX_SELECTION).optional()
})

const discussionSchema = {
  topic: trimmed(MAX_TOPIC),
  language: z.string().trim().max(60).optional(),
  seats: z
    .array(roundTableSeatSchema)
    .min(ROUND_TABLE_MIN_SEATS)
    .max(ROUND_TABLE_MAX_SEATS)
    .refine((seats) => new Set(seats.map((seat) => seat.name)).size === seats.length, {
      message: 'Seat names must be unique.'
    }),
  entries: z.array(roundTableEntrySchema).max(ROUND_TABLE_MAX_ENTRIES)
}

export const roundTableTurnRequestSchema = z
  .strictObject({
    ...discussionSchema,
    seatIndex: z.number().int().min(0),
    round: z.number().int().min(1).max(10_000)
  })
  .refine((request) => request.seatIndex < request.seats.length, {
    message: 'seatIndex is out of range.'
  })

export const roundTableConcludeRequestSchema = z
  .strictObject({ ...discussionSchema, rapporteurIndex: z.number().int().min(0) })
  .refine((request) => request.rapporteurIndex < request.seats.length, {
    message: 'rapporteurIndex is out of range.'
  })

export const roundTableReplySchema = z.strictObject({ text: z.string(), model: z.string() })

export const roundTableCatalogSchema = z.strictObject({
  activeProviderId: z.string().optional(),
  providers: z.array(
    z.strictObject({ id: z.string(), name: z.string(), models: z.array(z.string()) })
  )
})

export type RoundTableSeat = z.infer<typeof roundTableSeatSchema>
export type RoundTableEntry = z.infer<typeof roundTableEntrySchema>
export type RoundTableTurnRequest = z.infer<typeof roundTableTurnRequestSchema>
export type RoundTableConcludeRequest = z.infer<typeof roundTableConcludeRequestSchema>
export type RoundTableReply = z.infer<typeof roundTableReplySchema>
export type RoundTableCatalog = z.infer<typeof roundTableCatalogSchema>

export const roundTableApplicationCommandContracts = Object.freeze({
  catalog: defineApplicationCommandContract(
    validationCodec(z.tuple([])),
    validationCodec(roundTableCatalogSchema)
  ),
  turn: defineApplicationCommandContract(
    validationCodec(z.tuple([roundTableTurnRequestSchema])),
    validationCodec(roundTableReplySchema)
  ),
  conclude: defineApplicationCommandContract(
    validationCodec(z.tuple([roundTableConcludeRequestSchema])),
    validationCodec(roundTableReplySchema)
  )
})
