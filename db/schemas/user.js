const bcrypt = require('bcrypt')
const { Schema } = require('mongoose')

const userSchema = new Schema({
  displayName: { type: String, unique: false },
  local: {
    email: { type: String, unique: true, required: false },
    password: { type: String, unique: false, required: false }
  },
  google: {
    googleId: { type: String, required: false }
  }
})

userSchema.methods = {
  checkPassword (inputPassword) {
    return bcrypt.compare(inputPassword, this.local.password)
  },
  hashPassword (plainTextPassword) {
    return bcrypt.hash(plainTextPassword, 10)
  }
}

module.exports = userSchema
