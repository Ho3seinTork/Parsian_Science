import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Copy,
  LoaderCircle,
  MessageSquarePlus,
  Plus,
  Square,
  StepForward,
  Trash2,
  Users,
  X
} from 'lucide-react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useLocaleStore } from '@/stores/locale-store'
import { useNavigationStore } from '@/stores/navigation-store'
import { useProjectStore } from '@/stores/project-store'
import { LOCALE_SELF_NAMES, type Locale } from '../../../../shared/locale'
import {
  ROUND_TABLE_MAX_SEATS,
  type RoundTableCatalog,
  type RoundTableSeat
} from '../../../../shared/round-table'
import {
  seatProblem,
  transcriptMarkdown,
  useRoundTableStore,
  type RoundTableDiscussion
} from './round-table-store'

const ACTIVE_PROVIDER = '__active-provider__'
const PROVIDER_DEFAULT = '__provider-default__'
const LANGUAGES: readonly { value: string; locale: Locale }[] = [
  { value: 'Persian', locale: 'fa-IR' },
  { value: 'English', locale: 'en' }
]

const researchPanel = (t: TFunction): RoundTableSeat[] => [
  { name: t('Domain expert'), role: t('Brings the strongest field knowledge and evidence.') },
  { name: t('Methodologist'), role: t('Checks study design, data and statistics.') },
  { name: t('Skeptic'), role: t('Argues against the emerging consensus and looks for flaws.') },
  { name: t('Practitioner'), role: t('Judges what is feasible and useful in practice.') }
]

const firstLine = (text: string): string => text.trim().split('\n')[0] ?? ''

// Seats end their turn with a "POSITION:" line. Show it as its own labelled line so a Persian
// position is not laid out around an English label.
const splitPosition = (text: string): { body: string; position?: string } => {
  const match = /\n?\s*POSITION:\s*(.+?)\s*$/su.exec(text)
  if (!match || match.index === undefined) return { body: text }
  return { body: text.slice(0, match.index).trimEnd(), position: match[1] }
}

const EntryText = ({ text }: { text: string }): React.JSX.Element => {
  const { t } = useTranslation()
  const { body, position } = splitPosition(text)
  return (
    <>
      {body ? <p className="text-sm leading-7 whitespace-pre-wrap">{body}</p> : null}
      {position ? (
        <p className="mt-2 border-t border-border-200 pt-2 text-sm">
          <span className="font-semibold text-primary">{t('Position')}</span>
          <span className="text-text-300"> · </span>
          <span>{position}</span>
        </p>
      ) : null}
    </>
  )
}

export const RoundTablePage = (): React.JSX.Element => {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.locale)
  const returnToProject = useNavigationStore((state) => state.returnToProject)
  const activeProjectId = useNavigationStore((state) => state.activeProjectId)
  const hasActiveProject = useProjectStore((state) =>
    state.projects.some(
      (project) => project.id === activeProjectId && project.archivedAt === undefined
    )
  )
  const returnLabel = hasActiveProject ? t('Back to Project') : t('Back to Home')
  const discussions = useRoundTableStore((state) => state.discussions)
  const activeId = useRoundTableStore((state) => state.activeId)
  const activity = useRoundTableStore((state) => state.activity)
  const create = useRoundTableStore((state) => state.create)
  const select = useRoundTableStore((state) => state.select)
  const remove = useRoundTableStore((state) => state.remove)
  const loadCatalog = useRoundTableStore((state) => state.loadCatalog)
  const active = discussions.find((item) => item.id === activeId)

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  const startNew = (): void =>
    create({ language: locale === 'fa-IR' ? 'Persian' : 'English', seats: researchPanel(t) })

  return (
    <div className="flex h-svh min-h-0 overflow-hidden bg-bg-10 text-text-000">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border-300/80 bg-bg-000 px-3 py-3 max-md:w-48">
        <div className="mb-3 flex min-h-10 items-center gap-2 px-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg-200 text-primary">
            <Users className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">{t('Round table')}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {t('Agents in different roles discuss your question.')}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mb-2 h-9 w-full justify-start gap-2 px-3"
          onClick={() => returnToProject('user')}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{returnLabel}</span>
        </Button>
        <Button
          variant="outline"
          className="mb-3 h-9 w-full justify-start gap-2 px-3"
          onClick={startNew}
          disabled={activity.kind !== 'idle'}
        >
          <Plus className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t('New discussion')}</span>
        </Button>
        <nav
          aria-label={t('Discussions')}
          className="min-h-0 flex-1 overflow-y-auto border-t border-border pt-3"
        >
          <ul className="flex flex-col gap-1">
            {discussions.map((discussion) => (
              <li key={discussion.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => select(discussion.id)}
                  aria-current={discussion.id === activeId ? 'page' : undefined}
                  className={cn(
                    'min-h-9 min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-200',
                    discussion.id === activeId && 'bg-bg-200 font-medium'
                  )}
                >
                  {firstLine(discussion.topic) || t('Untitled discussion')}
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label={t('Delete discussion')}
                  title={t('Delete discussion')}
                  onClick={() => remove(discussion.id)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        {!active ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-bg-200 text-primary">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <div className="max-w-md">
              <h2 className="text-lg font-semibold">{t('Round table')}</h2>
              <p className="mt-1 text-sm text-text-100">
                {t('Each turn is one model call. You can add your remark between any two turns.')}
              </p>
            </div>
            <Button onClick={startNew}>
              <Plus className="size-4" aria-hidden="true" />
              {t('New discussion')}
            </Button>
          </div>
        ) : active.started ? (
          <DiscussionPanel discussion={active} />
        ) : (
          <SetupPanel discussion={active} />
        )}
      </main>
    </div>
  )
}

const SetupPanel = ({ discussion }: { discussion: RoundTableDiscussion }): React.JSX.Element => {
  const { t } = useTranslation()
  const update = useRoundTableStore((state) => state.update)
  const start = useRoundTableStore((state) => state.start)
  const catalog = useRoundTableStore((state) => state.catalog)
  const catalogError = useRoundTableStore((state) => state.catalogError)
  const problem = seatProblem(discussion.seats)
  const noModel = catalog !== undefined && catalog.providers.length === 0
  const canStart = Boolean(discussion.topic.trim()) && !problem && !noModel

  const setSeat = (index: number, patch: Partial<RoundTableSeat>): void =>
    update({
      seats: discussion.seats.map((seat, current) => {
        if (current !== index) return seat
        const next = { ...seat, ...patch }
        // Undefined clears a choice; keep the stored object free of empty keys.
        if (next.provider === undefined) delete next.provider
        if (next.model === undefined) delete next.model
        return next
      })
    })

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <section className="flex flex-col gap-2">
          <label htmlFor="round-table-topic" className="text-sm font-medium">
            {t('Topic')}
          </label>
          <Textarea
            id="round-table-topic"
            value={discussion.topic}
            onChange={(event) => update({ topic: event.target.value })}
            placeholder={t('State the question and the facts the participants need.')}
            className="min-h-28"
          />
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t('Discussion language')}</span>
          <Select value={discussion.language} onValueChange={(language) => update({ language })}>
            <SelectTrigger aria-label={t('Discussion language')} className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {LOCALE_SELF_NAMES[language.locale]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">{t('Participants')}</h2>
            <Button variant="outline" size="sm" onClick={() => update({ seats: researchPanel(t) })}>
              {t('Fill with the research panel')}
            </Button>
          </div>
          {discussion.seats.map((seat, index) => (
            <SeatEditor
              key={index}
              seat={seat}
              catalog={catalog}
              canRemove={discussion.seats.length > 2}
              onChange={(patch) => setSeat(index, patch)}
              onRemove={() =>
                update({ seats: discussion.seats.filter((_, current) => current !== index) })
              }
            />
          ))}
          <Button
            variant="ghost"
            className="self-start"
            disabled={discussion.seats.length >= ROUND_TABLE_MAX_SEATS}
            onClick={() => update({ seats: [...discussion.seats, { name: '', role: '' }] })}
          >
            <Plus className="size-4" aria-hidden="true" />
            {t('Add participant')}
          </Button>
        </section>

        {catalogError || noModel || problem ? (
          <p
            role="status"
            className="rounded-lg bg-status-warning-surface px-3 py-2 text-sm text-status-warning-foreground dark:bg-status-warning-dark-surface dark:text-status-warning-dark-foreground"
          >
            {catalogError ??
              (noModel
                ? t('No model is connected. Add one in Settings to start.')
                : problem === 'count'
                  ? t('At least two participants are needed.')
                  : t('Give every participant a unique name and a role.'))}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button onClick={start} disabled={!canStart}>
            {t('Start discussion')}
          </Button>
        </div>
      </div>
    </div>
  )
}

const SeatEditor = ({
  seat,
  catalog,
  canRemove,
  onChange,
  onRemove
}: {
  seat: RoundTableSeat
  catalog: RoundTableCatalog | undefined
  canRemove: boolean
  onChange: (patch: Partial<RoundTableSeat>) => void
  onRemove: () => void
}): React.JSX.Element => {
  const { t } = useTranslation()
  const providerId = seat.provider ?? catalog?.activeProviderId
  const models = catalog?.providers.find((provider) => provider.id === providerId)?.models ?? []
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border-200 bg-bg-000 p-3">
      <div className="flex items-start gap-2">
        <Input
          value={seat.name}
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder={t('Name')}
          aria-label={t('Name')}
          className="w-44 shrink-0"
        />
        <Textarea
          value={seat.role}
          onChange={(event) => onChange({ role: event.target.value })}
          placeholder={t('Role')}
          aria-label={t('Role')}
          className="min-h-9 flex-1"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-1 shrink-0"
          disabled={!canRemove}
          aria-label={t('Remove participant')}
          title={t('Remove participant')}
          onClick={onRemove}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          value={seat.provider ?? ACTIVE_PROVIDER}
          onValueChange={(value) =>
            onChange({
              provider: value === ACTIVE_PROVIDER ? undefined : value,
              model: undefined
            })
          }
        >
          <SelectTrigger aria-label={t('Provider')} className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ACTIVE_PROVIDER}>{t('Active provider')}</SelectItem>
            {catalog?.providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={seat.model ?? PROVIDER_DEFAULT}
          onValueChange={(value) =>
            onChange({ model: value === PROVIDER_DEFAULT ? undefined : value })
          }
        >
          <SelectTrigger aria-label={t('Model')} className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PROVIDER_DEFAULT}>{t('Provider default')}</SelectItem>
            {models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

const DiscussionPanel = ({
  discussion
}: {
  discussion: RoundTableDiscussion
}): React.JSX.Element => {
  const { t } = useTranslation()
  const activity = useRoundTableStore((state) => state.activity)
  const error = useRoundTableStore((state) => state.error)
  const stopRequested = useRoundTableStore((state) => state.stopRequested)
  const remark = useRoundTableStore((state) => state.remark)
  const nextSpeaker = useRoundTableStore((state) => state.nextSpeaker)
  const runRound = useRoundTableStore((state) => state.runRound)
  const requestStop = useRoundTableStore((state) => state.requestStop)
  const conclude = useRoundTableStore((state) => state.conclude)
  const dismissError = useRoundTableStore((state) => state.dismissError)
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const busy = activity.kind !== 'idle'
  const concluded = discussion.conclusion !== undefined
  const roles = useMemo(
    () => new Map(discussion.seats.map((seat) => [seat.name, seat.role])),
    [discussion.seats]
  )

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end', behavior: 'smooth' })
  }, [discussion.entries.length, discussion.conclusion, activity.kind])

  const addRemark = (): void => {
    remark(draft)
    setDraft('')
  }

  const copyTranscript = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(transcriptMarkdown(discussion, t('You')))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-border-200 px-6 py-4">
        <h2 className="line-clamp-2 text-base font-semibold">{firstLine(discussion.topic)}</h2>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {discussion.seats.map((seat, index) => (
            <li
              key={seat.name}
              className={cn(
                'rounded-full border border-border-200 px-2.5 py-0.5 text-xs',
                !concluded && index === discussion.nextSeat && 'border-primary text-primary'
              )}
              title={seat.role}
            >
              {seat.name}
              {seat.model ? (
                <span className="text-text-300">
                  {' · '}
                  <span data-direction="ltr">{seat.model}</span>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ol className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-6">
          {discussion.entries.map((entry, index) => {
            const isUser = entry.round === undefined
            return (
              <li
                key={index}
                className={cn(
                  'rounded-xl border px-4 py-3',
                  isUser ? 'border-primary/40 bg-accent' : 'border-border-200 bg-bg-000'
                )}
              >
                <div className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs text-text-300">
                  <span className="text-sm font-semibold text-text-000">
                    {isUser ? t('You') : entry.speaker}
                  </span>
                  {isUser ? null : (
                    <>
                      <span>{roles.get(entry.speaker)}</span>
                      <span>{t('Round {{round}}', { round: entry.round })}</span>
                      {entry.model ? <span data-direction="ltr">{entry.model}</span> : null}
                    </>
                  )}
                </div>
                <EntryText text={entry.text} />
              </li>
            )
          })}
          {activity.kind !== 'idle' ? (
            <li role="status" className="flex items-center gap-2 px-1 text-sm text-text-100">
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              {activity.kind === 'speaking'
                ? t('{{name}} is speaking…', { name: activity.seatName })
                : t('Writing the conclusion…')}
            </li>
          ) : null}
          {concluded ? (
            <li className="rounded-xl border border-primary/50 bg-bg-000 px-4 py-3">
              <h3 className="mb-1 text-sm font-semibold text-primary">{t('Outcome')}</h3>
              <p className="text-sm leading-7 whitespace-pre-wrap">{discussion.conclusion}</p>
            </li>
          ) : null}
          <div ref={endRef} />
        </ol>
      </div>

      <footer className="border-t border-border-200 bg-bg-000 px-6 py-3">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-status-failure-surface px-3 py-2 text-sm text-status-failure-foreground dark:bg-status-failure-dark-surface dark:text-status-failure-dark-foreground"
            >
              <span className="flex-1">{error}</span>
              <Button variant="ghost" size="icon-sm" aria-label={t('Close')} onClick={dismissError}>
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ) : null}
          {concluded ? null : (
            <div className="flex items-end gap-2">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) addRemark()
                }}
                placeholder={t('Add your remark. Every later speaker reads it first.')}
                aria-label={t('Your remark')}
                className="max-h-40 min-h-10 flex-1"
              />
              <Button variant="outline" onClick={addRemark} disabled={!draft.trim()}>
                <MessageSquarePlus className="size-4" aria-hidden="true" />
                {t('Add remark')}
              </Button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {concluded ? null : (
              <>
                <Button onClick={() => void runRound()} disabled={busy}>
                  {t('Run a round')}
                </Button>
                <Button variant="outline" onClick={() => void nextSpeaker()} disabled={busy}>
                  <StepForward className="size-4" aria-hidden="true" />
                  {t('Next speaker')}
                </Button>
                {activity.kind === 'speaking' ? (
                  <Button variant="ghost" onClick={requestStop} disabled={stopRequested}>
                    <Square className="size-3.5" aria-hidden="true" />
                    {t('Stop after this turn')}
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => void conclude()}
                  disabled={busy || discussion.entries.length === 0}
                >
                  {t('Conclude')}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              className="ms-auto"
              onClick={() => void copyTranscript()}
              disabled={discussion.entries.length === 0}
            >
              <Copy className="size-4" aria-hidden="true" />
              {copied ? t('Copied') : t('Copy transcript')}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
