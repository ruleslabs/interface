import { Uint256, constants } from '@rulesorg/sdk-core'
import { MessageSigningData } from 'src/graphql/data/__generated__/types-and-hooks'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'
import { Call, uint256 } from 'starknet'

export function getVoucherRedeemCall(
  receiver: string,
  tokenId: Uint256 | string,
  amount: number,
  voucherSigningData: MessageSigningData
): Call {
  const u256TokenId = typeof tokenId === 'string' ? uint256.bnToUint256(tokenId) : tokenId

  return {
    contractAddress: constants.RULES_TOKENS_ADDRESSES[rulesSdk.networkInfos.starknetChainId],
    entrypoint: 'redeem_voucher',
    calldata: [
      { receiver },

      { tokenIdLow: u256TokenId.low },
      { tokenIdHigh: u256TokenId.high },

      { amountLow: amount },
      { amountHigh: 0 },

      { salt: voucherSigningData.salt },

      { voucherSignatureLen: 2 },
      { voucherSignatureR: voucherSigningData.signature.r },
      { voucherSignatureS: voucherSigningData.signature.s },
    ],
  }
}
