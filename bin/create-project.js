#!/usr/bin/env node

require = require('esm')(module /*, options*/);

require('../cli/cli').cli(process.argv);