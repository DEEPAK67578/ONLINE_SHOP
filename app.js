const express = require('express')
const path = require('path')
const routes = require('./routes/routes')

const db = require('./data/database') 
const app = express()
app.use(express.urlencoded({extended:false}))

app.use(express.static('public'))

app.set('view engine','ejs')

app.set('views',path.join(__dirname,'views'))

app.use(routes)

db.connectToDatabase().then(
    function() {
        app.listen(3000)
    }
)

