const asyncHandler = require('express-async-handler')

const protectUser = asyncHandler(async (req, res, next) => {
	const books = req?.user?.books
	if (books && books.length >= 2) {
		res.status(403)
		throw new Error("You can't borrow this book because you already borrowed 2 other books")
	}
	next()
})

module.exports = { protectUser }
