---
name: agent-swarm
description: Attack one hard question with many independent model agents at once — from 3 up to 3,000 — then filter their answers through judged tournament rounds and synthesize the survivors. Use for open problems, proofs and conjectures, hypothesis generation, design-space exploration, or any task where many diverse attempts beat one careful attempt.
license: Apache-2.0
---

# Agent swarm

One model answering once explores one line of thought. A swarm sends the same problem to many
independent agents, each steered toward a different approach, and then spends further model calls
on selection: small juries compare the attempts, only the strongest advance, and a final call
writes the answer from the survivors. The value comes from breadth plus ruthless filtering, not from
any single agent.

The agents are one-shot, tool-less model calls made with `host.llm`. They cannot search the web,
run code, or read files. Put everything an agent needs into the task text, and verify the swarm's
final claims yourself (Notebook, literature tools) before presenting them as established. For a few
workers that need tools, use `host.delegate` instead; it admits at most four children per batch.

## Before you start

1. Check availability in the JavaScript control REPL: `(await host.capabilities()).llm === true`.
2. Agree the size with the user. Every agent is a paid model call, and judging adds roughly 20% on
   top. `swarm.plan()` returns the exact number of calls. For more than 50 agents, state that
   number and get an explicit go-ahead before running.
3. Write the task as a self-contained brief: the exact question, known facts and constraints, what
   a good answer contains, and the output format. Agents see nothing else.

Size guide: 3–12 for a second opinion, 30–100 for real diversity on a research question, 300–3,000
only for genuinely open problems where a rare good idea justifies the cost.

## Load the library

Run this once per Session with `repl_execute`. It defines `globalThis.swarm`.

```javascript
globalThis.swarm = (() => {
  const BATCH = 32
  const JURY = 6
  const LENSES = [
    'Work from first principles and derive the answer step by step.',
    'Look for a counterexample or a reason the obvious answer fails, then answer.',
    'Reduce the problem to a known, solved problem and transfer that solution.',
    'Start from the simplest special case, solve it exactly, then generalize.',
    'Work backwards from what a complete answer must contain.',
    'Use an analogy from a different field, then check where the analogy breaks.',
    'Be the skeptic: list what could make each approach wrong, then give the safest answer.',
    'Propose the boldest non-obvious idea you can defend, with its main risk.'
  ]
  const clip = (text, limit) =>
    text.length > limit ? text.slice(0, limit) + '\n[truncated]' : text
  const groups = (items, size) => {
    const out = []
    for (let index = 0; index < items.length; index += size)
      out.push(items.slice(index, index + size))
    return out
  }
  const request = (state, prompt) => ({
    prompt,
    ...(state.model ? { model: state.model } : {}),
    ...(state.provider ? { provider: state.provider } : {})
  })
  const ask = async (state, prompts) => {
    const answers = []
    for (const part of groups(prompts, BATCH)) {
      const results = await host.llm(
        part.map((prompt) => request(state, prompt)),
        { maxConcurrency: 4 }
      )
      for (const result of results) answers.push(result.error ? undefined : result.text)
      state.calls += part.length
    }
    return answers
  }
  const rounds = (count, keep) => {
    const sizes = []
    for (let size = count; size > keep; size = Math.max(keep, Math.ceil(size / JURY) * 2)) {
      sizes.push(Math.ceil(size / JURY))
    }
    return sizes
  }
  const plan = ({ agents, keep = Math.min(5, agents - 1) }) => {
    const judging = rounds(agents, keep).reduce((sum, size) => sum + size, 0)
    return { agents, judgingCalls: judging, synthesisCalls: 1, totalCalls: agents + judging + 1 }
  }
  const start = ({ task, agents, lenses = LENSES, keep = Math.min(5, agents - 1), model, provider }) => {
    if (typeof task !== 'string' || !task.trim()) throw new TypeError('swarm task is required')
    if (!Number.isInteger(agents) || agents < 3 || agents > 3000) {
      throw new RangeError('swarm agents must be an integer from 3 through 3000')
    }
    if (!Number.isInteger(keep) || keep < 1 || keep >= agents) {
      throw new RangeError('swarm keep must be an integer from 1 up to agents - 1')
    }
    return {
      task: clip(task.trim(), 20000),
      agents,
      lenses,
      keep,
      model,
      provider,
      stage: 'explore',
      explored: 0,
      attempts: [],
      failed: 0,
      round: 0,
      calls: 0,
      final: undefined
    }
  }
  const explore = async (state, budget) => {
    const count = Math.min(budget, state.agents - state.explored)
    const first = state.explored
    const prompts = Array.from({ length: count }, (_, offset) => {
      const index = first + offset
      return [
        `You are agent ${index + 1} of ${state.agents} working independently on the same problem.`,
        `Your approach: ${state.lenses[index % state.lenses.length]}`,
        'Give your best complete answer. State your key assumption and how confident you are.',
        '',
        'PROBLEM:',
        state.task
      ].join('\n')
    })
    const answers = await ask(state, prompts)
    answers.forEach((text, offset) => {
      if (text && text.trim()) state.attempts.push({ id: first + offset + 1, text: text.trim() })
      else state.failed += 1
    })
    state.explored += count
    if (state.explored >= state.agents)
      state.stage = state.attempts.length > state.keep ? 'judge' : 'synthesize'
    return count
  }
  const judge = async (state) => {
    const juries = groups(state.attempts, JURY)
    const prompts = juries.map((jury) =>
      [
        'You are a strict judge. Below are independent answers to the same problem.',
        'Pick the two answers most likely to be correct and useful. Prefer sound reasoning over',
        'confident tone, and penalize unsupported claims.',
        'Reply with JSON only: {"best":[<answer number>,<answer number>],"reason":"<one sentence>"}',
        '',
        'PROBLEM:',
        clip(state.task, 6000),
        '',
        ...jury.map((attempt, index) => `ANSWER ${index + 1}:\n${clip(attempt.text, 5000)}\n`)
      ].join('\n')
    )
    const verdicts = await ask(state, prompts)
    const survivors = []
    juries.forEach((jury, index) => {
      let picks = []
      try {
        const parsed = JSON.parse((verdicts[index] ?? '').match(/\{[\s\S]*\}/)?.[0] ?? '{}')
        picks = (Array.isArray(parsed.best) ? parsed.best : [])
          .filter((pick) => Number.isInteger(pick) && pick >= 1 && pick <= jury.length)
          .slice(0, 2)
      } catch {
        picks = []
      }
      // A jury that failed to answer keeps its first two answers rather than losing the group.
      const kept =
        picks.length > 0 ? [...new Set(picks)] : [1, 2].filter((pick) => pick <= jury.length)
      for (const pick of kept) survivors.push(jury[pick - 1])
    })
    state.attempts = survivors
    state.round += 1
    if (state.attempts.length <= state.keep) state.stage = 'synthesize'
    return prompts.length
  }
  const synthesize = async (state) => {
    const share = Math.floor(48000 / Math.max(1, state.attempts.length))
    const [text] = await ask(state, [
      [
        `These ${state.attempts.length} answers survived ${state.round} judging rounds out of ${state.agents} independent attempts.`,
        'Write the final answer to the problem. Use the strongest reasoning, say where the answers',
        'agree, name any disagreement that remains, and state what is still unverified.',
        '',
        'PROBLEM:',
        clip(state.task, 8000),
        '',
        ...state.attempts.map(
          (attempt) => `ANSWER FROM AGENT ${attempt.id}:\n${clip(attempt.text, share)}\n`
        )
      ].join('\n')
    ])
    state.final = text
    state.stage = 'done'
    return 1
  }
  // Advances the swarm by at most maxCalls model calls, so one REPL cell stays short.
  const run = async (state, { maxCalls = 96 } = {}) => {
    let used = 0
    while (state.stage !== 'done' && used < maxCalls) {
      if (state.stage === 'explore') used += await explore(state, maxCalls - used)
      else if (state.stage === 'judge') used += await judge(state)
      else used += await synthesize(state)
    }
    return {
      stage: state.stage,
      explored: state.explored,
      failed: state.failed,
      surviving: state.attempts.length,
      judgingRounds: state.round,
      callsSoFar: state.calls,
      final: state.final
    }
  }
  return { plan, start, run, LENSES }
})()
```

## Run a swarm

```javascript
swarm.plan({ agents: 100 }) // { agents: 100, judgingCalls: 25, synthesisCalls: 1, totalCalls: 126 }
globalThis.job = swarm.start({ task: `<self-contained brief>`, agents: 100 })
await swarm.run(job) // repeat this line until stage is 'done'
```

`swarm.run(job)` spends at most 96 model calls per execution and then returns progress, so a large
swarm takes several executions; call it again until `stage` is `'done'`, and report progress to the
user between calls for large runs. The state lives in `globalThis.job`, so an interrupted run
resumes where it stopped. `job.final` holds the synthesized answer and `job.attempts` the surviving
answers with the number of the agent that wrote each.

Options for `swarm.start`:

- `agents` — 3 through 3000.
- `keep` — how many answers reach the final synthesis (default 5, or `agents - 1` for smaller swarms).
- `lenses` — an array of approach instructions that replaces the eight defaults; agents cycle
  through them. Write problem-specific lenses when you know the plausible lines of attack.
- `model`, `provider` — run the whole swarm on a specific configured model or provider instead of
  the active one. An unknown name fails with the list of available names.

## Reporting

Tell the user how many agents ran, how many calls were used, how many answers failed, and how many
judging rounds there were. Present `job.final` as the swarm's conclusion, then add your own check:
which claims you verified, how, and which remain unverified. Agreement among agents that share one
model is not independent confirmation, and a swarm can converge on a shared mistake. For numeric or
formal results, recompute or re-derive the key step in the Notebook before reporting it as correct.

Respond in the user's language. When the user writes in Persian, write the task brief in the
language that suits the subject (English for most technical literature), and report in Persian.
