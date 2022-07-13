const express = require('express')
const router = express.Router()

const { setBook, getBooks, getBookByParams } = require('../controllers/bookController')

// Book Routes
// Read All Books
// Read Available Books
// Pinjam Book
// Balikin Buku

// Functions
// getAllBooks
// getAvailBooks
// borrowBook
// balikinBook

router.route('/').get(getBooks).post(setBook) // Set Book
router.route('/:params').get(getBookByParams) // Get Available Books
// router.route('/:id').get(getBookByID) // Get Unavailable Books
// router.route('/') // Pinjam Books | PUT or POST ?
// router.route('/') // Balikin Books | PUT or POST ?

module.exports = router
