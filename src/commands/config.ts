import { Command, flags } from '@oclif/command';
import Chalk from 'chalk';
import cli from 'cli-ux';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import * as Listr from 'listr';
import { SwaggerConfig } from '../models/swagger-config.model';

export default class Config extends Command {
  static description = 'Swagger Config file'

  static flags = {
    help: flags.help({ char: 'h' }),

    format: flags.enum({ char: 'F', options: ['yml', 'json'], description: 'Format of Swagger File' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }
  static args = [{ name: 'path', description: 'Swagger file Path' }, { name: 'output', description: 'Generated Model Output Path' }];

  async run() {
    const { args, flags } = this.parse(Config)
    if (!flags.format) {
      let responses: any = await inquirer.prompt([{
        name: 'format',
        message: 'select a swagger file format: ',
        type: 'list',
        choices: [{ name: 'yml' }, { name: 'json' }],
      }])
      flags.format = responses.format
    }
    let configPath: string;
    if (args.path) {
      configPath = args.path
    } else {
      let responses: any = await inquirer.prompt([{
        name: 'path',
        message: 'Type your swagger config path without file format: ',
        type: 'input',
      }])
      configPath = responses.path || './src/swagger'
    }
    let outputPath: string;
    if (args.output) {
      outputPath = args.output
    } else {
      let responses: any = await inquirer.prompt([{
        name: 'output',
        message: 'Generated Model output location: ',
        type: 'input',
      }])
      outputPath = responses.output || './src/generated'
    }
    // just prompt for input
    const pathConfirmation = await cli.prompt(`The Swagger path is: ${configPath}.${flags.format}, Are you sure to continue? (y/N)`)
    if (pathConfirmation === 'y' || pathConfirmation === 'Y') {
      // show on stdout instead of stderr
      cli.action.start('Creating config file')
      const list = new Listr([
        {
          title: 'Config file created',
          task: () => {
            const createFile = fs.createWriteStream('smg-config.json', 'utf-8')
            createFile.write(JSON.stringify(new SwaggerConfig().withFormat(flags.format as 'yml' | 'json').withLocation(configPath).withOutput(outputPath)))
            createFile.end()
          }
        }
      ])
      list.run().catch(err => this.error(err))
    } else {
      this.error(Chalk.red('Config not created.'))
      this.exit(101)
    }
  }
}
