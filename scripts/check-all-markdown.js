#!/usr/bin/env node
'use strict'
//@flow
const Promise = require('bluebird')
const api = require('..')
const yargs = require('yargs')

const argv = yargs
  .usage('check-links [dir] {options}')
  .strict()
  .default('check-links', true)
  .describe('check-links', 'check links in markdown files are not broken')
  .help('h')
  .alias('h', 'help')
  .argv

const dir = argv._[0] || '.'
Promise.resolve()
  .then(() =>
    api.listAllFiles(dir))
  .then(files =>
    Promise.all([files, api.readMarkdownLintConfiguration(dir)]))
  .then(([files, config]) =>
    Promise.all([
      argv.checkLinks ? api.checkLinks(dir, files) : Promise.resolve([]),
      api.checkMarkdownFiles(files, config)]))
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
