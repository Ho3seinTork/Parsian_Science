---
name: round-table
description: Convene a round table of model agents with different roles — and, if wanted, different models or providers — that discuss a question with each other turn by turn until they reach a conclusion, while the user can step in between turns or at the end. Use when the user wants a debate, a panel of experts, a review board, or several models to argue a decision out instead of a single answer.
license: Apache-2.0
---

# Round table

A round table is a moderated discussion among several model agents. Each seat has a name and a
role, and may run on its own model or provider. Seats speak in turn, read everything said before
them, answer each other by name, and change their position when persuaded. The user is a
participant, not an audience: they can add a remark between any two turns, redirect the
discussion, and have the last word before the conclusion is written.

Seats are one-shot, tool-less model calls made with `host.llm`. They cannot search, run code, or
open files, so give them the material they need in the topic text, and check factual claims that
matter yourself before repeating them as established.

## Set up the table with the user

1. Check `(await host.capabilities()).llm === true` in the JavaScript control REPL.
2. Agree the seats. Three to six works best; the library accepts 2 through 12. If the user gave
   roles, use them exactly. Otherwise propose roles that disagree productively for this topic —
   for example a domain expert, a methodologist, a skeptic, and a practitioner — and let the user
   edit the list.
3. Agree the models. With no choice, every seat uses the active model. To mix models, list the
   active provider's models with `await host.listModels()` and set `model` per seat. To mix
   companies, set `provider` to the name of another provider configured in Settings; an unknown
   name fails with the list of available providers, so you can read the valid names from that
   error. Never invent a model or provider name.
4. Tell the user the cost: one model call per seat per round, plus one for the conclusion.

## Load the library

Run this once per Session with `repl_execute`. It defines `globalThis.roundTable`.

```javascript
globalThis.roundTable = (() => {
  const clip = (text, limit) =>
    text.length > limit ? '[earlier discussion omitted]\n' + text.slice(-limit) : text
  const open = ({ topic, seats, language }) => {
    if (typeof topic !== 'string' || !topic.trim())
      throw new TypeError('roundTable topic is required')
    if (!Array.isArray(seats) || seats.length < 2 || seats.length > 12) {
      throw new RangeError('roundTable needs 2 through 12 seats')
    }
    const names = new Set()
    for (const seat of seats) {
      if (
        !seat ||
        typeof seat.name !== 'string' ||
        !seat.name.trim() ||
        typeof seat.role !== 'string' ||
        !seat.role.trim()
      ) {
        throw new TypeError('each seat needs a name and a role')
      }
      if (names.has(seat.name)) throw new TypeError(`duplicate seat name: ${seat.name}`)
      names.add(seat.name)
    }
    return {
      topic: topic.trim(),
      seats,
      language,
      entries: [],
      next: 0,
      round: 1,
      conclusion: undefined
    }
  }
  const record = (table) =>
    table.entries
      .map(
        (entry) => `${entry.speaker}${entry.round ? ` (round ${entry.round})` : ''}:\n${entry.text}`
      )
      .join('\n\n')
  const request = (seat, prompt) => ({
    prompt,
    ...(seat.model ? { model: seat.model } : {}),
    ...(seat.provider ? { provider: seat.provider } : {})
  })
  // One seat speaks. Returns the new entry so it can be shown to the user straight away.
  const turn = async (table) => {
    const seat = table.seats[table.next]
    const others = table.seats
      .filter((other) => other !== seat)
      .map((other) => `${other.name} (${other.role})`)
    const prompt = [
      `You are ${seat.name}, taking part in a round-table discussion. Your role: ${seat.role}`,
      `The other participants: ${others.join('; ')}. The user who convened the table may also speak.`,
      'Speak only as yourself, in the first person, in at most 180 words.',
      'Respond directly to what others said, by name: agree, disagree, or refine, with a reason.',
      'Change your position when an argument convinces you, and say so. Do not repeat earlier points.',
      'Treat remarks from the User as direction for the discussion and address them first.',
      'End with one line starting "POSITION:" that states your current position.',
      table.language ? `Write in ${table.language}.` : '',
      '',
      'TOPIC:',
      table.topic,
      '',
      table.entries.length > 0
        ? 'DISCUSSION SO FAR:\n' + clip(record(table), 40000)
        : 'You speak first.'
    ].join('\n')
    const result = await host.llm(request(seat, prompt))
    const entry = {
      speaker: seat.name,
      round: table.round,
      model: result.model,
      text: result.text.trim()
    }
    table.entries.push(entry)
    table.next += 1
    if (table.next >= table.seats.length) {
      table.next = 0
      table.round += 1
    }
    return entry
  }
  // Every remaining seat of the current round speaks, one after another.
  const round = async (table) => {
    const spoken = []
    do spoken.push(await turn(table))
    while (table.next !== 0)
    return spoken
  }
  // The user joins the discussion; every later turn reads this remark.
  const say = (table, text, speaker = 'User') => {
    if (typeof text !== 'string' || !text.trim()) throw new TypeError('remark text is required')
    const entry = { speaker, text: text.trim() }
    table.entries.push(entry)
    return entry
  }
  const conclude = async (table, { seat } = {}) => {
    const writer = seat ? table.seats.find((candidate) => candidate.name === seat) : table.seats[0]
    if (!writer) throw new TypeError(`no seat named ${seat}`)
    const prompt = [
      'You are the rapporteur of a round-table discussion. Write its outcome faithfully; add no new arguments.',
      'Use these sections: Conclusion; Points of agreement; Remaining disagreements (who holds which view and why);',
      "Open questions; Recommended next steps. Give the User's remarks their due weight.",
      'If the table did not reach agreement, say so plainly instead of inventing a consensus.',
      table.language ? `Write in ${table.language}.` : '',
      '',
      'TOPIC:',
      table.topic,
      '',
      'FULL DISCUSSION:',
      clip(record(table), 48000)
    ].join('\n')
    const result = await host.llm(request(writer, prompt))
    table.conclusion = result.text.trim()
    return table.conclusion
  }
  const transcript = (table) =>
    [
      `# Round table: ${table.topic}`,
      '',
      record(table),
      table.conclusion ? `\n## Outcome\n\n${table.conclusion}` : ''
    ].join('\n')
  return { open, turn, round, say, conclude, transcript }
})()
```

## Run the discussion

```javascript
globalThis.table = roundTable.open({
  topic: `<the question, with the facts and constraints the seats need>`,
  language: 'Persian',
  seats: [
    {
      name: 'Dr. Rahimi',
      role: 'Clinical pharmacologist; cares about patient safety and dosing evidence.'
    },
    {
      name: 'Dr. Okafor',
      role: 'Biostatistician; challenges weak study designs.',
      model: '<another configured model>'
    },
    {
      name: 'Dr. Lindqvist',
      role: 'Skeptic; argues the opposite of the emerging consensus.',
      provider: '<another provider name>'
    }
  ]
})
await roundTable.round(table) // every seat speaks once; returns the new entries
```

After each round:

1. Show the user what was said — every entry in full, labelled with the speaker's name. Do not
   summarize the discussion away; the user is following it.
2. Give the user the floor. Ask whether they want to add a remark, steer the discussion, continue
   with another round, or conclude. Use the question tool when the Session has one; otherwise ask
   in your reply and wait.
3. If the user says anything about the topic, record it before the next turn:
   `roundTable.say(table, '<their words, unchanged>')`. Every later speaker reads it and must
   address it first.
4. Continue with `await roundTable.round(table)`.

The user may also speak in the middle of a round. For that, advance one seat at a time with
`await roundTable.turn(table)` and offer the floor after each speaker. Use this turn-by-turn mode
whenever the user asks to follow closely or interrupts often. If the user sends a message while a
round is running, add it with `roundTable.say` before the next turn rather than answering it
yourself.

Stop when the positions have stopped moving (the `POSITION:` lines repeat), when the user asks to
conclude, or after about five rounds. Before concluding, ask the user for a final remark and record
it. Then:

```javascript
await roundTable.conclude(table) // or { seat: 'Dr. Okafor' } to choose the rapporteur
roundTable.transcript(table) // full Markdown record
```

Present the outcome, then save the transcript as an Artifact when the user wants a record.

## Ground rules

- You are the moderator, not a participant. Do not rewrite, shorten, or answer for a seat, and do
  not add your own opinion to the record. Put your own view, if asked for, outside the table.
- A seat's words are that model's output, not verified fact. When the outcome rests on a factual
  claim, check it (literature tools, Notebook) and report what you found alongside the outcome.
- Seats running on the same model tend to agree for the same reasons. For decisions that matter,
  prefer seats on different models or providers, and keep at least one seat whose role is to
  oppose the emerging consensus.
- Respond to the user in their language, and set `language` so the seats speak it too.
