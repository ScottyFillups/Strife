'use strict'

const path = require('path')
const express = require('express')
const routes = require('./routes')
const session = require('express-session')
const passport = require('./passport')
const bodyParser = require('body-parser')
const config = require('config')
const db = require('./db')
const MongoStore = require('connect-mongo')(session)

const app = express()
const client = express.static(path.join(__dirname, './client/build'))

const sessionConfig = {
  secret: config.get('secret'),
  store: new MongoStore({ mongooseConnection: db }),
  resave: false,
  saveUninitialized: false
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session(sessionConfig))
app.use(passport.initialize())
app.use(passport.session())

app.use('/api', routes)
app.use(client)

module.exports = app
