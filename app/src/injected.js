/* global Process Memory ptr send */

const romNames = {
  // coerce into integers with a dummy OR.
  // [crc1, crc2]
  mm_e_beta: [0x9FC385E5 | 0, 0x3ECC05C7 | 0],
  mm_e_gc: [0x6AECEC4F | 0, 0xF0924814 | 0],
  mm_e_0: [0xE97955C6 | 0, 0xBC338D38 | 0],
  mm_e_1: [0x0A5D8F83 | 0, 0x98C5371A | 0],
  mm_j_gc: [0x8473D0C1 | 0, 0x23120666 | 0],
  mm_j_0: [0xEC417312 | 0, 0xEB31DE5F | 0],
  mm_j_1: [0x69AE0438 | 0, 0x2C63F3F3 | 0],
  mm_u_demo: [0xBF799345 | 0, 0x39FF7A02 | 0],
  mm_u_gc: [0xB443EB08 | 0, 0x4DB31193 | 0],
  mm_u_0: [0x5354631C | 0, 0x03A2DEF0 | 0],
  oot_e_gc: [0x09465AC3 | 0, 0xF8CB501B | 0],
  oot_e_0: [0xB044B569 | 0, 0x373C1985 | 0],
  oot_e_1: [0xB2055FBD | 0, 0x0BAB4E0C | 0],
  oot_j_gc: [0xF611F4BA | 0, 0xC584135C | 0],
  oot_uj_0: [0xEC7011B7 | 0, 0x7616D72B | 0],
  oot_uj_1: [0xD43DA81F | 0, 0x021E1E19 | 0],
  oot_uj_2: [0x693BA2AE | 0, 0xB7F14E9F | 0],
  oot_u_gc: [0xF3DD35BA | 0, 0x4152E075 | 0],
  oot_e_debug: [0x917D18F6 | 0, 0x69BC5453 | 0],
  oot_e_mq: [0x1D4136F3 | 0, 0xAF63EEA9 | 0],
  oot_j_mq: [0xF43B45BA | 0, 0x2F0E9B6F | 0],
  oot_u_mq: [0xF034001A | 0, 0xAE47ED06 | 0],
}

const ramSequenceOffset = 0x20
const ramSequence = [
  0x3C08A460 | 0,
  0x8D080010 | 0,
  0x31080002 | 0,
  0x5500FFFD | 0,
  0x3C08A460 | 0,
  0x24081000 | 0,
  0x010B4020 | 0,
  0x010A4024 | 0,
]

const romSizeTries = [
  // [size, offset]
  [0x2001000, 0x30], // most versions of mupen
  [0x4001000, 0x30], // most versions of mupen
  [0x2000000, 0x10], // Project 64
  [0x4000000, 0x10], // Project 64
]

const ramSizeTries = [
  // [size, offset]
  [0x801000, 0x20],     // mupen64plus
  [0x1A0F000, 0x2180],   // Bizhawk
  [0x800000, 0],        // Project 64
  // NOTE: it might be easier to check 0x8ECA90 instead of using size heuristics.
  [0x1A2A000, 0x468A90], // mupen64-rerecording-v2
  [0x1704000, 0x142A90],
  [0x170C000, 0x142A90],
  // NOTE: it might be easier to check 0x8EBA80 instead of using size heuristics.
  [0x1A57000, 0x468A80], // mupen64-rerecording
  [0x1704000, 0x142A80],
  [0x170C000, 0x142A80],
]

function swap32(x) {
  return ((x & 0xFF) << 24) | ((x & 0xFF00) << 8) | ((x >> 8) & 0xFF00) | ((x >> 24) & 0xFF)
}

function findRomVersion() {
  // use heuristics to identify the ROM in the target emulator.
  // returns [key, swapped].

  const ranges = Process.enumerateRangesSync('r--')
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]

    for (let j = 0; j < romSizeTries.length; j++) {
      const size = romSizeTries[j][0]
      const offset = romSizeTries[j][1]
      if (range.size !== size) {
        continue
      }

      const addr = ptr(range.base)
      const bytes = Memory.readByteArray(addr.add(offset), 8)
      const view = new DataView(bytes)
      const crc1 = view.getInt32(0, false)
      const crc2 = view.getInt32(4, false)

      for (let k = 0; k < romNames.keys.length; k++) {
        const key = romNames.keys[k]
        const knownCrc1 = romNames[key][0]
        const knownCrc2 = romNames[key][1]
        if (knownCrc1 === crc1 && knownCrc2 === crc2) {
          return [key, false]
        } else if (knownCrc1 === swap32(crc1) && knownCrc2 === swap32(crc2)) {
          return [key, true]
        }
      }
    }
  }
  return ['', false]
}

function findRam(swapped) {
  const ranges = Process.enumerateRangesSync('rw-')
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]

    for (let j = 0; j < ramSizeTries.length; j++) {
      const size = ramSizeTries[j][0]
      const offset = ramSizeTries[j][1]
      if (range.size !== size) {
        continue
      }

      const addr = ptr(range.base)
      const bytes = Memory.readByteArray(addr.add(offset).add(ramSequenceOffset),
        ramSequence.length * 4)
      const view = new DataView(bytes)

      let start = 0
      if (view.getInt32(0, swapped) === ramSequence[1]) {
        // MM (GC) versions have these instructions shifted left one word.
        start = 1
      }

      let okay = true
      for (let k = start; k < ramSequence.length; k++) {
        if (view.getInt32((k - start) * 4, swapped) !== ramSequence[k]) {
          okay = false
          break
        }
      }

      if (okay) {
        return addr.add(offset)
      }
    }
  }
  return ''
}

function sendjson(obj) {
  send(JSON.stringify(obj))
}

const ret = findRomVersion()
const version = ret[0]
const swapped = ret[1]

if (version !== '') {
  const addr = findRam(swapped)
  sendjson({
    found_rom: true,
    swapped,
    version,
    ram_addr: addr,
  })
} else {
  sendjson({
    found_rom: false,
  })
}
