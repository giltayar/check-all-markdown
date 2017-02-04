# check-broken-markdown-links

Checks all markdown files for broken links

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)
![build status](https://travis-ci.org/create-oss/check-broken-markdown-links.svg?branch=master)
[![npm version](https://badge.fury.io/js/renumber-files.svg)](https://badge.fury.io/js/renumber-files)


## Installation

```sh
npm install --save-dev check-broken-markdown-links [-g]
```

## Usage

You can either use the script in your npm scripts, or you can use it as a regular package with the api

## Script Usage

```sh
check-broken-markdown-links [dir]
```

Will check all markdown files (**/*.md) in the _dir_ (default is current directory) for broken links.
This includes all the http and path links in the markdown files.

The script will ignore any markdown file that is in a node_modules somewhere.
## API Usage

Sorry, didn't document it. Feel free to browse [index.js](/index.js) to figure it out. It is just that
is used to implement the script.
