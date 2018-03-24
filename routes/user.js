const { Router } = require('express')

const router = Router()

router.get('/user', (req, res) => {
  if (req.user) {
    res.json({ message: req.user })
  } else {
    res.json({ message: 'Not logged in!' })
  }
})

module.exports = router
