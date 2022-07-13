const express = require('express')
const router = express.Router()

const {
	registerUser,
	loginUser,
	getUserProfile,
	logout,
	handleRefreshToken,
	getUsers,
} = require('../controllers/userController')

const { semiProtected, protect } = require('../middleware/authMiddleware')

router.route('/').post(registerUser).get(getUsers)
router.route('/login').post(loginUser)
router.route('/logout').delete(protect, logout)
router.route('/refreshToken').get(handleRefreshToken)
router.route('/:username').get(semiProtected, getUserProfile)

module.exports = router
