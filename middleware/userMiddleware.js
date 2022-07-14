const asyncHandler = require('express-async-handler')

const protectUser = asyncHandler(async (req, res, next) => {
	// collect data
	const books = req?.user?.books
	const isPenalized = req?.user?.penalty

	// if user got punishment
	if (isPenalized) {
		res.status(403)
		throw new Error('You cannot borrow this book because you are penalized.')
	}
	
	// if user borrow >= 2
	if (books && books.length >= 2) {
		res.status(403)
		throw new Error("You can't borrow this book because you already borrowed 2 other books.")
	}

	// next
	next()
})

module.exports = { protectUser }
