import Command, { flags } from '@oclif/command';
import { CLIError } from '@oclif/errors';
import Chalk from 'chalk';
import cli from 'cli-ux';
import { F_OK } from 'constants';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as yaml from 'yamljs';
import { getImportsType, getType, isNullOrUndefined } from '../utils/smg.util';
import { SwaggerConfig } from './../models/swagger-config.model';
import { SwaggerSchemasModel } from './../models/swagger.schemas.model';

const configFileName = 'smg-config.json'

export default class Run extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Run)
    if (fs.existsSync(configFileName)) {
      // Do something
      cli.action.start('Swagger model generation started')
      const configData = fs.readFileSync(configFileName, { encoding: 'utf-8' })
      const swaggerConfigData: SwaggerConfig = new SwaggerConfig().deserialize(JSON.parse(configData))
      let jsonData: { [key: string]: any }
      const swaggerPath = `${swaggerConfigData.location}.${swaggerConfigData.format}`
      fs.access(swaggerPath, F_OK, (err: any) => {
        if (err) {
          console.error(Chalk.red('Swagger File not found or unaccessible!'))
          console.log(Chalk.yellow('Please check config as well or rerun' + Chalk.green(' `ngx-smg config` ') + 'to change config.'))
          return
        }
        if (swaggerConfigData.format === 'yml') {
          // Load yaml file using YAML.load
          jsonData = yaml.load(swaggerPath)
        } else {
          jsonData = JSON.parse(fs.readFileSync(swaggerPath, { encoding: 'utf-8' }))
        }
        if (!isNullOrUndefined(jsonData)) {
          const swaggerVersion = jsonData['swagger'] || jsonData[''] || '2.0'
          let components: any
          let schema: SwaggerSchemasModel
          if (swaggerVersion === '2.0') {
            schema = jsonData.definitions
          } else {
            components = jsonData.components
            schema = !isNullOrUndefined(components) ? components.schemas : null
          }
          if (!isNullOrUndefined(schema)) {
            Object.keys(schema).forEach((elem: string) => {
              const obj = Object.keys(schema[elem].properties).reduce((o, key) =>
                ({ ...o, [key]: `${getType(schema[elem].properties[key])}` }), {}
              )
              const importDataArr: string[] = []
              Object.keys(schema[elem].properties).map((key: string) => {
                const datas = getImportsType(schema[elem].properties[key])
                if (datas && datas !== 'any') {
                  importDataArr.push(`import { ${datas} } from './${datas.toLowerCase()}.model';`)
                }
              })
              // console.log(importDataArr)
              const data = `${importDataArr.toString().replace(/,/g, `
`)}

export class ${elem} {
    ${JSON.stringify(obj).replace('{', '').replace('}', ';').replace(/,/g, `;
    `).replace(/"/g, '')}
}`
              this.makeFile(swaggerConfigData.output, elem, data)
            })
          } else {
            cli.action.stop()
            throw new CLIError('No schemas found!')
          }
          cli.action.stop()
        } else {
          cli.action.stop()
          throw new CLIError('Unable to parse the file!')
        }
      })
    } else {
      cli.action.stop()
      throw new CLIError('Config file not found, try to run `ngx-smg config`')
    }
  }

  makeFile(filePath: string, fileName: string, data?: any) {
    fse.outputFile(`${filePath}/${fileName.toLowerCase()}.model.ts`, data, (err) => {
      this.log(Chalk.greenBright('√') + ' model ' + Chalk.yellowBright.bold(`${fileName.toLowerCase()}.model.ts`) + ' created success')
    })
  }
}
