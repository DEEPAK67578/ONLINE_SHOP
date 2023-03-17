const express = require("express");
const router = express.Router();
const db = require("../data/database");
const mongodb = require('mongodb')
const ObjectId = mongodb.ObjectId

router.get("/", function (req, res) {
  res.redirect("/shop");
});

router.get("/shop", async function (req, res) {
  const productData =await db.getdb().collection('productDetails').find().toArray()
  console.log(productData)
  if (req.session.isAuth) {
    const userData = req.session.user;
    console.log(req.session.user);
    const userEmail = userData.email;
    const user = await db
      .getdb()
      .collection("users")
      .findOne({ email: userEmail });
    if (user.isAuthenticated) {
      return res.render("Admin/products",{productData:productData});
    }
  }
  res.render("customer/products",{productData:productData});
});

router.get("/cart", function (req, res) {
  const cartItems = req.session.cart

  res.render("customer/cart",{cartItems:cartItems});
});

router.get("/:id/details",async function (req, res) {
  const productDetails = await db.getdb().collection('productDetails').findOne({_id:new ObjectId(req.params.id)})
  res.render("customer/details",{productDetails:productDetails});
});


module.exports = router;
