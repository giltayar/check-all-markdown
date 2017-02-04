#!/usr/bin/env node
'use strict'
//@flow

const Promise = require('bluebird')
const api = require('..')

const dir = process.argv[2] || '.'
console.log(dir)

Promise.resolve()
  .then(() =>
    api.listAllFiles(dir))
  .then(files =>
    Promise.all(api.checkLinks(dir, files)))
  .then(linksResult => {
    if (linksResult.length > 0) {
      process.stdout.write(`${linksResult.join('\n')}\n`)

      process.exitCode = 1
    }
  })
