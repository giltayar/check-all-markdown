'use strict'
//@flow

const {describe, it} = require('mocha')
const {expect} = require('chai')
const {exec} = require('child_process')
const path = require('path')

describe('check-all-markdown.js', function () {
  it('should return errors if there are broken links', function (done) {
    exec(`${path.resolve(__dirname,
      '../scripts/check-all-markdown.js')} "${path.resolve(__dirname, 'test-folder')}"`,
      (err, stdout, stderr) => {
        expect(err).to.be.ok
        const lines = stdout.split('\n').filter(s => !!s)
        expect(lines).to.have.length(3)
        expect(lines.filter(l => l.includes('bar.md') && l.includes('MD034'))).to.have.length(1)
        expect(lines.filter(l => l.includes('bar.md') && l.includes('/broken-link'))).to.have.length(1)
        expect(lines.filter(l => l.includes('gar.md') && l.includes('http://localhost:39488'))).to.have.length(1)

        done()
      })
  })

  it('should not return errors if there are no broken links', function (done) {
    exec(`${path.resolve(__dirname,
      '../scripts/check-all-markdown.js')} "${path.resolve(__dirname, 'test-folder/bar/tzar')}"`,
      (err, stdout, stderr) => {
        expect(err).to.not.be.ok
        const lines = stdout.split('\n').filter(s => !!s)
        expect(lines).to.have.length(0)
        done()
      })
  })
})
