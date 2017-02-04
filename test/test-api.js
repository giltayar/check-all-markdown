'use strict'
//@flow
const {describe, it} = require('mocha')
const {expect} = require('chai')
const path = require('path')
const api = require('../index')

describe('api', function () {
  const testFolder = path.resolve(__dirname, 'test-folder')

  describe('listAllFiles', function () {
    it('should list only md files and ignore md files in node_modules', function () {
      return api.listAllFiles(testFolder)
        .then(files => {
          expect(files).to.have.length(4)
          expect(files.filter(x => x.startsWith(testFolder))).to.have.length(4)
          expect(files.filter(x => x.endsWith('foo.md'))).to.have.length(1)
          expect(files.filter(x => x.endsWith('par.md'))).to.have.length(1)
          expect(files.filter(x => x.endsWith('bar.md'))).to.have.length(1)
          expect(files.filter(x => x.endsWith('gar.md'))).to.have.length(1)
        })
    })
  })

  describe('readMarkdownLintConfiguration', function () {
    it('should read a markdown lint configuration', function () {
      return api.readMarkdownLintConfiguration(testFolder)
        .then(config => {
          expect(config.default).to.equal(true)
          expect(config['single-h1']).to.equal(false)
        })
    })

    it('should return null if no configuration found', function () {
      return api.readMarkdownLintConfiguration(__dirname)
        .then(config => expect(config).to.equal(null))
    })
  })

  describe('checkMarkdownFiles', function () {
    let files

    it('should return the correct results', function () {
      return Promise.resolve()
        .then(() =>
          api.listAllFiles(testFolder)
        )
        .then(f => {
          files = f
          return api.readMarkdownLintConfiguration(testFolder)
        })
        .then(config =>
          api.checkMarkdownFiles(files, config)
        )
        .then(result => {
          const lines = result.split('\n')

          expect(lines).to.have.length(2)
          expect(lines.filter(l => l.includes('bar.md') && l.includes('MD041'))).to.have.length(1)
          expect(lines.filter(l => l.includes('par.md') && l.includes('MD034'))).to.have.length(1)
        })
    })
  })
})
