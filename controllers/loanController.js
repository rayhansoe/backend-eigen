const asyncHandler = require('express-async-handler')

const Loan = require('../models/loanModel')
const Book = require('../models/bookModel')
const User = require('../models/userModel')

// @desc Set Loan
// @route POST /api/loans
// @access PRIVATE
const setLoan = asyncHandler(async (req, res) => {
	const user = await User.findById(req?.user?._id)
	const book = await Book.findById(req?.query?.bookId)

	const date = new Date()
	const endOfLoan = date.setDate(date.getDate() + 7)
	const message = [`${user.code} borrowed the ${book.code} book.`]

	try {
		const loan = await Loan.create({
			user: user._id,
			book: book._id,
			isCompleted: false,
			isForced: false,
			endOfLoan,
			message,
		})

		user?.books?.push(book._id)
		await user.save()

		book.stock = 0
		await book.save()

		book.loanId = loan?._id
		await book.save()

		book.user = user?._id
		await book.save()

		const responseLoan = await Loan.findById(loan._id)
			.populate('user', 'name')
			.populate('book', 'title')
			.lean()

		res.status(201).json({
			loan: responseLoan,
		})
	} catch (error) {
		res.status(424)
		throw new Error('Failed to borrow this book.')
	}
})

// @desc Read Books
// @route Get /api/books/
// @access PUBLIC
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

module.exports = {
	setLoan,
	getLoans,
}
