/** Narrow, read-only BA2 GNRL reader for build-time localization inputs. */
import { closeSync, fstatSync, openSync, readSync } from 'node:fs'
import path from 'node:path'
import { inflateRawSync, inflateSync } from 'node:zlib'

const MAGIC = 'BTDX'
const SUPPORTED_VERSION = 2
const SUPPORTED_TYPE = 'GNRL'
const HEADER_SIZE = 32
const RECORD_SIZE = 36
const RECORD_SENTINEL = 0xBAADF00D
const TABLE_TYPES = new Set(['strings', 'dlstrings', 'ilstrings'])

export class Ba2LocalizationError extends Error {
  constructor(code, message, context = {}) {
    const details = Object.entries(context)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(', ')
    super(`${code}: ${message}${details ? ` (${details})` : ''}`)
    this.name = 'Ba2LocalizationError'
    this.code = code
    this.context = context
  }
}

function readExact(handle, length, position, context = {}) {
  const buffer = Buffer.alloc(length)
  const bytesRead = readSync(handle, buffer, 0, length, position)
  if (bytesRead !== length) {
    throw new Ba2LocalizationError('BA2_MEMBER_TRUNCATED', `Expected ${length} bytes at offset ${position}, received ${bytesRead}.`, context)
  }
  return buffer
}

function safeNumber(value, label, context) {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Ba2LocalizationError('BA2_MEMBER_TRUNCATED', `${label} exceeds the supported file-offset range.`, context)
  }
  return Number(value)
}

export function normalizeArchiveMemberName(value) {
  return value.replaceAll('\\', '/').replace(/^\/+/, '')
}

export function pluginBase(plugin) {
  const filename = path.basename(plugin)
  if (!/\.esm$/i.test(filename)) {
    throw new Ba2LocalizationError('PLUGIN_BASE_MISMATCH', 'Plugin name must end in .esm.', { plugin })
  }
  return filename.slice(0, -4).toLowerCase()
}

export function parseLocalizationMember(memberName) {
  const basename = path.posix.basename(normalizeArchiveMemberName(memberName))
  const match = basename.match(/^(.+)_([^_.]+)\.(strings|dlstrings|ilstrings)$/i)
  return match ? { base: match[1].toLowerCase(), locale: match[2].toLowerCase(), tableType: match[3].toLowerCase() } : null
}

export function inspectBa2(archivePath) {
  const archiveFilename = path.basename(archivePath)
  const handle = openSync(archivePath, 'r')
  try {
    const fileSize = fstatSync(handle).size
    if (fileSize < HEADER_SIZE) {
      throw new Ba2LocalizationError('BA2_MEMBER_TRUNCATED', 'Archive has no complete v2 header.', { archiveFilename })
    }
    const header = readExact(handle, HEADER_SIZE, 0, { archiveFilename })
    const magic = header.toString('ascii', 0, 4)
    if (magic !== MAGIC) throw new Ba2LocalizationError('BA2_INVALID_HEADER', `Expected ${MAGIC}, received ${JSON.stringify(magic)}.`, { archiveFilename })
    const version = header.readUInt32LE(4)
    if (version !== SUPPORTED_VERSION) {
      throw new Ba2LocalizationError('BA2_UNSUPPORTED_VERSION', `Only BA2 v${SUPPORTED_VERSION} is supported; received v${version}.`, { archiveFilename })
    }
    const archiveType = header.toString('ascii', 8, 12)
    if (archiveType !== SUPPORTED_TYPE) {
      throw new Ba2LocalizationError('BA2_UNSUPPORTED_TYPE', `Only ${SUPPORTED_TYPE} archives are supported; received ${JSON.stringify(archiveType)}.`, { archiveFilename })
    }
    const memberCount = header.readUInt32LE(12)
    const nameTableOffset = safeNumber(header.readBigUInt64LE(16), 'Name-table offset', { archiveFilename })
    const compressionFormat = header.readUInt32LE(24)
    const recordTableEnd = HEADER_SIZE + memberCount * RECORD_SIZE
    if (recordTableEnd > fileSize || nameTableOffset < recordTableEnd || nameTableOffset > fileSize) {
      throw new Ba2LocalizationError('BA2_MEMBER_TRUNCATED', 'Record or name table lies outside the archive.', { archiveFilename })
    }
    const recordTable = readExact(handle, memberCount * RECORD_SIZE, HEADER_SIZE, { archiveFilename })
    const nameTable = readExact(handle, fileSize - nameTableOffset, nameTableOffset, { archiveFilename })
    const members = []
    let nameOffset = 0
    for (let index = 0; index < memberCount; index += 1) {
      if (nameOffset + 2 > nameTable.length) {
        throw new Ba2LocalizationError('BA2_MEMBER_TRUNCATED', 'Member name length is truncated.', { archiveFilename, memberIndex: index })
      }
      const nameLength = nameTable.readUInt16LE(nameOffset)
      nameOffset += 2
      if (nameOffset + nameLength > nameTable.length) {
        throw new Ba2LocalizationError('BA2_MEMBER_TRUNCATED', 'Member name is truncated.', { archiveFilename, memberIndex: index })
      }
      const memberName = normalizeArchiveMemberName(nameTable.toString('utf8', nameOffset, nameOffset + nameLength))
      nameOffset += nameLength
      const recordOffset = index * RECORD_SIZE
      const dataOffset = safeNumber(recordTable.readBigUInt64LE(recordOffset + 16), 'Member offset', { archiveFilename, memberName })
      const packedSize = recordTable.readUInt32LE(recordOffset + 24)
      const unpackedSize = recordTable.readUInt32LE(recordOffset + 28)
      const sentinel = recordTable.readUInt32LE(recordOffset + 32)
      if (sentinel !== RECORD_SENTINEL) {
        throw new Ba2LocalizationError('BA2_INVALID_HEADER', 'GNRL member record has an invalid sentinel.', { archiveFilename, memberName })
      }
      const storedSize = packedSize || unpackedSize
      if (dataOffset + storedSize > fileSize || dataOffset < recordTableEnd) {
        throw new Ba2LocalizationError('BA2_MEMBER_TRUNCATED', 'Member data lies outside the archive.', { archiveFilename, memberName })
      }
      members.push({ index, memberName, dataOffset, packedSize, unpackedSize, compressed: packedSize !== 0 })
    }
    return { archivePath, archiveFilename, size: fileSize, version, archiveType, compressionFormat, memberCount, members }
  } finally {
    closeSync(handle)
  }
}

export function extractBa2Member(archive, member) {
  const context = { archiveFilename: archive.archiveFilename, memberName: member.memberName }
  const handle = openSync(archive.archivePath, 'r')
  try {
    const stored = readExact(handle, member.packedSize || member.unpackedSize, member.dataOffset, context)
    if (!member.compressed) return stored
    const attempts = [inflateSync, inflateRawSync]
    for (const inflate of attempts) {
      try {
        const unpacked = inflate(stored)
        if (unpacked.length === member.unpackedSize) return unpacked
      } catch {
        // Try the other zlib framing used by supported GNRL producers.
      }
    }
    throw new Ba2LocalizationError('BA2_DECOMPRESSION_FAILED', `Could not inflate ${member.packedSize} bytes to ${member.unpackedSize} bytes.`, context)
  } finally {
    closeSync(handle)
  }
}

export function discoverLocalizationMembers(archives, plugin, languages, { requireLanguages = false } = {}) {
  const expectedBase = pluginBase(plugin)
  const requested = new Set(languages.map((value) => value.toLowerCase()))
  const matches = new Map()
  const observedLocalizationMembers = []
  for (const archive of archives) {
    for (const member of archive.members) {
      const identity = parseLocalizationMember(member.memberName)
      if (!identity) continue
      observedLocalizationMembers.push({ archiveFilename: archive.archiveFilename, memberName: member.memberName, ...identity })
      if (identity.base !== expectedBase || !requested.has(identity.locale) || !TABLE_TYPES.has(identity.tableType)) continue
      const key = `${identity.locale}:${identity.tableType}`
      if (matches.has(key)) {
        const previous = matches.get(key)
        throw new Ba2LocalizationError('LOCALIZATION_TABLE_AMBIGUOUS', 'Multiple members map to the same plugin, locale, and table type.', {
          plugin, locale: identity.locale, tableType: identity.tableType,
          archiveFilename: archive.archiveFilename, memberName: member.memberName,
          previousArchiveFilename: previous.archive.archiveFilename, previousMemberName: previous.member.memberName,
        })
      }
      matches.set(key, { archive, member, ...identity })
    }
  }
  const missingLanguages = [...requested].filter((locale) => ![...matches.values()].some((item) => item.locale === locale))
  if (requireLanguages && missingLanguages.length) {
    throw new Ba2LocalizationError('LANGUAGE_NOT_FOUND', 'No matching localization table was found for a requested language.', {
      plugin, pluginBase: expectedBase, locale: missingLanguages[0], archives: archives.map((item) => item.archiveFilename),
    })
  }
  return { plugin, pluginBase: expectedBase, matches: [...matches.values()], missingLanguages, observedLocalizationMembers }
}
