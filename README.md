# Analysis-Dashboard

### Set-up
Install [node.js](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation)

`$ pnpm install`: Installs the dependencies specified in the pnpm-lock.yaml file

### Development
`$ pnpm start`: Starts the development web server. This automatically recompiles and reloads the page whenever any
    source files change (Note: for speed, this does not type-check. The IDE should take on this responsibility during 
    development).

`$ pnpm install <package>`: Installs new packages.

`$ pnpm test`: Runs all tests. Automatically spins up a Firebase emulator for the duration of the tests, whose UI is
    usually accessible at localhost:4000 (if this port is unavailable, check the logs for which port was used instead)

`$ pnpm build`: Type-checks the project, then compiles it into a small number of minified js files that can be hosted 
    statically. The built project is written to ./dist.

`$ pnpm preview`: Runs a static web server in ./dist. Use this after `$ pnpm build` to try out builds.
