ngx-smg
=======

Angular X Swagger Model Generator 

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ngx-smg.svg)](https://npmjs.org/package/ngx-smg)
[![CircleCI](https://circleci.com/gh/NgxSMG/ngx-smg/tree/master.svg?style=shield)](https://circleci.com/gh/NgxSMG/ngx-smg/tree/master)
[![Codecov](https://codecov.io/gh/NgxSMG/ngx-smg/branch/master/graph/badge.svg)](https://codecov.io/gh/NgxSMG/ngx-smg)
[![Downloads/week](https://img.shields.io/npm/dw/ngx-smg.svg)](https://npmjs.org/package/ngx-smg)
[![License](https://img.shields.io/npm/l/ngx-smg.svg)](https://github.com/NgxSMG/ngx-smg/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ngx-smg
$ ngx-smg COMMAND
running command...
$ ngx-smg (-v|--version|version)
ngx-smg/0.1.2 win32-x64 node-v10.16.0
$ ngx-smg --help [COMMAND]
USAGE
  $ ngx-smg COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ngx-smg config [PATH] [OUTPUT]`](#ngx-smg-config-path-output)
* [`ngx-smg help [COMMAND]`](#ngx-smg-help-command)
* [`ngx-smg run [FILE]`](#ngx-smg-run-file)

## `ngx-smg config [PATH] [OUTPUT]`

Swagger Config file

```
USAGE
  $ ngx-smg config [PATH] [OUTPUT]

ARGUMENTS
  PATH    Swagger file Path
  OUTPUT  Generated Model Output Path

OPTIONS
  -F, --format=(yml|json)  Format of Swagger File
  -f, --force
  -h, --help               show CLI help
```

_See code: [src\commands\config.ts](https://github.com/aloketewary/ngx-smg/blob/v0.1.2/src\commands\config.ts)_

## `ngx-smg help [COMMAND]`

display help for ngx-smg

```
USAGE
  $ ngx-smg help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src\commands\help.ts)_

## `ngx-smg run [FILE]`

describe the command here

```
USAGE
  $ ngx-smg run [FILE]

OPTIONS
  -f, --force
  -h, --help   show CLI help
```

_See code: [src\commands\run.ts](https://github.com/aloketewary/ngx-smg/blob/v0.1.2/src\commands\run.ts)_
<!-- commandsstop -->
