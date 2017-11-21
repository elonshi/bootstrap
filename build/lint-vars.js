#!/usr/bin/env node

/*!
 * Script to find unused Sass variables.
 *
 * Copyright 2017 The Bootstrap Authors
 * Copyright 2017 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

'use strict'

const path = require('path')
const sh = require('shelljs')
sh.config.fatal = true

// Blame TC39... https://github.com/benjamingr/RegExp.escape/issues/37
RegExp.quote = (string) => string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')

function lintVars(args) {
  if (args.length !== 1) {
    sh.echo('Wrong arguments!')
    sh.echo('Usage: lint-vars.js folder')
    sh.exit(1)
  }

  const dir = args[0]

  if (!sh.test('-d', dir)) {
    sh.echo(`"${dir}": Not a valid directory.`)
    sh.exit(1)
  }

  sh.echo('Finding unused variables...')

  // String of all Sass files' content
  const sassFiles = sh.cat(path.join(dir, '**/*.scss'))
  // String of all Sass variables
  const variables = sassFiles.grep(/^\$[a-zA-Z0-9_-][^:]*/g)
                      .sed(/(\$[a-zA-Z0-9_-][^:]*).*/g, '$1')
                      .trim()

  sh.echo(`There is a total of ${variables.length} variables.`)

  // Convert string into an array
  const variablesArr = Array.from(variables.split('\n'))
  // A variable to handle success/failure
  let unusedVarsFound = false

  // Loop through each variable
  variablesArr.forEach((variable) => {
    const re = new RegExp(RegExp.quote(variable), 'g')
    const count = (sassFiles.match(re) || []).length

    if (count === 1) {
      unusedVarsFound = true
      sh.echo(`Variable "${variable}" is only used once!`)
    }
  })

  if (unusedVarsFound === true) {
    sh.exit(1)
  } else {
    sh.echo(`No unused variables found in "${dir}"!`)
  }
}

// The first and second args are: path/to/node script.js
lintVars(process.argv.slice(2))
