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
    return response.map(book => {
      return {
        title: book.titles[0]['title'][0]['_'],
        summary: book.summaries
          ? book.summaries[0]['summary'][0]['_']
          : 'No summary',
        coverImage: book.coverimages[0]['coverimage'][0]['_'],
        publication: book.publication[0]['year'][0]['_'],
        mainAuthor: book.authors
          ? book.authors[0]['main-author'][0]['_']
          : 'No main-author',
        language: book.languages[0].language
          ? book.languages[0].language[0]['_']
          : 'No language',
        physicalDescription:
          book.description[0]['physical-description'][0]['_'],
        detailPage: book['detail-page'][0]
      }
    })
    return response
  })
  .then(response => {
    console.log(response)
    fs.writeFile('json.json', response, 'utf-8', err => {
      if (err) {
        console.error(err)
      }
      console.log('File has been created')
    })
    return response
  })
  .then(response => {
    app.get('/', (req, res) => res.json(response))
    app.listen(port, () =>
      console.log(chalk.green(`Listening on port ${port}`))
    )
  })
  .catch(err => {
    console.log(err)
  })
