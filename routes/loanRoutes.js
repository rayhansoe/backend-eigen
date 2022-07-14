const express = require('express')
const router = express.Router()

const {
	setLoan,
	getLoans,
	getLoanById,
	getMyLoans,
	completeTheLoan,
} = require('../controllers/loanController')
const { protect, semiProtected } = require('../middleware/authMiddleware')
const { protectBook } = require('../middleware/bookMiddleware')
const { protectLoan } = require('../middleware/loanMiddleware')
const { protectUser } = require('../middleware/userMiddleware')

router.route('/').get(semiProtected, getLoans).post(protect, protectUser, protectBook, setLoan) // GET or SET Loan
router.route('/myloans/').get(protect, getMyLoans) // Read My Loans
router.route('/:id').get(semiProtected, getLoanById).put(protect, protectLoan, completeTheLoan) // get detail loan or complete the loan.

module.exports = router
