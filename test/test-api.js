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
    it('should return the correct results', function () {
      return Promise.resolve()
        .then(() =>
          api.listAllFiles(testFolder)
        )
        .then(files => {
          return Promise.all([files, api.readMarkdownLintConfiguration(testFolder)])
        })
        .then(([files, config]) =>
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

  describe('retrieveLinks', function () {
    it('should retrieve a regular markdown link', function () {
      expect(api.retrieveLinks('jjjj\n[foo](http://www.google.com)\nasldjfsldfj'))
        .to.deep.equal(['http://www.google.com'])
    })

    it('should retrieve a bare link', function () {
      expect(api.retrieveLinks('jjjj\nhttp://www.google.com\nasldjfsldfj'))
        .to.deep.equal(['http://www.google.com'])
    })

    it('should retrieve a regular markdown link with a path', function () {
      expect(api.retrieveLinks('jjjj\n[foo](/bar/gar)\nasldjfsldfj'))
        .to.deep.equal(['/bar/gar'])
    })

    it('should not retrieve a bare path', function () {
      expect(api.retrieveLinks('jjjj\n/bar/gar\nasldjfsldfj'))
        .to.deep.equal([])
    })

    it('should retrieve more than one link', function () {
      expect(api.retrieveLinks('jjjj\n[foo](/bar/gar)\nhttp://www.cnet.com/foo'))
        .to.have.members(['/bar/gar', 'http://www.cnet.com/foo'])
    })

    it('should retrieve empty array if no links', function () {
      expect(api.retrieveLinks('jjjj'))
        .to.have.members([])
    })
  })

  describe('checkLink', function () {
    it('should return true if http url is OK', function () {
      return api.checkLink('sdfasdf', 'http://www.google.com')
        .then(res => expect(res).to.equal(true))
    })

    it('should return true if path that starts with / is OK', function () {
      return api.checkLink(testFolder, '/bar/tzar/par.md')
        .then(res => expect(res).to.equal(true))
    })

    it('should return true if path that does not start with / is OK', function () {
      return api.checkLink(testFolder, 'bar/tzar/par.md')
        .then(res => expect(res).to.equal(true))
    })

    it('should reject if path is not found', function () {
      return api.checkLink(testFolder, 'bar/not/found.md')
        .then(res => expect.fail(), err => Promise.resolve(err))
    })

    it('should reject if URL is 404', function () {
      return api.checkLink(testFolder, 'http://www.google.com/sdkfjhaskhewih')
        .then(res => expect.fail(), err => Promise.resolve(err))
    })

    it('should reject if URL is disconnected', function () {
      return api.checkLink(testFolder, 'http://192.167.4.3/sdkfjhaskhewih')
        .then(res => expect.fail(), err => Promise.resolve(err))
    })
  })
})
