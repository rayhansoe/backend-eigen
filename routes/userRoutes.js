const express = require('express')
const router = express.Router()

const {
	loginUser,
	getUserProfile,
	logout,
	handleRefreshToken,
} = require('../controllers/userController')

const { protectGetUser, protect } = require('../middleware/authMiddleware')

router.route('/login').post(loginUser)
router.route('/logout').delete(protect, logout)
router.route('/refreshToken').get(handleRefreshToken)
router.route('/:username').get(protectGetUser, getUserProfile)

module.exports = router
