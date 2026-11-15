import type { PersianScienceAPI } from '../shared/renderer-contract-catalog'
import type { MacInstallationAssistantResult } from '../shared/mac-installation'

declare global {
  interface Window {
    api: PersianScienceAPI
    installationAssistant: {
      restart: () => void
      continueUsing: () => void
      install: () => Promise<MacInstallationAssistantResult>
      showInFinder: () => void
    }
  }
}

export {}
