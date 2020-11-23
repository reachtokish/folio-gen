import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';
import path from 'path';
var fs = require('fs');
import ncp from 'ncp';
import { promisify } from 'util';
const figlet = require('figlet');
import chalk from 'chalk';
import { templates } from '../config';

const copy = promisify(ncp);

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--config': String
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    template: args._[0],
    config: args['--config']
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = templates[0];

  const questions = [];

  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose which project template to use',
      choices: templates,
      default: defaultTemplate,
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    ...options,
    template: options.template || answers.template
  };
}

console.log(
  chalk.magenta(
    figlet.textSync('Folio Gen', {
      horizontalLayout: 'full'
    })
  )
);

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createProject(options);
}