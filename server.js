const cors = require('cors')
const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const cookieParser = require('cookie-parser')

const connectDB = require('./config/db')
const corsOption = require('./config/corsOption')
const credentials = require('./middleware/credentials')
const { errorHandler } = require('./middleware/errorMiddleware')

const port = process.env.PORT || 5000

connectDB()

const app = express()

app.use(credentials)

app.use(cors(corsOption))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// cookie middleware
app.use(cookieParser())

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/books', require('./routes/bookRoutes'))
app.use('/api/loans', require('./routes/loanRoutes'))

if (process.env.NODE_ENV === 'production') {
	app.get('/', (req, res) => res.redirect(301, 'http://goalsapp-one.vercel.app'))
} else {
	app.get('/', (req, res) => res.send('Please set to production'))
}

app.use(errorHandler)

app.listen(port, () => console.log(`Server started on port ${port}`))
