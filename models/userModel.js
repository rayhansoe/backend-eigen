const mongoose = require('mongoose')
const { Schema, model } = mongoose

const userSchema = new Schema(
	{
		code: {
			type: String,
			required: [true, 'Please add an code user.'],
			unique: true,
		},

		name: {
			type: String,
			required: [true, 'Please add a name'],
		},

		penalty: {
			type: Boolean,
			required: [true, 'Please add an penalty status.'],
		},

		email: {
			type: String,
			required: [true, 'Please add an email.'],
			unique: true,
		},

		password: {
			type: String,
			required: [true, 'Please add an password.'],
		},

		username: {
			type: String,
			required: [true, 'Please add an username.'],
			unique: true,
		},

		books: {
			type: [Schema.Types.ObjectId],
			ref: 'Book',
			unique: true,
		},

		loans: {
			type: [Schema.Types.ObjectId],
			ref: 'Loan',
			unique: true,
		},

		refreshTokens: {
			type: Array,
			unique: true,
		},
	},

	{
		timestamps: true,
	}
)

module.exports = model('User', userSchema)
