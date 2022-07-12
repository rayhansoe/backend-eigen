const express = require('express')
const router = express.Router()

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

router.route('/').get() // Get All Books
router.route('/').get() // Get Available Books
router.route('/') // Pinjam Books | PUT or POST ?
router.route('/') // Balikin Books | PUT or POST ?

module.exports = router
