const express = require('express')
const path = require('path')

const session = require('express-session')
const MongoSession = require('connect-mongodb-session')(session)

const routes = require('./routes/routes')
const authRoutes = require('./routes/auth')

const db = require('./data/database') 
const app = express()
app.use(express.urlencoded({extended:false}))

const MongoStoreSession = new MongoSession({
    uri:'mongodb://127.0.0.1:27017',
    collection:'session'
})

app.use(express.static('public'))

app.set('view engine','ejs')

app.set('views',path.join(__dirname,'views'))

app.use(session({
    secret:'superSecret',
    saveUninitialized:false,
    resave:false,
    store:MongoStoreSession
}))

app.use(authRoutes)

app.use(routes)

db.connectToDatabase().then(
    function() {
        app.listen(3000)
    }
)

