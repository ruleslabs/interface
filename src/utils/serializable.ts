// https://github.com/reduxjs/redux-toolkit/blob/master/packages/toolkit/src/serializableStateInvariantMiddleware.ts

export default function isPlainObject(value: unknown): value is object {
  if (typeof value !== 'object' || value === null) return false

  const proto = Object.getPrototypeOf(value)
  if (proto === null) return true

  let baseProto = proto
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto)
  }

  return proto === baseProto
}

export function isPlain(val: any) {
  const type = typeof val
  return (
    val == null ||
    type === 'string' ||
    type === 'boolean' ||
    type === 'number' ||
    Array.isArray(val) ||
    isPlainObject(val)
  )
}
