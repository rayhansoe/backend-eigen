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

module.exports = {
	setLoan,
}
