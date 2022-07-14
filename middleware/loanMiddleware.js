const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')

const protectLoan = asyncHandler(async (req, res, next) => {
	const { loans } = req.user
	const { id } = req.params
	const loanId = mongoose.Types.ObjectId(id)

	if (!loans.includes(loanId)) {
		res.status(403)
		throw new Error('Forbidden')
	}
	next()
})

module.exports = { protectLoan }
