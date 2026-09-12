/** Read an explicitly mapped Bethesda string table without archive discovery. */
import { readFileSync } from 'node:fs'
import path from 'node:path'

const TABLE_TYPES = new Set(['strings', 'dlstrings', 'ilstrings'])

export class StringTableError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`)
    this.code = code
  }
}

export function readStringTable(filePath, expectedType = path.extname(filePath).slice(1).toLowerCase()) {
  if (!TABLE_TYPES.has(expectedType)) {
    throw new StringTableError('WRONG_TABLE', `Unsupported string-table type ${expectedType}.`)
  }
  if (path.extname(filePath).slice(1).toLowerCase() !== expectedType) {
    throw new StringTableError('WRONG_TABLE', `${path.basename(filePath)} is not a .${expectedType} table.`)
  }
  const buffer = readFileSync(filePath)
  if (buffer.length < 8) throw new StringTableError('UNSUPPORTED_RECORD_SHAPE', `${path.basename(filePath)} has no complete header.`)
  const count = buffer.readUInt32LE(0)
  const dataSize = buffer.readUInt32LE(4)
  const dataStart = 8 + count * 8
  if (dataStart > buffer.length || dataStart + dataSize > buffer.length) {
    throw new StringTableError('UNSUPPORTED_RECORD_SHAPE', `${path.basename(filePath)} has invalid directory/data bounds.`)
  }
  const decoder = new TextDecoder('windows-1252')
  const values = new Map()
  for (let index = 0; index < count; index += 1) {
    const entry = 8 + index * 8
    const id = buffer.readUInt32LE(entry) >>> 0
    const valueOffset = dataStart + buffer.readUInt32LE(entry + 4)
    if (valueOffset >= dataStart + dataSize) {
      throw new StringTableError('UNSUPPORTED_RECORD_SHAPE', `String ${id} points outside ${path.basename(filePath)}.`)
    }
    let bytes
    if (expectedType === 'strings') {
      let end = valueOffset
      while (end < dataStart + dataSize && buffer[end] !== 0) end += 1
      if (end === dataStart + dataSize) throw new StringTableError('UNSUPPORTED_RECORD_SHAPE', `String ${id} is unterminated.`)
      bytes = buffer.subarray(valueOffset, end)
    } else {
      if (valueOffset + 4 > buffer.length) throw new StringTableError('UNSUPPORTED_RECORD_SHAPE', `String ${id} has no length.`)
      const length = buffer.readUInt32LE(valueOffset)
      if (length < 1 || valueOffset + 4 + length > dataStart + dataSize) {
        throw new StringTableError('UNSUPPORTED_RECORD_SHAPE', `String ${id} has invalid length.`)
      }
      bytes = buffer.subarray(valueOffset + 4, valueOffset + 3 + length)
    }
    if (values.has(id)) throw new StringTableError('UNSUPPORTED_RECORD_SHAPE', `Duplicate string ID ${id}.`)
    values.set(id, decoder.decode(bytes))
  }
  return values
}
