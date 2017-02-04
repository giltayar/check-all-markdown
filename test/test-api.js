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
})
