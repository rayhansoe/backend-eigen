const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const colors = require('colors')
const connectDB = require('./config/db')
const { errorHandler } = require('./middleware/errorMiddleware')
const corsOption = require('./config/corsOption')
const cookieParser = require('cookie-parser')
const credentials = require('./middleware/credentials')
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

if (process.env.NODE_ENV === 'production') {
	app.get('/', (req, res) => res.redirect(301, 'http://goalsapp-one.vercel.app'))
} else {
	app.get('/', (req, res) => res.send('Please set to production'))
}

app.use(errorHandler)

app.listen(port, () => console.log(`Server started on port ${port}`))
