import {
  Account,
  ProviderInterface,
  Signer,
  defaultProvider,
} from 'starknet'

/**
 *  This is the latest Account Object that is imported from starknet.js.
 *  Currently, this Account Object supports transaction v1 introduced with starknet v0.10.0
 */
export class RulesAccount extends Account {
  public needPrivateKey = false

  constructor(address: string, provider?: ProviderInterface) {
    // since account constructor is taking a private key,
    // we set a dummy one (never used anyway)
    super(provider || defaultProvider, address, '0xB00B135')
  }

  public needSignerUpdate = true

  public updateSigner(pk: string) {
    this.signer = new Signer(pk)
    this.needSignerUpdate = false
  }
}
