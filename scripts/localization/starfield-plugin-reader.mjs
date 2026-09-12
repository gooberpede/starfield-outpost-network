/**
 * Purpose: Read only the small Starfield plugin surface needed by localization provenance.
 * Architecture: Binary framing is independent from semantic field selection.
 * Change this file when: Audited record framing changes or another safe reader primitive is required.
 */
import fs from 'node:fs'
import zlib from 'node:zlib'

export const RECORD_HEADER_SIZE = 24
export const COMPRESSED_RECORD_FLAG = 0x00040000
export const SUPPORTED_RECORD_SIGNATURES = new Set([
  'IRES', 'BIOM', 'PERK', 'STDT', 'PNDT',
  // Parcel C5 follows only the record relationships required to classify the
  // canonical organic-species population and locate its final FULL provider.
  'FLOR', 'NPC_', 'LVLN', 'KYWD', 'OMOD', 'INNR',
])

export class PluginReaderError extends Error {
  constructor(code, message, context = {}, cause) {
    super(`${code}: ${message}`, cause ? { cause } : undefined)
    this.name = 'PluginReaderError'
    this.code = code
    this.context = context
  }
}

export function formatHex32(value) {
  return (value >>> 0).toString(16).toUpperCase().padStart(8, '0')
}

function signatureAt(buffer, offset) {
  return buffer.toString('ascii', offset, offset + 4)
}

function framingError(message, context) {
  return new PluginReaderError('PLUGIN_TRUNCATED', message, context)
}

export function decodeRecordHeader(buffer, offset = 0, boundary = buffer.length) {
  if (offset < 0 || boundary > buffer.length || offset + RECORD_HEADER_SIZE > boundary) {
    throw framingError('A complete 24-byte record/group header is not available.', { offset, boundary })
  }
  const signature = signatureAt(buffer, offset)
  const dataSize = buffer.readUInt32LE(offset + 4)
  if (signature === 'GRUP') {
    return {
      kind: 'group',
      signature,
      offset,
      totalSize: dataSize,
      labelHex: buffer.subarray(offset + 8, offset + 12).toString('hex').toUpperCase(),
      groupType: buffer.readInt32LE(offset + 12),
    }
  }
  return {
    kind: 'record',
    signature,
    offset,
    dataSize,
    flags: buffer.readUInt32LE(offset + 8),
    formId: buffer.readUInt32LE(offset + 12),
  }
}

export function decodeRecordPayload(payload, metadata = {}) {
  if ((metadata.flags & COMPRESSED_RECORD_FLAG) === 0) return payload
  if (payload.length < 4) {
    throw new PluginReaderError('RECORD_DECOMPRESSION_FAILED', 'Compressed record has no size prefix.', metadata)
  }
  const expectedSize = payload.readUInt32LE(0)
  let inflated
  try {
    inflated = zlib.inflateSync(payload.subarray(4))
  } catch (cause) {
    throw new PluginReaderError('RECORD_DECOMPRESSION_FAILED', 'Could not inflate compressed record.', metadata, cause)
  }
  if (inflated.length !== expectedSize) {
    throw new PluginReaderError(
      'RECORD_SIZE_MISMATCH',
      `Inflated record size ${inflated.length} does not match declared size ${expectedSize}.`,
      metadata,
    )
  }
  return inflated
}

export function decodeSubrecords(payload, recordContext = {}) {
  const subrecords = []
  let offset = 0
  let extendedSize = null

  while (offset < payload.length) {
    if (payload.length - offset < 6) {
      throw new PluginReaderError('SUBRECORD_TRUNCATED', 'Incomplete subrecord header.', {
        ...recordContext, byteOffset: offset,
      })
    }
    const headerOffset = offset
    const signature = signatureAt(payload, offset)
    const declaredSize = payload.readUInt16LE(offset + 4)
    offset += 6

    if (signature === 'XXXX') {
      if (extendedSize !== null || declaredSize !== 4 || offset + 4 > payload.length) {
        throw new PluginReaderError('SUBRECORD_TRUNCATED', 'Malformed XXXX extended-size marker.', {
          ...recordContext, byteOffset: headerOffset,
        })
      }
      extendedSize = payload.readUInt32LE(offset)
      subrecords.push({ signature, offset: headerOffset, size: 4, data: payload.subarray(offset, offset + 4) })
      offset += 4
      if (offset === payload.length) {
        throw new PluginReaderError('XXXX_WITHOUT_FOLLOWING_SUBRECORD', 'XXXX has no following subrecord.', {
          ...recordContext, byteOffset: headerOffset,
        })
      }
      continue
    }

    const size = extendedSize ?? declaredSize
    extendedSize = null
    if (offset + size > payload.length) {
      throw new PluginReaderError('SUBRECORD_TRUNCATED', 'Subrecord payload exceeds record bounds.', {
        ...recordContext, byteOffset: headerOffset, subrecordSignature: signature, declaredSize: size,
      })
    }
    subrecords.push({ signature, offset: headerOffset, size, data: payload.subarray(offset, offset + size) })
    offset += size
  }
  return subrecords
}

function selectorKey(selector) {
  if (!SUPPORTED_RECORD_SIGNATURES.has(selector.signature)) {
    throw new PluginReaderError(
      'UNSUPPORTED_RECORD_SIGNATURE',
      `Record signature ${selector.signature} is not allowlisted for localized-name provenance.`,
      selector,
    )
  }
  return `${selector.signature}:${selector.formId >>> 0}`
}

function selectedRecord(header, payload, groupAncestry, plugin) {
  const context = {
    plugin,
    recordSignature: header.signature,
    formId: formatHex32(header.formId),
    byteOffset: header.offset,
  }
  const decodedPayload = decodeRecordPayload(payload, { ...context, flags: header.flags })
  return {
    signature: header.signature,
    formId: header.formId >>> 0,
    formIdHex: formatHex32(header.formId),
    flags: header.flags >>> 0,
    dataSize: header.dataSize,
    compressed: (header.flags & COMPRESSED_RECORD_FLAG) !== 0,
    fileOffset: header.offset,
    groupAncestry,
    payload: decodedPayload,
    subrecords: decodeSubrecords(decodedPayload, context),
  }
}

function validateSelections(selectors) {
  const wanted = new Map()
  for (const selector of selectors) wanted.set(selectorKey(selector), selector)
  return wanted
}

function finishSelections(wanted, found, plugin) {
  for (const [key, records] of found) {
    if (records.length > 1) {
      throw new PluginReaderError('RECORD_SELECTION_AMBIGUOUS', `Multiple records matched ${key}.`, { plugin, key })
    }
  }
  const missing = [...wanted.keys()].filter((key) => !found.has(key))
  if (missing.length > 0) {
    throw new PluginReaderError('RECORD_NOT_FOUND', `Requested record(s) not found: ${missing.join(', ')}.`, {
      plugin, missing,
    })
  }
  return [...wanted.keys()].map((key) => found.get(key)[0])
}

export function findRecordsInBuffer(buffer, selectors, plugin = '<buffer>') {
  const wanted = validateSelections(selectors)
  const found = new Map()

  function scan(start, end, ancestry) {
    let offset = start
    while (offset < end) {
      const header = decodeRecordHeader(buffer, offset, end)
      if (header.kind === 'group') {
        if (header.totalSize < RECORD_HEADER_SIZE || offset + header.totalSize > end) {
          throw framingError('Group size exceeds its containing boundary.', { plugin, byteOffset: offset })
        }
        const group = { labelHex: header.labelHex, groupType: header.groupType, fileOffset: offset }
        scan(offset + RECORD_HEADER_SIZE, offset + header.totalSize, [...ancestry, group])
        offset += header.totalSize
        continue
      }
      const recordEnd = offset + RECORD_HEADER_SIZE + header.dataSize
      if (recordEnd > end) throw framingError('Record payload exceeds its containing boundary.', { plugin, byteOffset: offset })
      const key = `${header.signature}:${header.formId >>> 0}`
      if (wanted.has(key)) {
        const record = selectedRecord(header, buffer.subarray(offset + RECORD_HEADER_SIZE, recordEnd), ancestry, plugin)
        found.set(key, [...(found.get(key) ?? []), record])
      }
      offset = recordEnd
    }
  }

  scan(0, buffer.length, [])
  return finishSelections(wanted, found, plugin)
}

function readExactly(fd, size, position, context) {
  const buffer = Buffer.allocUnsafe(size)
  const bytesRead = fs.readSync(fd, buffer, 0, size, position)
  if (bytesRead !== size) throw framingError('Plugin ended before the declared bytes could be read.', context)
  return buffer
}

function scanPlugin(pluginPath, shouldSelect) {
  const found = []
  const fd = fs.openSync(pluginPath, fs.constants.O_RDONLY)
  try {
    const fileSize = fs.fstatSync(fd).size
    function scan(start, end, ancestry) {
      let offset = start
      while (offset < end) {
        if (end - offset < RECORD_HEADER_SIZE) {
          throw framingError('Incomplete record/group header.', { plugin: pluginPath, byteOffset: offset })
        }
        const headerBuffer = readExactly(fd, RECORD_HEADER_SIZE, offset, { plugin: pluginPath, byteOffset: offset })
        const header = decodeRecordHeader(headerBuffer)
        header.offset = offset
        if (header.kind === 'group') {
          if (header.totalSize < RECORD_HEADER_SIZE || offset + header.totalSize > end) {
            throw framingError('Group size exceeds its containing boundary.', { plugin: pluginPath, byteOffset: offset })
          }
          const group = { labelHex: header.labelHex, groupType: header.groupType, fileOffset: offset }
          scan(offset + RECORD_HEADER_SIZE, offset + header.totalSize, [...ancestry, group])
          offset += header.totalSize
          continue
        }
        const recordEnd = offset + RECORD_HEADER_SIZE + header.dataSize
        if (recordEnd > end) throw framingError('Record payload exceeds its containing boundary.', { plugin: pluginPath, byteOffset: offset })
        if (shouldSelect(header)) {
          const payload = readExactly(fd, header.dataSize, offset + RECORD_HEADER_SIZE, {
            plugin: pluginPath, byteOffset: offset,
          })
          found.push(selectedRecord(header, payload, ancestry, pluginPath))
        }
        offset = recordEnd
      }
    }
    scan(0, fileSize, [])
    return found
  } finally {
    fs.closeSync(fd)
  }
}

export function findAvailableRecordsInPlugin(pluginPath, selectors) {
  const wanted = validateSelections(selectors)
  const found = new Map()
  for (const record of scanPlugin(pluginPath, (header) => wanted.has(`${header.signature}:${header.formId >>> 0}`))) {
    const key = `${record.signature}:${record.formId}`
    found.set(key, [...(found.get(key) ?? []), record])
  }
  for (const [key, records] of found) {
    if (records.length > 1) throw new PluginReaderError('RECORD_SELECTION_AMBIGUOUS', `Multiple records matched ${key}.`, { plugin: pluginPath, key })
  }
  return [...wanted.keys()].flatMap((key) => found.get(key) ?? [])
}

export function findRecordsInPlugin(pluginPath, selectors) {
  const wanted = validateSelections(selectors)
  const records = findAvailableRecordsInPlugin(pluginPath, selectors)
  const found = new Map(records.map((record) => [`${record.signature}:${record.formId}`, [record]]))
  return finishSelections(wanted, found, pluginPath)
}

/** C5-only bounded relationship scan; callers supply the exact required signatures. */
export function findRecordsBySignaturesInPlugin(pluginPath, signatures) {
  const allowed = new Set(signatures)
  for (const signature of allowed) selectorKey({ signature, formId: 0 })
  return scanPlugin(pluginPath, (header) => allowed.has(header.signature))
}

/** C3-only population scan: system stars must be joined by numeric STDT.DNAM. */
export function findStarRecordsInPlugin(pluginPath) {
  return scanPlugin(pluginPath, (header) => header.signature === 'STDT')
}
