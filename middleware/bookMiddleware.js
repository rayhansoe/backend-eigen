const asyncHandler = require('express-async-handler')

const Book = require('../models/bookModel')

const protectBook = asyncHandler(async (req, res, next) => {
	const { bookId } = req.query
	let isBorrowed

	try {
		const book = await Book.findById(bookId)

		if (!book) {
			res.status(404)
			throw new Error('Book is not found')
		}

		if (book?.stock !== 1) {
			isBorrowed = true
			throw new Error()
		}
		next()
	} catch (error) {
		if (isBorrowed) {
			res.status(403)
			throw new Error("You can't borrow this book because the book has been borrowed")
		}

		res.status(404)
		throw new Error('Book is not found')
	}
})

module.exports = { protectBook }
