const mongoose = require('mongoose')
const { Schema, model } = mongoose

const bookSchema = mongoose.Schema(
	{
		code: {
			type: String,
			required: [true, 'Please add a code of book'],
			unique: true,
		},

		title: {
			type: String,
			required: [true, 'Please add a title'],
		},

		author: {
			type: String,
			required: [true, 'Please add a author'],
		},

		slug: {
			type: String,
			required: [true, 'Please add a slug'],
			unique: true,
		},

		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},

		stock: {
			type: Number,
			required: [true, 'Please add a stock'],
		},
	},

	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Book', bookSchema)
