const fs = require('fs-extra');
const chalk = require('react-dev-utils/chalk');
const paths = require('../config/paths');

exports.checkWarnings = warnings => {
  if (warnings.length) {
    console.log(chalk.yellow('Compiled with warnings.\n'));
    console.log(warnings.join('\n\n'));
    console.log(`\nSearch for the ${chalk.underline(chalk.yellow('keywords'))} to learn more about each warning.`);
    console.log(`To ignore, add ${chalk.cyan('// eslint-disable-next-line')} to the line before.\n`);
  } else {
    console.log(chalk.green('Compiled successfully.\n'));
  }
};

exports.copyPublicFolder = () => {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
};
