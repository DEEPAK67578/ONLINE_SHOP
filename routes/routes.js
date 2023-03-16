const express = require("express");
const router = express.Router();
const db = require("../data/database");

router.get("/", function (req, res) {
  res.redirect("/shop");
});

router.get("/shop", async function (req, res) {
  if (req.session.isAuth) {
    const userData = req.session.user;
    const { userEmail } = userData.email;
    const user = await db.getdb().collection("users").findOne(userEmail);
    console.log(user);
    if (user.isAuthenticated) {
      return res.render("Admin/products");
    }
  }
  res.render("customer/products");
});
router.get("/cart", function (req, res) {
  res.render("customer/cart");
});
router.get("/details", function (req, res) {
  res.render("customer/details");
});

module.exports = router;
