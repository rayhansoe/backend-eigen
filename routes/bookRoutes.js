const express = require('express')
const router = express.Router()

const { setBook, getBooks, getBookByParams } = require('../controllers/bookController')

router.route('/').get(getBooks).post(setBook) // Set Book | Get Books
router.route('/:params').get(getBookByParams) // Get Detail Book

module.exports = router
