'use strict'
//@flow
const Promise = require('bluebird')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const markdownLint = require('markdownlint')
const markdownIt = require('markdown-it')
const fetch = require('node-fetch')
const flatten = require('lodash.flatten')
const url = require('url')

exports.listAllFiles = (dir/*:string*/) =>
  Promise.promisify(glob)(`${dir}/**/*.md`, {ignore: `${dir}/**/node_modules/**`})

exports.readMarkdownLintConfiguration = (dir/*:string*/) =>
  Promise.promisify(fs.readFile)(path.join(dir, '.markdownlint.json'), { encoding: 'utf-8' })
    .then(s => JSON.parse(s))
    .catch(err => err.code === 'ENOENT' ? null : Promise.reject(err))

exports.checkMarkdownFiles = (files/*:string[]*/, markdownLintConfiguration/*:{}*/) =>
  Promise.promisify(markdownLint)({ files: files, config: markdownLintConfiguration })
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

exports.checkLink = (
    basedir/*:string*/,
    fileLinkIsIn/*:string*/,
    link/*:string*/,
    {httpMethod = 'HEAD'}/*:{httpMethod: 'HEAD'|'GET'}*/ = {}) => {
  const linkUrl = url.parse(link)

  if (linkUrl.protocol === 'http:' || linkUrl.protocol === 'https:') {
    return fetch(link, {method: httpMethod})
      .then(res =>
        res.status >= 200 && res.status < 400
          ? Promise.resolve(true)
          : res.status === 404
          ? Promise.reject(new Error(`Broken link ${link}`))
          : httpMethod === 'HEAD'
          ? exports.checkLink(basedir, fileLinkIsIn, link, {httpMethod: 'GET'})
          : Promise.reject(new Error(`Could not fetch ${link}. status = ${res.status}, method = ${httpMethod}`)))
  } else if (!linkUrl.protocol && !/^[a-z.-]+@[a-z.-]+:/.test(link)) {
    return Promise.resolve()
      .then(() => {
        const normalizedPath = link.startsWith('/')
          ? path.resolve(basedir, link.slice(1))
          : path.resolve(basedir, path.dirname(fileLinkIsIn), link)

        return Promise.promisify(fs.stat)(normalizedPath)
      })
      .then(() => true)
      .catch(err => err.code === 'ENOENT'
        ? Promise.reject(new Error(`File ${link} not found in ${fileLinkIsIn}`))
        : err)
  } else {
    return Promise.resolve(true)
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
              exports.checkLink(dir, file, link)
                .then(result => null)
                .catch(err => err && Promise.resolve(`${file}: ${link} is broken`))))
          })
      )
  )
  .then(results => flatten(results).filter(s => !!s))
