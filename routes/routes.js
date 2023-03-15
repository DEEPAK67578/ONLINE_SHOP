const express = require('express')
const router = express.Router()

router.get('/',function(req,res) {
    res.redirect('/shop')
})

router.get('/shop',function(req,res) {
    res.render('products')
})
router.get('/cart',function(req,res) {
    res.render('cart')
})
router.get('/details',function(req,res) {
    res.render('details')
})


module.exports = router