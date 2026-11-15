import type {
  RoundTableCatalog,
  RoundTableConcludeRequest,
  RoundTableReply,
  RoundTableTurnRequest
} from '../round-table'

import { callable, RUNTIME_VALIDATED, WEB } from './definition'

export const contracts = {
  'roundTable.catalog': callable<() => Promise<RoundTableCatalog>>()('round-table', [
    'round-table:catalog',
    WEB,
    undefined,
    undefined,
    RUNTIME_VALIDATED
  ]),
  'roundTable.turn': callable<(request: RoundTableTurnRequest) => Promise<RoundTableReply>>()(
    'round-table',
    ['round-table:turn', WEB, undefined, undefined, RUNTIME_VALIDATED]
  ),
  'roundTable.conclude': callable<
    (request: RoundTableConcludeRequest) => Promise<RoundTableReply>
  >()('round-table', ['round-table:conclude', WEB, undefined, undefined, RUNTIME_VALIDATED])
} as const
