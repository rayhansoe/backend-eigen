const express = require('express')
const router = express.Router()

const { setLoan } = require('../controllers/loanController')
const { protect } = require('../middleware/authMiddleware')
const { protectBook } = require('../middleware/bookMiddleware')
const { protectUser } = require('../middleware/userMiddleware')
// create loan
// read all loans
// read uncompleted / active loan
// read completed loan
// read completed loan by forced
// selesaikan loan

// GET & SET Loan
router.route('/').post(protect, protectUser, protectBook, setLoan).get()

module.exports = router
