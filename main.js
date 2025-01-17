// Imports 
const dotenv = require('dotenv');
dotenv.config({path: './.env'})
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const morgan = require('morgan')

const app  = express()
const PORT = process.env.PORT || 4000;

// Database Connection 

const db = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)
mongoose.connect(db, {useNewUrlParser: true});
mongoose.connection.on('error', (err) => {
    console.log(err)
})
mongoose.connection.once('open',() => {
    console.log('Database Connected.')
})


// Middleware 

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(session({
    secret: 'my-secret-key',
    saveUninitialized: true,
    resave: false
}))
app.use(morgan('dev'))
app.use((req,res,next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next()
})

app.use(express.static('uploads'))

// Set Template Engine 
app.set('view engine', 'ejs')

// route prefix 
app.use("",require('./routes/routes'))

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`)
})