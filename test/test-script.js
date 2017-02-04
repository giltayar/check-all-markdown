'use strict'
//@flow

const {describe, it} = require('mocha')
const {expect} = require('chai')
const {exec} = require('child_process')
const path = require('path')

describe('check-markdown-links.js', function () {
  it('should return errors if there are broken links', function (done) {
    exec(`${path.resolve(__dirname,
      '../scripts/check-broken-markdown-links.js')} "${path.resolve(__dirname, 'test-folder')}"`,
      (err, stdout, stderr) => {
        expect(err).to.be.ok
        const lines = stdout.split('\n').filter(s => !!s)
        expect(lines).to.have.length(2)
        expect(stdout).to.include('bar.md')
        expect(stdout).to.include('gar.md')

        done()
      })
  })

  it('should not return errors if there are no broken links', function (done) {
    exec(`${path.resolve(__dirname,
      '../scripts/check-broken-markdown-links.js')} "${path.resolve(__dirname, 'test-folder/bar/tzar')}"`,
      (err, stdout, stderr) => {
        expect(err).to.not.be.ok
        const lines = stdout.split('\n').filter(s => !!s)
        expect(lines).to.have.length(0)
        done()
      })
  })
})
