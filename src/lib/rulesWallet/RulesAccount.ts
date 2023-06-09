import { constants } from '@rulesorg/sdk-core'
import { Account, CairoVersion, ProviderInterface, Signer } from 'starknet'

export class RulesAccount extends Account {
  public needSignerUpdate = true
  readonly old?: RulesAccount

  constructor(provider: ProviderInterface, address: string, cairoVersion: CairoVersion, oldAddress?: string) {
    // since account constructor is taking a private key,
    // we set a dummy one (never used anyway)
    // we also assume the cairo account version is 1 if there is an old address
    super(provider, address, constants.DUMMY_PK, cairoVersion)

    console.log(address, oldAddress)

    this.old = oldAddress ? new RulesAccount(provider, oldAddress, '0') : undefined
  }

  public updateSigner(pk: string) {
    this.signer = new Signer(pk)
    this.needSignerUpdate = false

    this.old?.updateSigner(pk)
  }
}
