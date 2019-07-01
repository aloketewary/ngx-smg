import { Command, flags } from '@oclif/command';
import { CLIError } from '@oclif/errors';
import Chalk from 'chalk';
import cli from 'cli-ux';
import { F_OK } from 'constants';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as inquirer from 'inquirer';
import * as yaml from 'yamljs';
import { ServiceOperationType, ServiceParameter, SwaggerServicePaths } from '../models/swagger-paths.model';
import { TagModel } from '../models/tags.model';
import { SmgConstants } from '../utils/smg.constants';
import { getImportsType, getServiceType, getType, isNullOrUndefined, titleCase } from '../utils/smg.util';
import { SwaggerConfig } from './../models/swagger-config.model';
import { SwaggerSchemasModel } from './../models/swagger.schemas.model';

const configFileName = 'smg-config.json'

export default class Run extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
    model: flags.boolean({ char: 'M', description: 'Model Generation Flag' }),
    service: flags.boolean({ char: 'S', description: 'Service Generation Flag' })
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Run)
    if (fs.existsSync(configFileName)) {
      // Do something
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
        // Generate models
        if (flags.model) {
          cli.action.start('Swagger model generation started')
          this.generateModels(jsonData, swaggerConfigData)
        }
        if (flags.service) {
          this.generateService(jsonData, swaggerConfigData)
        }
        if (!flags.service && !flags.model) {
          this.warn(Chalk.yellowBright('Please add flags to generate Models, Services'))
        }
      })
    } else {
      throw new CLIError('Config file not found, try to run `ngx-smg config`')
    }
  }

  makeFile(filePath: string, fileName: string, data: any, type: 'model' | 'service') {
    fse.outputFile(`${filePath}/${fileName.toLowerCase()}.${type}.ts`, data, (err) => {
      this.log(Chalk.greenBright('√') + ` ${type} ` + Chalk.yellowBright.bold(`${fileName.toLowerCase()}.${type}.ts`) + ' created success')
    })
  }

  generateModels(jsonData: any, swaggerConfigData: SwaggerConfig) {
    if (!isNullOrUndefined(jsonData)) {
      const swaggerVersion = jsonData['swagger'] || jsonData['openapi'] || '2.0'
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
          const data = `${importDataArr.length > 0 ? importDataArr.toString().replace(/,/g, `

`) : ''}
export class ${elem} {
${JSON.stringify(obj).replace('{', '').replace('}', ';').replace(/,/g, `;
`).replace(/"/g, '').replace(/:/g, ': ')}
}`
          this.makeFile(`${swaggerConfigData.output}/models`, elem, data, 'model')
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
  }

  async generateService(jsonData: any, swaggerConfigData: SwaggerConfig) {
    if (!isNullOrUndefined(jsonData)) {
      const baseUrl = `${jsonData.host}${jsonData.basePath}`
      const returnBaseUrl = await this.createAbstractConfigFile(baseUrl, swaggerConfigData, jsonData)
      if (!isNullOrUndefined(returnBaseUrl)) {
        this.generateRealService(returnBaseUrl, swaggerConfigData, jsonData)
      }
    }
  }

  createAbstractConfigFile(baseUrl: string, swaggerConfigData: SwaggerConfig, jsonData: any): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!isNullOrUndefined(baseUrl)) {
        let responses: any = await inquirer.prompt([{
          name: 'schema',
          message: 'select schema as http or https for all request: ',
          type: 'list',
          choices: [{ name: 'https' }, { name: 'http' }],
        }])
        const schemaHttp = responses.schema
        const data = `import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';

  /**
   * @description ${jsonData.info ? jsonData.info.title : ''} Base Http Service
   * @version ${jsonData.info ? jsonData.info.version : ''}
   */
  @Injectable({
    providedIn: 'root'
  })
  export abstract class AbstractHttpService {
      protected baseUrl = '${schemaHttp}://${baseUrl}';
      protected className: string;
      constructor(
        protected className: string,
        protected http: HttpClient
      ) {
        this.className = className;
      }
  }`
        this.makeFile(`${swaggerConfigData.output}/services/base`, 'abstract-http', data, 'service')
        resolve(`${schemaHttp}://${baseUrl}`)
      }
      reject('')
    })
  }

  generateRealService(baseUrl: string, swaggerConfigData: SwaggerConfig, jsonData: any) {
    const tags: TagModel[] = jsonData.tags as TagModel[]
    const paths = jsonData.paths as SwaggerServicePaths
    tags.forEach((elem) => {
      const methods: any[] = []
      Object.keys(paths).map((key: string) => {
        if (elem.name === key.split('/')[1]) {
          Object.keys(paths[key]).forEach(lastKey => {
            (paths[key][lastKey] as any)['url'] = key.replace(/{/g, "' + ").replace(/\}/g, " + '")
          })
          methods.push(paths[key])
        }
      })
      const flattenedMethods: ServiceOperationType[] = methods.reduce((last, current) => last.concat(current), [])
      const methodAct: any[] = []
      flattenedMethods.forEach((data: any) => {
        Object.keys(data).forEach((key: string) => {
          const parameters = data[key].parameters as Array<ServiceParameter>
          const pathParam = parameters.filter(param => param.in === SmgConstants.PATH_PARAMETER)
            .map(param => {
              return `${param.name}${param.required ? ':' : '?:'} ${getServiceType(param.type, param.schema ? param.schema.$ref : undefined)}`
            })
          const tempMethod = `
%**
 ^ ${data[key].summary} Generated by ngx-smg
 ^ ${data[key].description ? '@description ' + data[key].description : ''}
 #
public ${data[key].operationId}(${JSON.stringify(pathParam)}): Observable<any> ~
  const url: string = this.baseUrl + '${data[key].url}';
  ${(key === 'put' || key === 'post' || key === 'patch') ? 'const bodyData: any = {};' : ''}
  return this.http.${key}<any>(url${(key === 'put' || key === 'post' || key === 'patch') ? '$ bodyData' : ''}).pipe();
  !
`
          methodAct.push(tempMethod)
        })
      })
      const data = `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractHttpService } from './base/abstract-http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ${titleCase(elem.name)}Service extends AbstractHttpService {
  constructor(
    protected http: HttpClient
  ) {
    super('${titleCase(elem.name)}Service', http);
  }

  ${JSON.stringify(methodAct).replace(/"/g, '').replace(/\]/g, '').replace(/\[/g, '').replace(/\\n/g, '').replace(/\\/g, '').replace(/,/g, `
  `).replace(/%/g, '/').replace(/~/g, `{
  `).replace(/\^/g, `
  *`).replace(/#/g, `
  */
  `).replace(/!/g, `
  }`).replace(/;/g, `;
`).replace(/\$/g, ',')}
}
`
      this.makeFile(`${swaggerConfigData.output}/services`, elem.name.toLowerCase(), data, 'service')
    })
  }
}
