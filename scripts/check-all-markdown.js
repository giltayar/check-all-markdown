#!/usr/bin/env node

const Promise = require('bluebird')
const api = require('..')
const fs = require('fs')
const flatten = require('lodash.flatten')

const dir = process.argv[2] || '.'
console.log(dir)

Promise.resolve()
  .then(() =>
    api.listAllFiles(dir))
  .then(files =>
    Promise.all([files, api.readMarkdownLintConfiguration(dir)]))
  .then(([files, config]) =>
    Promise.all([checkLinks(files), api.checkMarkdownFiles(files, config)]))
  .then(([linksResult, checkResult]) =>
    process.stdout.write(`Lint results:\n${checkResult}\n\n\nBrokenLinks:\n${linksResult}`))

const checkLinks = files =>
  Promise.all(
    files
      .map(file =>
        Promise.promisify(fs.readFile)(file, {encoding: 'utf-8'})
          .then(fileText => {
            const links = api.retrieveLinks(fileText)

            return Promise.all(links.map(link =>
              api.checkLink(dir, link)
                .then(result => null)
                .catch(err => Promise.resolve(err.toString()))))
          })
      )
  )
  .then(results =>
    flatten(results).filter(s => !!s).join('\n'))
