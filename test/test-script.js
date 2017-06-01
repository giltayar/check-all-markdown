'use strict'
//@flow

const {describe, it} = require('mocha')
const {expect} = require('chai')
const {exec} = require('child_process')
const path = require('path')
const {promisify: p} = require('util')

describe('check-all-markdown.js', function () {
  const script = path.resolve(__dirname, '../scripts/check-all-markdown.js')

  it('should return errors if there are broken links', function (done) {
    exec(`${script} "${path.resolve(__dirname, 'test-folder')}"`,
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

  it('should not check broken links if --no-check-links', (done) => {
    exec(`${script} "${path.resolve(__dirname, 'test-folder')}"  --no-check-links`,
      (err, stdout, stderr) => {
        expect(err).to.be.ok

        const lines = stdout.split('\n').filter(s => !!s)

        expect(lines).to.have.length(1)
        expect(lines.filter(l => l.includes('bar.md') && l.includes('MD034'))).to.have.length(1)

        done()
      })
  })

  it('should not return errors if there are no broken links', function (done) {
    exec(`${script} "${path.resolve(__dirname, 'test-folder/bar/tzar')}"`,
      (err, stdout, stderr) => {
        expect(err).to.not.be.ok

        const lines = stdout.split('\n').filter(s => !!s)
        expect(lines).to.have.length(0)
        done()
      })
  })

  it('should show usage if unrecognized option is there', async () => {
    let exception
    try {
      await p(exec)(`${script} --sladfjasldfkjasdlfj`)
    } catch (e) {
      exception = e
    }
    expect(exception).to.be.truthy
    if (exception) {
      expect(exception.toString()).to.include('Options')
    }
  })

  it('should show usage if --help', async () => {
    const {stdout} = await p(exec)(`${script} --help`)

    expect(stdout).to.include('Options')
  })
})
