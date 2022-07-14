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

router.route('/').post(registerUser).get(semiProtected, getUsers) // Create or Read all
router.route('/login').post(loginUser) // Login
router.route('/logout').delete(protect, logout)  // Logout
router.route('/refreshToken').get(handleRefreshToken) // refresh token
router.route('/:username').get(semiProtected, getUserProfile)  // Read User Profile

module.exports = router
