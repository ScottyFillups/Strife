const passport = require('passport')
const LocalStrategy = require('./strategies/local')
const User = require('../db/models/user')

passport.serializeUser((user, done) => {
  done(null, { _id: user._id })
})

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findOne({ _id: id })

    done(null, user)
  } catch (err) {
    console.error(err)
    done(err)
  }
})

passport.use(LocalStrategy)

module.exports = passport
