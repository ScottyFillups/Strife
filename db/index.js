const mongoose = require('mongoose')
const config = require('config')

const mongoUrl = config.get('mongoUrl')

mongoose.connect(mongoUrl)
  .catch(console.error)

module.exports = mongoose.connection
