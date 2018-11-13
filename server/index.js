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
  .getMore([1])
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
        type: book.formats ? book.formats[0]['format'][0]['_'] : 'No type',
        publicationYear: book.publication[0]['year']
          ? Number(book.publication[0]['year'][0]['_'])
          : 'No publication year',
        mainAuthor: book.authors
          ? book.authors[0]['main-author'][0]['_']
          : 'No main-author',
        language: Array.isArray(book.languages)
          ? book.languages[0].language[0]['_']
          : 'No language',
        // language: book.languages,
        pages: book.description
          ? book.description[0]['physical-description'][0]['_'].replace(
              /(^\d+)(.+$)/i, //https://stackoverflow.com/questions/609574/get-the-first-ints-in-a-string-with-javascript
              '$1'
            )
          : book.description,
        // pages: Number(
        //   book.description[0]['physical-description'][0]['_'].replace(
        //     /(^\d+)(.+$)/i, //https://stackoverflow.com/questions/609574/get-the-first-ints-in-a-string-with-javascript
        //     '$1'
        //   )
        // ),
        detailPage: book['detail-page'][0]
      }
    })
    return response
  })
  .then(response => {
    console.log(response)
    fs.writeFile('erotica.json', JSON.stringify(response), 'utf-8', err => {
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
