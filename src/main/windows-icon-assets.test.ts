import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const projectRoot = process.env['WINDOWS_ICON_TEST_ROOT']
  ? resolve(process.env['WINDOWS_ICON_TEST_ROOT'])
  : resolve(__dirname, '../..')

type IcoEntry = {
  width: number
  height: number
  bitCount: number
  byteSize: number
  imageOffset: number
}

const APP_ICON_SIZES = [16, 20, 24, 30, 32, 36, 40, 48, 60, 64, 72, 80, 96, 128, 256]
const TRAY_ICON_SIZES = [16, 20, 24, 32, 40, 48, 64, 256]
const LIGHT_SMALL_FRAME_HASHES = {
  16: 'df3e31f4c62b4902a6e3fb1c317eeb1a34d2ae0f157f05d5ad93c0a171cd5d08',
  20: 'f5bde12e3801efa4a2129e63881e0fb619fd9069b09dd145d7b11b94012ac457',
  24: '06ce4c01b7b637e2deb6883c0fa84bfca1af59b143cbfc959c101f727c8bb27f'
}
const DARK_SMALL_FRAME_HASHES = {
  16: 'df3e31f4c62b4902a6e3fb1c317eeb1a34d2ae0f157f05d5ad93c0a171cd5d08',
  20: 'f5bde12e3801efa4a2129e63881e0fb619fd9069b09dd145d7b11b94012ac457',
  24: '06ce4c01b7b637e2deb6883c0fa84bfca1af59b143cbfc959c101f727c8bb27f'
}
const ICON_ASSETS = [
  {
    relativePath: 'build/icon.ico',
    expectedSizes: APP_ICON_SIZES,
    expectedSha256: 'f70677a1b48d55f10da68caf2f8d968737491f1f3ca6f3b13b156a7a4f94e9aa'
  },
  {
    relativePath: 'resources/icon-light.ico',
    expectedSizes: APP_ICON_SIZES,
    expectedSha256: 'f70677a1b48d55f10da68caf2f8d968737491f1f3ca6f3b13b156a7a4f94e9aa'
  },
  {
    relativePath: 'resources/icon-dark.ico',
    expectedSizes: APP_ICON_SIZES,
    expectedSha256: 'f70677a1b48d55f10da68caf2f8d968737491f1f3ca6f3b13b156a7a4f94e9aa'
  },
  {
    relativePath: 'resources/tray-light.ico',
    expectedSizes: TRAY_ICON_SIZES,
    expectedSha256: 'd9974068780cf4ef2c73fc50844e71901c1923240a9a7fe591d5e048f71d4c4b'
  },
  {
    relativePath: 'resources/tray-dark.ico',
    expectedSizes: TRAY_ICON_SIZES,
    expectedSha256: 'd9974068780cf4ef2c73fc50844e71901c1923240a9a7fe591d5e048f71d4c4b'
  }
]

const readIco = (
  relativePath: string
): { bytes: Buffer; reserved: number; type: number; entries: IcoEntry[] } => {
  const bytes = readFileSync(resolve(projectRoot, relativePath))
  const count = bytes.readUInt16LE(4)
  const entries = Array.from({ length: count }, (_, index) => {
    const offset = 6 + index * 16
    return {
      width: bytes[offset] || 256,
      height: bytes[offset + 1] || 256,
      bitCount: bytes.readUInt16LE(offset + 6),
      byteSize: bytes.readUInt32LE(offset + 8),
      imageOffset: bytes.readUInt32LE(offset + 12)
    }
  })

  return {
    bytes,
    reserved: bytes.readUInt16LE(0),
    type: bytes.readUInt16LE(2),
    entries
  }
}

describe('Windows icon assets', () => {
  it.each(ICON_ASSETS)('ships the approved multi-size ICO in $relativePath', (asset) => {
    const { bytes, reserved, type, entries } = readIco(asset.relativePath)
    const directoryEnd = 6 + entries.length * 16

    expect(reserved).toBe(0)
    expect(type).toBe(1)
    expect(entries.map(({ width }) => width).sort((a, b) => a - b)).toEqual(asset.expectedSizes)
    expect(entries.every(({ width, height }) => width === height)).toBe(true)
    expect(entries.every(({ bitCount }) => bitCount === 32)).toBe(true)
    expect(
      entries.every(
        ({ byteSize, imageOffset }) =>
          imageOffset >= directoryEnd && imageOffset + byteSize <= bytes.length
      )
    ).toBe(true)
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(asset.expectedSha256)
  })

  it('keeps the packaged default synchronized with the light icon', () => {
    expect(readFileSync(resolve(projectRoot, 'build/icon.ico'))).toEqual(
      readFileSync(resolve(projectRoot, 'resources/icon-light.ico'))
    )
  })

  it.each([
    { relativePath: 'build/icon.ico', expectedHashes: LIGHT_SMALL_FRAME_HASHES },
    { relativePath: 'resources/icon-light.ico', expectedHashes: LIGHT_SMALL_FRAME_HASHES },
    { relativePath: 'resources/icon-dark.ico', expectedHashes: DARK_SMALL_FRAME_HASHES }
  ])('keeps the approved small frames of $relativePath', (asset) => {
    const { bytes, entries } = readIco(asset.relativePath)
    const smallFrameHashes = Object.fromEntries(
      entries
        .filter(({ width }) => width in asset.expectedHashes)
        .map(({ width, byteSize, imageOffset }) => [
          width,
          createHash('sha256')
            .update(bytes.subarray(imageOffset, imageOffset + byteSize))
            .digest('hex')
        ])
    )

    expect(smallFrameHashes).toEqual(asset.expectedHashes)
  })
})
