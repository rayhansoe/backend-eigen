const mongoose = require('mongoose')

const deviceSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},

		device: {
			type: String,
			required: [true, 'Please add a text value'],
		},
	},

	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Device', deviceSchema)
