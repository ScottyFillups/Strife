const { Router } = require('express')
const auth = require('./auth')
const user = require('./user')

const router = Router()

router.use('/auth', auth)
router.use(user)

module.exports = router
