const asyncHandler = require('express-async-handler')

const Loan = require('../models/loanModel')
const Book = require('../models/bookModel')
const User = require('../models/userModel')

// @desc Set Loan
// @route POST /api/loans
// @access PRIVATE
const setLoan = asyncHandler(async (req, res) => {
	// Get user & book
	const user = await User.findById(req?.user?._id)
	const book = await Book.findById(req?.query?.bookId)

	const date = new Date() // get date
	const endOfLoan = date.setDate(date.getDate() + 7) // generate book return deadline
	const message = [`${user.code} borrowed the ${book.code} book.`] // message for the first data creation action.

	try {
		// set loan
		const loan = await Loan.create({
			user: user._id,
			book: book._id,
			isCompleted: false,
			isForced: false,
			endOfLoan,
			message,
		})

		// update user data
		user?.books?.push(book._id) // push book to user collection
		user.loans.push(loan._id) // push loan to user collection
		await user.save()

		// update book data
		book.stock = 0 // decrease book stock
		book.loans.push(loan?._id) // push loan to book collection
		book.user = user?._id // push user to book collection
		await book.save()

		// populate loan data for client side
		const responseLoan = await Loan.findById(loan._id)
			.populate('user', 'name')
			.populate('book', 'title')
			.lean()

		// status code and response
		res.status(201).json({
			loan: responseLoan,
		})
	} catch (error) {
		// if failed to set loan or borrow this book.
		res.status(424)
		throw new Error('Failed to borrow this book.')
	}
})

// @desc Read Loans
// @route Get /api/loans/
// @access SEMI PUBLIC
const getLoans = asyncHandler(async (req, res) => {
	// get queries
	let { isActive, isCompleted, isForced } = req.query

	// convert string to boolean
	isActive = isActive === 'true'
	isCompleted = isCompleted === 'true'
	isForced = isForced === 'true'

	// GET LOANS
	const loans = await ((isActive && isCompleted && isForced) || // is READ all loans ?
	(!isActive && !isCompleted && !isForced) || // is READ all loans ?
	(isActive && isCompleted) // is READ all loans ?
		? // then show all loans
		  Loan.find()
		: // check completed loans
		isCompleted
		? // then show completed loans
		  Loan.find({ isCompleted })
		: // check active & forced loans
		isActive && isForced
		? // then show active & forced loans
		  Loan.find({ $or: [{ isCompleted: !isActive }, { isForced }] })
		: // check active loans
		isActive
		? // then show active loans
		  Loan.find({ isCompleted: !isActive })
		: // the show forced loans
		  Loan.find({ isForced })
	)
		.populate('user', req.user ? 'name' : 'code') // for public just show the code
		.populate('book', req.user ? 'title' : 'code') // for public just show the code
		.select({ message: 0, createdAt: 0, updatedAt: 0 })
		.lean()

	// status & response
	res.status(200).json({
		loans,
		total: loans.length,
	})
})

// @desc Read Loan by Id
// @route GET /api/loans/:id
// @access SEMI PUBLIC
const getLoanById = asyncHandler(async (req, res) => {
	// get Loan Id from parameter
	const loanId = req.params?.id

	try {
		// find loan by id
		const loan = await Loan.findById(loanId)
			.populate('user', req.user ? 'name' : 'code') // for public just show the code
			.populate('book', req.user ? 'title' : 'code') // for public just show the code
			.lean()

		// status code & response
		res.status(200).json({
			loan,
		})
	} catch (error) {
		// if failed to find or load the loan data.
		res.status(424)
		throw new Error('Failed to load this loan data.')
	}
})

// @desc Read My Loan
// @route GET /api/loans/myloans
// @access PRIVATE
const getMyLoans = asyncHandler(async (req, res) => {
	// get queries
	let { isActive, isCompleted, isForced } = req.query

	// convert string to boolean
	isActive = isActive === 'true'
	isCompleted = isCompleted === 'true'
	isForced = isForced === 'true'

	// GET LOANS
	const loans = await ((isActive && isCompleted && isForced) || // is READ all loans ?
	(!isActive && !isCompleted && !isForced) || // is READ all loans ?
	(isActive && isCompleted) // is READ all loans ?
		? // then show all loans
		  Loan.find({ user: req.user._id })
		: // check completed loans
		isCompleted
		? // then show completed loans
		  Loan.find({ user: req.user._id, isCompleted })
		: // check active & forced loans
		isActive && isForced
		? // then show active & forced loans
		  Loan.find({ user: req.user._id, $or: [{ isCompleted: !isActive }, { isForced }] })
		: // check active loans
		isActive
		? // then show active loans
		  Loan.find({ user: req.user._id, isCompleted: !isActive })
		: // the show forced loans
		  Loan.find({ isForced })
	)
		.populate('user', 'name') // for public just show the code
		.populate('book', 'title') // for public just show the code
		.select({ message: 0, createdAt: 0, updatedAt: 0 }) // selecting the field for response
		.lean()

	// status code & response
	res.status(200).json({
		loans,
		total: loans.length,
	})
})

// @desc Update My Loan
// @route PUT /api/loans/:id
// @access PRIVATE
const completeTheLoan = asyncHandler(async (req, res) => {
	try {
		let loan = await Loan.findById(req.params?.id)
		let user = await User.findById(req?.user?._id)
		let book = await Book.findById(loan?.book)

		if (!loan || !user || !book) {
			res.status(424)
			throw new Error('Failed to load this loan data.')
		}

		// update loan data
		loan.isCompleted = true
		loan.completedAt = new Date()
		loan.message.push(`${book.title} book has been returned by ${user.name} on ${new Date()}`)
		await loan.save()

		// update user
		const newBooks = user.books.filter((id) => JSON.stringify(id) !== JSON.stringify(book._id))
		user.books = newBooks
		await user.save()

		// update user
		book.stock = 1
		book.user = null
		await book.save()

		loan = await Loan.findById(loan._id)
			.select({ _id: 1, isCompleted: 1, message: 1, completedAt: 1 })
			.lean()
		user = await User.findById(user?._id)
			.populate('books', 'title code')
			.select({ _id: 1, name: 1, code: 1, books: 1 })
			.lean()
		book = await Book.findById(book?._id).select({ _id: 1, code: 1, title: 1, stock: 1 }).lean()

		res.status(200).json({
			loan,
			book,
			user,
		})
	} catch (error) {
		res.status(424)
		throw new Error(error)
	}
})

module.exports = {
	setLoan,
	getLoans,
	getLoanById,
	getMyLoans,
	completeTheLoan,
}
