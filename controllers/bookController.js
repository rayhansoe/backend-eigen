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

	// create book
	const book = await Book.create({
		code,
		author,
		title,
		stock,
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
	const books = await Book.find()

	res.status(200).json({
		books,
		total: books.length,
	})
})

module.exports = {
	setBook,
	getBooks,
}
