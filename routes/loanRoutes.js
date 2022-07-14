const express = require('express')
const router = express.Router()

const { setLoan, getLoans, getLoanById } = require('../controllers/loanController')
const { protect, semiProtected } = require('../middleware/authMiddleware')
const { protectBook } = require('../middleware/bookMiddleware')
const { protectUser } = require('../middleware/userMiddleware')
// create loan
// read all loans
// read uncompleted / active loan
// read completed loan
// read completed loan by forced
// selesaikan loan

// GET & SET Loan
router.route('/').get(semiProtected, getLoans).post(protect, protectUser, protectBook, setLoan)
router.route('/:id').get(semiProtected, getLoanById)

module.exports = router
