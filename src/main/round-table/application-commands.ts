import {
  roundTableApplicationCommandContracts,
  type RoundTableCatalog,
  type RoundTableConcludeRequest,
  type RoundTableReply,
  type RoundTableTurnRequest
} from '../../shared/round-table'
import {
  defineApplicationCommand,
  defineApplicationCommandGroup,
  type ApplicationCommandInstallation,
  type ApplicationCommandRegistrar
} from '../application-command-router'

type RoundTableCommandOwner = Readonly<{
  catalog(): Promise<RoundTableCatalog>
  turn(request: RoundTableTurnRequest): Promise<RoundTableReply>
  conclude(request: RoundTableConcludeRequest): Promise<RoundTableReply>
}>

const roundTableApplicationCommands = Object.freeze({
  catalog: defineApplicationCommand<'round-table:catalog', readonly [], RoundTableCatalog>(
    'round-table:catalog',
    roundTableApplicationCommandContracts.catalog
  ),
  turn: defineApplicationCommand<
    'round-table:turn',
    readonly [RoundTableTurnRequest],
    RoundTableReply
  >('round-table:turn', roundTableApplicationCommandContracts.turn),
  conclude: defineApplicationCommand<
    'round-table:conclude',
    readonly [RoundTableConcludeRequest],
    RoundTableReply
  >('round-table:conclude', roundTableApplicationCommandContracts.conclude)
})

const roundTableApplicationCommandGroup = defineApplicationCommandGroup('round-table', [
  roundTableApplicationCommands.catalog,
  roundTableApplicationCommands.conclude,
  roundTableApplicationCommands.turn
] as const)

const registerRoundTableApplicationCommands = (
  registrar: ApplicationCommandRegistrar,
  owner: RoundTableCommandOwner
): ApplicationCommandInstallation => {
  const scope = registrar.createScope()
  try {
    scope.registerGroup(roundTableApplicationCommandGroup, {
      'round-table:catalog': () => owner.catalog(),
      'round-table:turn': ({ args }) => owner.turn(args[0]),
      'round-table:conclude': ({ args }) => owner.conclude(args[0])
    })
    return scope.complete()
  } catch (error) {
    scope.rollback()
    throw error
  }
}

export {
  registerRoundTableApplicationCommands,
  roundTableApplicationCommandGroup,
  roundTableApplicationCommands
}
export type { RoundTableCommandOwner }
