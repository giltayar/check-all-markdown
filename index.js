'use strict'
//@flow
const Promise = require('bluebird')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const markdownLint = require('markdownlint')
const markdownIt = require('markdown-it')
const fetch = require('node-fetch')

exports.listAllFiles = (dir/*:string*/) =>
  Promise.promisify(glob)(`${dir}/**/*.md`, {ignore: '**/node_modules/**'})

exports.readMarkdownLintConfiguration = (dir/*:string*/) =>
  Promise.promisify(fs.readFile)(path.join(dir, '.markdownlint.json'), {encoding: 'utf-8'})
    .then(s => JSON.parse(s))
    .catch(err => err.code === 'ENOENT' ? null : Promise.reject(err))

exports.checkMarkdownFiles = (files/*:string[]*/, markdownLintConfiguration/*:{}*/) =>
  Promise.promisify(markdownLint)({files: files, config: markdownLintConfiguration})
    .then(result => result.toString())

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
