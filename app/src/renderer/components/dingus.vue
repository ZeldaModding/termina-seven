<template>
</template>

<script>
const os = require('os')
const fs = require('fs')
const co = require('co')
const frida = require('frida')

const isWindows = os.type() == 'Windows_NT'

const possibleNames = [
  "mupen64plus",
  "Project64",
  "EmuHawk",
  "mupen64-rerecording-v2",
  "mupen64-rerecording",
  // some variants I've seen in MHS files. please don't rename your EXEs.
  "mupen64-rerecording-v2-reset",
  "mupen64 (pause)",
]

function* tryNames() {
  for (var i = 0; i < possibleNames.length; i++) {
    var processName = possibleNames[i]
    if (isWindows) {
      processName += ".exe"
    }
    try {
      return yield frida.attach(processName)
    } catch(e) {
      if (e.message !== 'Process not found') {
        throw e
      }
    }
  }
  throw Error('failed to find an N64 emulator process')
}

co(function* () {
  // FIXME: using the path like this will probably fail on production.
  const source = fs.readFileSync('app/src/injected.js').toString()
  const session = yield tryNames()
  const script = yield session.createScript(source)

  script.events.listen('message', message => {
    console.log(message);
  })

  yield script.load()
  console.log("script loaded")
}).catch(err => {
  console.error(err)
})

export default {
  name: 'dingus'
}
</script>

<style scoped>
</style>
