'use strict'

const fs = require('fs'),
    util = require('util'),
    stream = require('stream'),
    es = require('event-stream'),
    parse = require("csv-parse"),
    iconv = require('iconv-lite');

class CSVReader {
  constructor(filename, batchSize, columns) {
    this.reader = fs.createReadStream(filename).pipe(iconv.decodeStream('utf8'))
    this.batchSize = batchSize || 1000
    this.lineNumber = 0
    this.data = []
    this.parseOptions = {delimiter: '\t', columns: true, escape: '/', relax: true}
  }

  read(callback) {
    this.reader
      .pipe(es.split())
      .pipe(es.mapSync(line => {
        ++this.lineNumber

        parse(line, this.parseOptions, (err, d) => {
          this.data.push(d[0])
        })

        if (this.lineNumber % this.batchSize === 0) {
          callback(this.data)
        }
      })
      .on('error', function(){
          console.log('Error while reading file.')
      })
      .on('end', function(){
          console.log('Read entirefile.')
      }))
  }

  continue () {
    this.data = []
    this.reader.resume()
  }
}

module.exports = CSVReader
