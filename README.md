# check-all-markdown

Checks all markdown files using markdownlint, and checks for broken links

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](http://standardjs.com)
![build status](https://travis-ci.org/create-oss/check-all-markdown.svg?branch=master)
[![npm version](https://badge.fury.io/js/check-all-markdown.svg)](https://badge.fury.io/js/check-all-markdown)


## Installation

```sh
npm install --save-dev check-all-markdown [-g]
```

## Usage

You can either use the script in your npm scripts, or you can use it as a regular package with the api

## Script Usage

```sh
check-all-markdown [dir]
```

Will check all markdown files (**/*.md) in the _dir_ (default is current directory) for markdown problems
using [markdownlint](https://github.com/DavidAnson/markdownlint). Additionally, it will go over
all the http and path links in the markdown files and verify that they are not broken.

The script will ignore any markdown file that is in a node_modules somewhere.

## API Usage

Sorry, didn't document it. Feel free to browse [index.js](/index.js) to figure it out. It is just that
is used to implement the script.
