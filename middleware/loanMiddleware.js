const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')

const Loan = require('../models/loanModel')

const protectLoan = asyncHandler(async (req, res, next) => {
	const { loans } = req.user
	const { id } = req.params
	const loanId = mongoose.Types.ObjectId(id)

	const loan = await Loan.findById(id).select('isCompleted completedAt').lean()

	// is My Loan ?
	if (!loans.includes(loanId)) {
		res.status(403)
		throw new Error("You can't access! watch whose book you're returning!")
	}

	// is My Active Loan ?
	if (loan) {
		res.status(403)
		throw new Error('You have returned this book')
	}
	next()
})

module.exports = { protectLoan }
