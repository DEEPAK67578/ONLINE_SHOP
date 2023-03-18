const express = require("express");
const router = express.Router();
const db = require("../data/database");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
router.get("/", function (req, res) {
  res.redirect("/shop");
});

router.get("/shop", async function (req, res) {
  const productData = await db
    .getdb()
    .collection("productDetails")
    .find()
    .toArray();

  if (req.session.isAuth) {
    const userData = req.session.user;
    console.log(req.session.user);
    const userEmail = userData.email;
    const user = await db
      .getdb()
      .collection("users")
      .findOne({ email: userEmail });
    if (user.isAuthenticated) {
      return res.render("Admin/products", {
        productData: productData,
      });
    }
  }
  res.render("customer/products", { productData: productData,quantity:req.session.cartQuantity});
});

router.get("/cart", async function (req, res) {
  if (req.session.isAuth) {
    const user = req.session.user;
    const cartItems = await db
      .getdb()
      .collection("cart")
      .find({ user: user.email })
      .toArray();

    let cartValue = 0;
    for (const cart of cartItems) {
      cartValue = cartValue + cart.price * cart.items;
    }
    return res.render("customer/cart", {
      cartItems: cartItems,
      cartValue: cartValue,
      isAuth: req.session.isAuth,quantity:req.session.cartQuantity
    });
  }
  res.render("customer/cart", { isAuth: req.session.isAuth,quantity:req.session.cartQuantity});
});

router.get("/:id/details", async function (req, res) {
  const productDetails = await db
    .getdb()
    .collection("productDetails")
    .findOne({ _id: new ObjectId(req.params.id) });
  let inputData = req.session.inputData;
  if (!inputData) {
    inputData = {
      isError: "",
      message: "",
    };
  }
  req.session.inputData = null;
  let quantity = 0
  if(req.session.isAuth) {
    const user = req.session.user;
    const cartItems = await db.getdb().collection('cart').find({user:user.email}).toArray()
    for(const cartItem of cartItems) {
      quantity = quantity + cartItem.items
    }
  }
  req.session.cartQuantity = quantity
  return res.render("customer/details", {
    productDetails: productDetails,
    input: inputData,
    quantity:req.session.cartQuantity
  });
});

router.post("/:id/details", async function (req, res) {
  const productDetails = await db
    .getdb()
    .collection("productDetails")
    .findOne({ _id: new ObjectId(req.params.id) });
  const user = req.session.user;
  if (!req.session.isAuth) {
    req.session.inputData = {
      isError: true,
      message: "Please Log in to add to cart and purchase the products",
    };
    return res.redirect("/" + req.params.id + "/details");
  }

  if (req.session.isAuth) {
    const data = await db
      .getdb()
      .collection("cart")
      .findOne({ productid: req.params.id, user: user.email});
    if (data) {
      await db
        .getdb()
        .collection("cart")
        .updateOne(
          { productid: req.params.id,user:user.email },
          { $set: { items: data.items + 1 } }
        );
    } else {
      await db
        .getdb()
        .collection("cart")
        .insertMany([
          {
            productName: productDetails.title,
            price: productDetails.price,
            items: 1,
            productid: req.params.id,
            user: user.email,
          },
        ]);
    }
    res.redirect("/" + req.params.id + "/details");
  }
});

module.exports = router;
