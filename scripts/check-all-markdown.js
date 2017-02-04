#!/usr/bin/env node
'use strict'
//@flow

const Promise = require('bluebird')
const api = require('..')

const dir = process.argv[2] || '.'

Promise.resolve()
  .then(() =>
    api.listAllFiles(dir))
  .then(files =>
    Promise.all([files, api.readMarkdownLintConfiguration(dir)]))
  .then(([files, config]) =>
    Promise.all([api.checkLinks(dir, files), api.checkMarkdownFiles(files, config)]))
  .then(([linksResult, checkResult]) => {
    if (linksResult.length > 0) {
      process.stdout.write(`${linksResult.join('\n')}\n`)

      process.exitCode = 1
    }
    if (checkResult) {
      process.stdout.write(`${checkResult}\n`)

      process.exitCode = 1
    }
  })
