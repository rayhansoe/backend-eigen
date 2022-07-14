const Book = require('../models/bookModel')
const ObjectId = require('mongoose').Types.ObjectId
const asyncHandler = require('express-async-handler')

// @desc set Book
// @route POST /api/books/
// @access MUST BE PRIVATE
const setBook = asyncHandler(async (req, res) => {
	// define book fields
	const { code, title, author } = req.body
	const stock = 1
	const synopsis = `${title} Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur, minus. Laborum necessitatibus praesentium esse ratione ut quisquam, voluptatem atque neque ullam vel maiores sed unde?`

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
		synopsis,
	})

	// check if create user fail.
	if (!book) {
		res.status(400)
		throw new Error('Invalid book data.')
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
	const { isAvailable, isBorrowed } = req.query

	// get all books
	const books = await ((isBorrowed && isAvailable) || (!isBorrowed && !isAvailable) // is READ all books ?
		? // then show all books
		  Book.find()
		: // check isAvailable books
		isAvailable
		? // then show available books
		  Book.find({ stock: 1 })
		: // show isBorrowed books / unavailable books
		  Book.find({ stock: 0 })
	)
		.populate('user', req.user ? 'code name' : 'code')
		.populate('loans', req.user ? 'endOfLoan completedAt' : '_id')
		.select({
			_id: 1,
			code: 1,
			title: 1,
			author: 1,
			stock: 1,
			user: 1,
			slug: 1,
			loans: 1,
		})
		.lean()

	// status & response
	res.status(200).json({
		books,
		total: books.length,
	})
})

// @desc Read Book by params
// @route GET /api/books/:params
// @access SEMI PUBLIC
const getBookByParams = asyncHandler(async (req, res) => {
	const { params } = req.params

	// find book by params
	const book = await (ObjectId.isValid(params) // params === id ?
		? // then findById
		  Book.findById({ _id: params })
		: // then findOne by slug
		  Book.findOne({ slug: params })
	)
		.populate('user', req.user ? 'name code' : 'code')
		.populate('loans', req.user ? 'endOfLoan completedAt isCompleted isForced message' : 'endOfLoan completedAt')
		.select({
			_id: 1,
			code: 1,
			title: 1,
			author: 1,
			stock: 1,
			user: 1,
			synopsis: 1,
			slug: 1,
		})
		.lean()

	// check book
	if (!book) {
		res.status(404)
		throw new Error('book not found')
	}

	// status & response
	res.status(200).json({
		book,
	})
})

module.exports = {
	setBook,
	getBooks,
	getBookByParams,
}
