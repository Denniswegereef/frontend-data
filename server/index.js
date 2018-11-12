require('dotenv').config()
const api = require('./obaApi.js')
const chalk = require('chalk')

require('util').inspect.defaultOptions.depth = 2
const fs = require('fs')

// Express
const express = require('express')
const app = express()
const port = 8080

const obaApi = new api()

obaApi
  .getMore([2018])
  .then(response => {
    console.log(response)

    return response
      .reduce((total, year) => total.concat(year), [])
      .reduce(
        (total, page) => total.concat(page.aquabrowser.results[0].result),
        []
      )
  })
  .then(response => {
    console.log(response)
    fs.writeFile('json.json', response, 'utf-8', err => {
      if (err) {
        console.error(err)
      }
      console.log('File has been created')
    })
  })
  .catch(err => {
    console.log(err)
  })
