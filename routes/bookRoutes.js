const express = require('express')
const router = express.Router()

const { semiProtected, protect } = require('../middleware/authMiddleware')
const { setBook, getBooks, getBookByParams } = require('../controllers/bookController')

router.route('/').get(semiProtected, getBooks).post(protect, setBook) // Set Book | Get Books
router.route('/:params').get(semiProtected, getBookByParams) // Get Detail Book

module.exports = router
