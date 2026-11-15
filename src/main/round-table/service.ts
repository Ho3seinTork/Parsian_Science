import type { HostModelService } from '../notebook/host-model-service'
import type {
  RoundTableCatalog,
  RoundTableConcludeRequest,
  RoundTableReply,
  RoundTableSeat,
  RoundTableTurnRequest
} from '../../shared/round-table'
import { conclusionPrompt, turnPrompt } from './prompts'

type RoundTableModelPort = Pick<HostModelService, 'call' | 'catalog'>

// Runs round-table turns through the same tool-less, catalog-validated inference path as host.llm.
// Each call is stateless; the renderer owns the discussion.
export class RoundTableService {
  constructor(private readonly model: RoundTableModelPort) {}

  async catalog(): Promise<RoundTableCatalog> {
    const catalog = await this.model.catalog()
    return {
      ...(catalog.activeProviderId ? { activeProviderId: catalog.activeProviderId } : {}),
      providers: catalog.providers.map((provider) => ({
        id: provider.id,
        name: provider.name,
        models: [...provider.models]
      }))
    }
  }

  turn(request: RoundTableTurnRequest): Promise<RoundTableReply> {
    return this.ask(turnPrompt(request), request.seats[request.seatIndex]!)
  }

  conclude(request: RoundTableConcludeRequest): Promise<RoundTableReply> {
    return this.ask(conclusionPrompt(request), request.seats[request.rapporteurIndex]!)
  }

  private async ask(prompt: string, seat: RoundTableSeat): Promise<RoundTableReply> {
    const result = await this.model.call({
      request: {
        prompt,
        ...(seat.model ? { model: seat.model } : {}),
        ...(seat.provider ? { provider: seat.provider } : {})
      }
    })
    if (Array.isArray(result)) throw new Error('Round table received an unexpected batch result.')
    const single = result as Exclude<typeof result, readonly unknown[]>
    const text = single.text.trim()
    if (!text)
      throw new Error('The model returned an empty reply. Try again or choose another model.')
    return { text, model: single.model }
  }
}
