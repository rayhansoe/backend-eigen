const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const User = require('../models/userModel')
const Book = require('../models/bookModel')
const Device = require('../models/deviceModel')

// @desc Register User
// @route POST /api/users
// @access PUBLIC
const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, username } = req.body
	const penalty = false
	let { code } = req.body

	// check the fields
	if (!name || !email || !password || !username) {
		res.status(400)

		throw new Error('Please add all fields.')
	}

	// check if user exists
	const userExistByEmail = await User.findOne({ email })
	const userExistByUsername = await User.findOne({ username })

	// user
	const users = await User.find()

	// by email & username
	if (userExistByEmail && userExistByUsername) {
		res.status(409)
		throw new Error('Username & Email already taken.')
	}

	// by username
	if (userExistByUsername) {
		res.status(409)
		throw new Error('Username already taken.')
	}

	// by email
	if (userExistByEmail) {
		res.status(409)
		throw new Error('Email already taken.')
	}

	if (!code) {
		code = `M00${users.length + 1}`
	}

	// Hash Password
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(password, salt)

	// Create User
	const user = await User.create({
		name,
		email,
		username,
		code,
		penalty,
		password: hashedPassword,
	})

	// check if create user fail.
	if (!user) {
		res.status(400)
		throw new Error('Invalid user data.')
	}

	// find user devices
	const userDevices = await Device.find({ user: user._id })

	// check device limit.
	if (userDevices > 5) {
		res.status(401)
		throw new Error('Your Devices is limit. Logout or tell admin.')
	}

	// collect user device from request header
	const userAgent = req.headers['user-agent'].toString()

	// find existing user device or create a new one.
	const device =
		(await Device.findOne({ device: userAgent, user: user._id })) ||
		(await Device.create({
			device: userAgent,
			user: user._id,
		}))

	// if device fail.
	if (!device) {
		res.status(401)
		throw new Error('Unauthorized: Invalid Credentials.')
	}

	// add & save refreshToken
	const refreshToken = {
		device: device._id,
		token: generateRefreshToken(user._id),
	}
	user.refreshTokens.push(refreshToken)
	await user.save()

	// set cookie refresh token.
	res.cookie('jwt', refreshToken.token, {
		// httpOnly: true,
		// sameSite: 'None',
		// secure: true,
		maxAge: 24 * 60 * 60 * 1000,
	})

	// set status code
	res.status(201)

	// set response json
	res.json({
		accessToken: generateAccessToken(user._id),
		userProfile: {
			_id: user._id,
			username,
			name,
		},
	})
})

// @desc Login User
// @route POST /api/users/login
// @access PUBLIC
const loginUser = asyncHandler(async (req, res) => {
	const { text, password } = req.body

	// check user
	const user = (await User.findOne({ email: text })) || (await User.findOne({ username: text }))

	// check user
	if (!user || !(await bcrypt.compare(password, user.password))) {
		res.status(401)
		throw new Error('Unauthorized: Invalid Credentials.')
	}

	// collect user data
	const { _id, username, name } = user
	const userDevices = await Device.find({ user: _id })

	// if user devices limit.
	if (userDevices && userDevices > 5) {
		res.status(401)
		throw new Error('Your Devices is limit. Logout or tell admin.')
	}

	// collect user device from request headers
	const userAgent = req.headers['user-agent'].toString()

	// create a new one or find saved device
	const device =
		(await Device.findOne({ device: userAgent, user: user._id })) ||
		(await Device.create({
			device: userAgent,
			user: user._id,
		}))

	// check device
	if (!device) {
		res.status(401)
		throw new Error('Unauthorized: Invalid Credentials.')
	}

	// find saved token
	let refreshToken = user.refreshTokens.find(
		(rt) => JSON.stringify(rt.device) === JSON.stringify(device.id)
	)

	// check existing token
	if (!refreshToken) {
		// add new refresh token
		refreshToken = {
			device: device._id,
			token: generateRefreshToken(_id),
		}

		user.refreshTokens.push(refreshToken)
		await user.save()
	}

	// set refresh token in cookie
	res.cookie('jwt', refreshToken.token, {
		// httpOnly: true,
		// sameSite: 'None',
		// secure: true,
		maxAge: 24 * 60 * 60 * 1000,
	})

	// set response json
	res.json({
		accessToken: generateAccessToken(user._id),
		userProfile: {
			_id,
			username,
			name,
		},
	})

	// set status code
	res.status(200)
})

// @desc Get User Profile
// @route GET /api/users/:username
// @access PUBLIC & PRIVATE
const getUserProfile = asyncHandler(async (req, res) => {
	const usernameParam = req.params.username
	const userExist = await User.findOne({ username: usernameParam })

	let user
	
	// if user exist
	if (!userExist) {
		res.status(404)
		throw new Error('the username is invalid.')
		
	}
	
	// Public Response
	if (!(JSON.stringify(userExist._id) === JSON.stringify(req?.user?._id))) {
		user = await User.findById(userExist._id)
			.populate('books', 'code')
			.select({
				_id: 1,
				username: 1,
				name: 1,
				loans: 1,
				penalty: 1,
			})
			.lean()

		return res.status(200).json({
			...user,
		})
	}

	user = await User.findById(userExist._id)
		.populate('books', 'code title')
		.populate('loans', 'isComplete endOfLoan')
		.select({
			_id: 1,
			username: 1,
			name: 1,
			email: 1,
			books: 1,
			loans: 1,
			penalty: 1,
		})
		.lean()

	res.status(200).json({
		user,
	})
})

// @desc Get Users
// @route GET /api/users
// @access PUBLIC
const getUsers = asyncHandler(async (req, res) => {
	const users = await User.find()
		.populate('books', req.user ? 'code title' : 'code')
		.select({
			_id: 1,
			code: 1,
			username: 1,
			name: 1,
			penalty: 1,
			books: 1,
		})
		.lean()

	const borrowedBooks = await Book.find({ stock: 0 }).select('_id').lean()

	if (!users) {
		res.status(404).json({
			message: 'users not found!',
		})
	}

	res.status(200).json({
		users,
		totalUsers: users.length,
		totalBorrowedBooks: borrowedBooks.length,
	})
})

// @desc handle Refresh Token
// @route GET /api/users/refreshToken
// @access KINDA PRIVATE
const handleRefreshToken = asyncHandler(async (req, res) => {
	// collect cookies
	const cookies = req.cookies

	// check jwt cookie
	if (!cookies?.jwt) {
		res.sendStatus(401) // Uauthorized
		throw new Error('Unauthorized, no refresh token!')
	}

	// get refresh token from jwt cookie
	const refreshToken = cookies.jwt

	// verif refresh token
	const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

	// find user by refresh token
	const user = await User.findById(decoded.id)

	// get user data
	const { _id, username, name } = user

	// if user not found
	if (!user) {
		res.sendStatus(403) // Uauthorized
		throw new Error('Forbidden, WHO ARE U!!')
	}

	try {
		// check refresh token and user id
		if (`${user._id}` !== decoded.id) {
			res.status(403)
			throw new Error('Forbidden: WHO ARE U!!!')
		}

		// set code
		res.status(200)

		// set response
		res.json({
			accessToken: generateAccessToken(_id),
			userProfile: {
				_id,
				username,
				name,
			},
		})
	} catch (error) {
		res.status(403)
		throw new Error('Forbidden: WHO ARE U!!!')
	}
})

// @desc logout user
// @route DELETE /api/users/logout
// @access PRIVATE
const logout = asyncHandler(async (req, res) => {
	// collect user device
	const userAgent = req.headers['user-agent'].toString()

	// collect cookies
	const cookies = req.cookies

	// check jwt in cookies
	if (!cookies?.jwt) {
		res.sendStatus(204) // Uauthorized
		throw new Error('No Content')
	}

	// collect refresh token in cookie
	const refreshToken = cookies.jwt

	// verif refresh token
	const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

	// find user by refresh token
	const user = await User.findById(decoded.id)

	// find user device
	const device = await Device.findOne({ device: userAgent, user: req.user._id })

	// check device and user
	if (!device || !user) {
		res.status(400)
		throw new Error('Device or User not match.')
	}

	// set refresh token to undefined
	const filteredRefreshTokens = user.refreshTokens.filter(
		(rt) => JSON.stringify(rt.device) !== JSON.stringify(device.id)
	)
	user.refreshTokens = filteredRefreshTokens
	await user.save()

	// remove target user device
	await device.remove()

	// clear refresh token cookie
	res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })

	// set response
	res.json({
		message: `Success Logout.`,
	})

	// set status code
	res.status(204)
})

// @desc Generate JWT accessToken
const generateAccessToken = (id) => {
	return jwt.sign(
		{
			UserInfo: {
				id,
			},
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '1d' }
	)
}

// @desc Generate JWT refreshToken
const generateRefreshToken = (id) => {
	return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {})
}

module.exports = {
	registerUser,
	loginUser,
	getUserProfile,
	logout,
	handleRefreshToken,
	getUsers,
}
