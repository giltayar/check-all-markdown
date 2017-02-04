'use strict'
//@flow
const Promise = require('bluebird')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const markdownIt = require('markdown-it')
const fetch = require('node-fetch')
const flatten = require('lodash.flatten')

exports.listAllFiles = (dir/*:string*/) =>
  Promise.promisify(glob)(`${dir}/**/*.md`, {ignore: '**/node_modules/**'})

exports.retrieveLinks = (markdownText/*:string*/) => {
  const md = markdownIt({ linkify: true })
  const ret = []

  const previousRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const hrefIndex = tokens[idx].attrIndex('href')

    ret.push(tokens[idx].attrs[hrefIndex][1])

    return previousRender(tokens, idx, options, env, self)
  }
  md.render(markdownText)

  return ret
}

exports.checkLink = (dir/*:string*/, link/*:string*/) => {
  if (link.startsWith('http://') || link.startsWith('https://')) {
    return fetch(link, {method: 'HEAD'})
      .then(res =>
        res.ok
          ? Promise.resolve(true)
          : res.status === 404
            ? Promise.reject(new Error(`Broken link ${link}`))
            : Promise.reject(new Error(`Could not fetch ${link}. status = ${res.status}`)))
  } else {
    return Promise.resolve()
      .then(() => {
        const normalizedPath = link.startsWith('/') ? link.slice(1) : link

        return Promise.promisify(fs.stat)(path.join(dir, normalizedPath))
      })
      .then(() => true)
      .catch(err => err.code === 'ENOENT'
        ? Promise.reject(new Error(`File ${link} not found in ${dir}`))
        : err)
  }
}

exports.checkLinks = (dir/*:string*/, files/*:string[]*/) =>
  Promise.all(
    files
      .map(file =>
        Promise.promisify(fs.readFile)(file, { encoding: 'utf-8' })
          .then(fileText => {
            const links = exports.retrieveLinks(fileText)

            return Promise.all(links.map(link =>
              exports.checkLink(dir, link)
                .then(result => null)
                .catch(err => Promise.resolve(`${file}: ${link} is broken`))))
          })
      )
  )
  .then(results => flatten(results).filter(s => !!s))
