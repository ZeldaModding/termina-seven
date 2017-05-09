# termina-seven

After installing dependencies,
you must grab `frida-v10.0.3-electron-v53-win32-x64.tar.gz`
(or equivalent) from https://github.com/frida/frida/releases
and overwrite `app/node_modules/frida/build/Release/frida_binding.node`.
Otherwise, the program will not run.
Hopefully this will be automated in the future.

## Resources
### Compiling Frida against Electron
* https://www.npmjs.com/package/electron-builder
* https://github.com/electron/electron/blob/master/docs/tutorial/using-native-node-modules.md
* https://github.com/nodegit/nodegit/issues/828

### A JS Map Viewer, Using 010 Style Reading
* http://magcius.github.io/dunky.js/

### Editor UI / Scaffolding
* https://github.com/xem/hex
* http://xen.firefly.nu/up/zelda/tp/text/
* http://xen.firefly.nu/up/zelda/tp/map/
* https://github.com/FireyFly/mint-explorer

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron app for production
npm run build

# run webpack in production
npm run pack
```
More information can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/en/npm_scripts.html).

---

This project was generated from [electron-vue](https://github.com/SimulatedGREG/electron-vue) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about this project can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
