const Book = require('../models/bookModel')
const asyncHandler = require('express-async-handler')

// @desc set Book
// @route POST /api/books/
// @access MUST BE PRIVATE
const setBook = asyncHandler(async (req, res) => {
	const { code, title, author } = req.body
	const stock = 1

	// check the fields
	if (!code || !title || !author) {
		res.status(400)

		throw new Error('Please add all fields.')
	}

	// check code of book
	const bookExistByCode = await Book.findOne({ code })

	// by code book
	if (bookExistByCode) {
		res.status(409)
		throw new Error('Code already taken.')
	}

	// create slug | title + code
	const slug = `${title} ${code}`
		.toString() // Cast to string (optional)
		.normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
		.toLowerCase() // Convert the string to lowercase letters
		.trim() // Remove whitespace from both sides of a string (optional)
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-')

	// create book
	const book = await Book.create({
		code,
		author,
		title,
		stock,
		slug,
	})

	// check if create user fail.
	if (!book) {
		res.status(400)
		throw new Error('Invalid user data.')
	}

	// set status code & response json
	res.status(201).json({
		book,
	})
})

// @desc Read Books
// @route GET /api/books/
// @access PUBLIC
const getBooks = asyncHandler(async (req, res) => {
	const { available, borrowed } = req.query

	// get all books
	let books = await Book.find()
		.select({
			_id: 1,
			code: 1,
			title: 1,
			author: 1,
			stock: 1,
			user: 1,
			slug: 1,
		})
		.lean()

	// check available book query is true
	if (available) {
		books = await Book.find({ stock: 1 })
			.select({
				_id: 1,
				code: 1,
				title: 1,
				author: 1,
				stock: 1,
				user: 1,
				slug: 1,
			})
			.lean()
	}

	// check unavailable / borrowed book query is true
	if (borrowed) {
		books = await Book.find({ stock: 0 })
			.select({
				_id: 1,
				code: 1,
				title: 1,
				author: 1,
				stock: 1,
				user: 1,
				slug: 1,
			})
			.lean()
	}

	// check apakah ada yang iseng klo available & borrowed is true
	if (borrowed && available) {
		books = await Book.find()
			.select({
				_id: 1,
				code: 1,
				title: 1,
				author: 1,
				stock: 1,
				user: 1,
				slug: 1,
			})
			.lean()
	}

	// status & response
	res.status(200).json({
		books,
		total: books.length,
	})
})

module.exports = {
	setBook,
	getBooks,
}
