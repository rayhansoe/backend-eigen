const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Device = require('../models/deviceModel')

const protect = asyncHandler(async (req, res, next) => {
	let token

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			// Get Token from header
			token = req.headers.authorization.split(' ')[1]

			// verify
			const decodedRT = jwt.verify(req.cookies?.jwt, process.env.REFRESH_TOKEN_SECRET)
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

			// Get User from the Token / User yang login, bukan user yang mau dilihat.
			req.user = await User.findById(decoded.UserInfo.id).select('-password')

			// get user by refresh token
			const userByRefreshToken = await User.findById(decodedRT.id)

			const userAgent = req.headers['user-agent'].toString()

			// const userDevice = await Device.findOne({ device: userAgent })
			const userDevice = await Device.findOne({ device: userAgent, user: req.user._id })

			// get saved refresh token user and validate
			const savedRefreshToken = userByRefreshToken.refreshTokens.find(
				(rt) => JSON.stringify(rt.device) === JSON.stringify(userDevice.id)
			)

			// VERIFY EVERYTHING
			JSON.stringify(userDevice.device) === JSON.stringify(userAgent) &&
				JSON.stringify(userDevice.user) === JSON.stringify(req.user._id) &&
				JSON.stringify(decoded.UserInfo.id) === JSON.stringify(decodedRT.id) &&
				savedRefreshToken &&
				JSON.stringify(savedRefreshToken.device) === JSON.stringify(userDevice._id) &&
				next()
		} catch (error) {
			res.status(403)
			throw new Error('Login Token expired.')
		}
	}

	if (!token) {
		res.status(403)
		throw new Error('Not Authorized.')
	}
})

const semiProtected = asyncHandler(async (req, res, next) => {
	let token

	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		try {
			// Get Token from header
			token = req.headers.authorization.split(' ')[1]

			// verify
			const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
			const decodedRT = jwt.verify(req.cookies?.jwt, process.env.REFRESH_TOKEN_SECRET)

			// Get User from the Token / User yang login, bukan user yang mau dilihat.
			req.user = await User.findById(decoded.UserInfo.id).select('-password')

			// get user by refresh token
			const userByRefreshToken = await User.findById(decodedRT.id)

			const userAgent = req.headers['user-agent'].toString()

			// const userDevice = await Device.findOne({ device: userAgent })
			const userDevice = await Device.findOne({ device: userAgent, user: req.user._id })

			// get saved refresh token user and validate
			const savedRefreshToken = userByRefreshToken.refreshTokens.find(
				(rt) => JSON.stringify(rt.device) === JSON.stringify(userDevice.id)
			)

			// VERIFY EVERYTHING
			JSON.stringify(userDevice.device) === JSON.stringify(userAgent) &&
				JSON.stringify(userDevice.user) === JSON.stringify(req.user._id) &&
				JSON.stringify(decoded.UserInfo.id) === JSON.stringify(decodedRT.id) &&
				savedRefreshToken &&
				JSON.stringify(savedRefreshToken.device) === JSON.stringify(userDevice._id) &&
				next()
		} catch (error) {
			next()
		}
	}

	if (!token) {
		next()
	}
})

module.exports = { protect, semiProtected }
