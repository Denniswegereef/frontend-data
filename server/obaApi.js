require('dotenv').config()

const axios = require('axios')
const chalk = require('chalk')
const convert = require('xml-to-json-promise')

module.exports = class api {
  constructor(options) {
    limitPages: 5
  }

  getUrls(years) {
    const base = 'https://zoeken.oba.nl/api/v1/search/'
    const publicKey = process.env.PUBLIC

    return Promise.all(years.map(requestYear))

    function requestYear(year) {
      const all = []
      let page = 1
      let maxRequest = 2

      return send()

      function send() {
        return axios
          .get(
            `${base}?authorization=${publicKey}&q=book&facet=pubYear(${year})&refine=true&page=${page}&pagesize=20`
          )
          .then(res => res.data)
          .then(convert.xmlDataToJSON)
          .then(next, console.error)
          .then(res => {
            if (res) {
              return res
            }
          })
      }

      function next(aantalBoeken) {
        all.push(aantalBoeken)
        let amountOfPages = Math.ceil(
          aantalBoeken.aquabrowser.meta[0].count[0] / 20
        )
        if (page < amountOfPages) {
          console.log(chalk.yellow(`Request to ${page}`))
          page++
          if (page < maxRequest + 1) {
            return send()
          } else {
            return all
          }
        } else {
          return all
        }
      }
    }
  }

  getMore(years) {
    return new Promise((resolve, reject) => {
      this.getUrls(years)
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          console.log(err)
        })
    })
  }
}
