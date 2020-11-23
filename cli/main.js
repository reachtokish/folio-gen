import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';
import { templateStrings } from '../config';
import icons from '../icons';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options) {
  return copy(options.templateDirectory, options.targetDirectory, {
    clobber: false
  });
}

async function modifyTemplateFiles(options) {
  import(path.join(process.cwd(), options.config))
    .then(res => {
      const userConfig = res.default;

      const templateDir = path.resolve(
        new URL(import.meta.url).pathname,
        '../../templates',
        options.template.toLowerCase().split(' ').join('-'),
        'index.html'
      );
      const targetDirectory = path.resolve(
        process.cwd(),
        'index.html'
      );

      const myNameToReplace = templateStrings.myName;
      const designationToReplace = templateStrings.designation;
      const profilePhotoToReplace = templateStrings.profilePhoto;
      const socialToReplace = templateStrings.social;

      const myNameRegex = new RegExp(myNameToReplace, "g");
      const designationRegex = new RegExp(designationToReplace, "g");
      const profilePhotoRegex = new RegExp(profilePhotoToReplace, "g");
      const socialRegex = new RegExp(socialToReplace, "g");

      fs.readFile(templateDir, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }

        let socialHtml = '';
        const socialKeys = Object.keys(userConfig.social);

        for(let socialKey of socialKeys) {
          socialHtml += `
            <a href="${userConfig.social[socialKey]}">
              ${icons[socialKey]}
            </a>
          `;
        }

        // console.log(data);
        // console.log(myNameRegex);
        // console.log(userConfig.myName);

        const result = data
          .replace(myNameRegex, userConfig.myName)
          .replace(designationRegex, userConfig.designation)
          .replace(profilePhotoRegex, userConfig.profilePhoto)
          .replace(socialRegex, socialHtml);

        fs.writeFile(targetDirectory, result, 'utf8', function (err) {
          if (err) return console.log(err);
        });
      });
    });
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd()
  };

  const templateDir = path.resolve(
    new URL(import.meta.url).pathname,
    '../../templates',
    options.template.toLowerCase().split(' ').join('-')
  );
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error('%s Invalid template name', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: 'Modifying template',
      task: () => modifyTemplateFiles(options),
    },
    {
      title: 'Copying template files',
      task: () => copyTemplateFiles(options),
    }
  ]);

  await tasks.run();
  console.log('%s Project ready', chalk.green.bold('DONE'));
  return true;
}