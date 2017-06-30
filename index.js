'use strict'

const request = require('request')
const validUrl = require('valid-url')
const setupOptions = require('./lib/setup-options')
const filterData = require('./lib/filter-data')

module.exports = (options, callback) => {
  return new Promise((resolve, reject) => {
    if (!options) {
      let error = new Error('Missing required input: options object')
      return callback ? callback(error, null) : reject(error)
    }

    if (!options.url && !options.data) {
      let error = new Error('Missing required params: url or data')
      return callback ? callback(error, null) : reject(error)
    }

    if (options.url && !validUrl.isWebUri(options.url)) {
      let error = new Error('Invalid url')
      return callback ? callback(error, null) : reject(error)
    }

    const reqOpts = setupOptions(options)
    const ignore = options.ignore

    request(reqOpts, (error, response, result) => {
      if (error) {
        return callback ? callback(error, null) : reject(error)
      }

      if (response && response.statusCode !== 200) {
        let error = new Error('Validator returned unexpected statuscode: ' + response.statusCode)
        return callback ? callback(error, null) : reject(error)
      }

      let data = options.format === 'json' && !ignore ? JSON.parse(result) : result

      if (ignore) {
        data = filterData(data, ignore)
      }

      return callback ? callback(null, data) : resolve(data)
    })
  })
}
