import { Abi, AbiEntry, Calldata, StructAbi } from 'starknet'

export interface StructsAbi {
  [name: string]: AbiEntry[]
}

export interface Call {
  address: string
  selector: string
  outputsAbi: AbiEntry[]
  structsAbi: StructsAbi
  calldata: Calldata
}

export function toCallKey(call: Call): string {
  return [
    call.address,
    call.selector,
    JSON.stringify(call.outputsAbi),
    JSON.stringify(call.structsAbi),
    JSON.stringify(call.calldata),
  ].join('-')
}

export function parseCallKey(key: string): Call {
  const splittedKey = key.split('-')
  if (splittedKey.length !== 5) throw 'Invalid key'

  return {
    address: splittedKey[0],
    selector: splittedKey[1],
    outputsAbi: JSON.parse(splittedKey[2]),
    structsAbi: JSON.parse(splittedKey[3]),
    calldata: JSON.parse(splittedKey[4]),
  }
}

export function getStructsAbiFromAbiEntries(abi: Abi, outputsAbi?: AbiEntry[]): StructsAbi {
  if (!outputsAbi) return {}

  return outputsAbi.reduce<StructsAbi>((acc, { type }: { type: string }) => {
    if (type === 'felt' || type === 'felt*' || type.indexOf('(') !== -1) return acc // not a struct

    const structName = type.replace('*', '')
    if (!!acc[structName]) return acc // already added

    const struct = abi.find((abi) => abi.name === structName) as StructAbi
    acc[structName] = struct.members.map<AbiEntry>((member) => ({ name: member.name, type: member.type }))

    return { ...acc, ...getStructsAbiFromAbiEntries(abi, acc[structName]) }
  }, {})
}
