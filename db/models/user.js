const mongoose = require('mongoose')
const userSchema = require('../schemas/user')

userSchema.pre('save', async function (next) {
  if (!this.local.password) {
    next()
  } else {
    const hashedPassword = await this.hashPassword(this.local.password)

    this.local.password = hashedPassword
    next()
  }
})

module.exports = mongoose.model('user', userSchema)
