import type {
  RoundTableConcludeRequest,
  RoundTableEntry,
  RoundTableTurnRequest
} from '../../shared/round-table'

// Prompts stay well under the host.llm 64 KiB prompt limit: the oldest discussion is dropped first,
// because recent turns already answer and summarize it.
const RECORD_BUDGET = 40_000

export const formatRecord = (entries: readonly RoundTableEntry[]): string =>
  entries
    .map((entry) =>
      entry.round === undefined
        ? `${entry.speaker} (the user who convened the table):\n${entry.text}`
        : `${entry.speaker} (round ${entry.round}):\n${entry.text}`
    )
    .join('\n\n')

const recentRecord = (entries: readonly RoundTableEntry[]): string => {
  const record = formatRecord(entries)
  if (record.length <= RECORD_BUDGET) return record
  return `[earlier discussion omitted]\n${record.slice(record.length - RECORD_BUDGET)}`
}

const languageLine = (language: string | undefined): string[] =>
  language ? [`Write in ${language}.`] : []

export const turnPrompt = (request: RoundTableTurnRequest): string => {
  const seat = request.seats[request.seatIndex]!
  const others = request.seats
    .filter((_, index) => index !== request.seatIndex)
    .map((other) => `${other.name} (${other.role})`)
  return [
    `You are ${seat.name}, taking part in a round-table discussion. Your role: ${seat.role}`,
    `The other participants: ${others.join('; ')}. The user who convened the table may also speak.`,
    'Speak only as yourself, in the first person, in at most 180 words.',
    'Respond directly to what others said, by name: agree, disagree, or refine, with a reason.',
    'Change your position when an argument convinces you, and say so. Do not repeat earlier points.',
    "Address the user's remarks first: they steer the discussion.",
    'End with one line starting "POSITION:" that states your current position.',
    ...languageLine(request.language),
    '',
    'TOPIC:',
    request.topic,
    '',
    request.entries.length > 0
      ? `DISCUSSION SO FAR:\n${recentRecord(request.entries)}`
      : 'You speak first.'
  ].join('\n')
}

export const conclusionPrompt = (request: RoundTableConcludeRequest): string =>
  [
    'You are the rapporteur of a round-table discussion. Write its outcome faithfully; add no new arguments.',
    'Use these sections: Conclusion; Points of agreement; Remaining disagreements (who holds which view and why);',
    "Open questions; Recommended next steps. Give the user's remarks their due weight.",
    'If the table did not reach agreement, say so plainly instead of inventing a consensus.',
    ...languageLine(request.language),
    '',
    'TOPIC:',
    request.topic,
    '',
    'PARTICIPANTS:',
    ...request.seats.map((seat) => `- ${seat.name}: ${seat.role}`),
    '',
    'FULL DISCUSSION:',
    recentRecord(request.entries)
  ].join('\n')
