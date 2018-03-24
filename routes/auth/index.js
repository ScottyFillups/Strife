const Router = require('express')
const passport = require('passport')
const User = require('../../db/models/user')

const router = Router()

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ message: 'Logged in successful!' })
})

router.post('/logout', (req, res) => {
  if (req.user) {
    req.session.destroy()
    res.clearCookie('connect.sid')
    res.json({ message: 'Logged out successfully!' })
  } else {
    res.json({ message: 'Not logged in.' })
  }
})

router.post('/signup', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ 'local.username': username })

    if (user) {
      res.json({ message: 'Sorry, this username has already been registered' })
    } else {
      const newUser = new User({
        'local.username': username,
        'local.password': password
      })
      const savedUser = await newUser.save()

      console.log('New user created:', savedUser)
      res.json({ message: 'User successfully created!' })
    }
  } catch (err) {
    console.error(err)
    res.json(err.message)
  }
})

module.exports = router
