const mongoose = require('mongoose')
const { Schema, model } = mongoose

const loanSchema = mongoose.Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Please add a user'],
		},

		book: {
			type: Schema.Types.ObjectId,
			ref: 'Book',
			required: [true, 'Please add a book'],
		},

		isDone: {
			type: Boolean,
			required: [true, 'Please add book status'],
		},

		endOfLoan: {
			type: Date,
			required: [true, 'Please add the end of the loan'],
		},

		message: {
			type: [String],
			required: [true, 'Please add the end of the loan'],
		},
	},

	{
		timestamps: true,
	}
)

module.exports = model('Loan', loanSchema)
