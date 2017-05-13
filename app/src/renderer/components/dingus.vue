<template>
  <div>
    <div class="row">
      <div class="col-2">
        <b-button variant="primary" href="" v-on:click="dingus_log">
          Log
        </b-button>
      </div>
      <div class="col-2">
        <b-button variant="primary" href="" v-on:click="rerun">
          Rerun
        </b-button>
      </div>
      <div class="col-8">
        <b-form-input v-model="last_emu" type="text" placeholder="Last Loaded Emulator" ></b-form-input>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <b-form-checkbox v-model="found_emu">
          Located Emulator: {{ found_emu }}
        </b-form-checkbox>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <b-form-checkbox v-model="found_rom">
          Located ROM: {{ found_rom }}
        </b-form-checkbox>
      </div>
    </div>

    <div class="row">
      <pre>{{ $data }}</pre>
    </div>
  </div>
</template>

<script>
const os = require('os')
const fs = require('fs')
const co = require('co')
const frida = require('frida')
const Config = require('electron-config');
const config = new Config();

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

/*
let goodmeme =

let runmeme = goodmeme().catch(err => {
  console.error(err)
})
*/

let runmeme = null

export default {
  name: 'dingus',
  data: function () {
    return {
      last_emu: config.get('last_emu'),
      found_emu: false,
      found_rom: false,
      processName: ""
    }
  },
  methods: {
    dingus_log: function () {
      console.log( "thinking about " + this.last_emu )
      config.set('last_emu', this.last_emu)
    },
    rerun: function () {
      runmeme = this.goodmeme().catch( err => {
        console.error(err)
      })
    },
    tryNames: function* tryNames() {
      for (var i = 0; i < possibleNames.length; i++) {
        var processName = possibleNames[i]
        if (isWindows) {
          processName += ".exe"
        }
        this.processName = processName
        try {
          return yield frida.attach(this.processName)
        } catch(e) {
          if (e.message !== 'Process not found') {
            this.found_emu = true
            throw e
          } else {
            console.log("it wasn't " + processName + " this time: " + e.message)
          }
        }
      }
      throw Error('failed to find an N64 emulator process')
    },
    goodmeme: co.wrap(function* () {
      console.log("seeking for emulators...")
      // FIXME: using the path like this will probably fail on production.
      const source = fs.readFileSync('app/src/injected.js').toString()
      const session = yield this.tryNames()
      console.log( "it was " + this.processName )
      this.found_emu = true
      const script = yield session.createScript(source)

      script.events.listen('message', message => {
        try {
          var obj = JSON.parse(message.payload)
        } catch(e) {
          console.log(message)
          console.error(e)
          return
        }
        console.log(obj)
        if (typeof(obj) === 'object') {
          if( 'found_rom' in obj ) {
            this.found_rom = obj.found_rom
            // if (!this.found_rom) { clear/reset stuff in this? }
          }
        }
      })

      yield script.load()
      console.log("script loaded")
    })
  }
}
</script>

<style scoped>
</style>
