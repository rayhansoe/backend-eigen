const asyncHandler = require('express-async-handler')

const Book = require('../models/bookModel')

const protectBook = asyncHandler(async (req, res, next) => {
	// collect book id
	const { bookId } = req.query

	// declare isBorrowed var
	let isBorrowed

	try {
		// get book by id
		const book = await Book.findById(bookId)
		
		// if book doesn't exist
		if (!book) {
			res.status(404)
			throw new Error('Book is not found')
		}
		
		// if book is borrowed
		if (book?.stock !== 1) {
			isBorrowed = true
			throw new Error()
		}

		next()
	} catch (error) {
		
		// if book is borrowed
		if (isBorrowed) {
			res.status(403)
			throw new Error("You can't borrow this book because the book has been borrowed")
		}

		// if book doesn't exist
		res.status(404)
		throw new Error('Book is not found')
	}
})

module.exports = { protectBook }
