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
  res.render("customer/products", { productData: productData });
});

router.get("/cart", async function (req, res) {
  if (req.session.isAuth) {
    const user = req.session.user;
    let cartItems = await db
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
      isAuth: req.session.isAuth,
    });
  }
  res.render("customer/cart", { isAuth: req.session.isAuth });
});

router.post("/cart/:id", async function (req, res) {
  const user = req.session.user;
  await db
    .getdb()
    .collection("cart")
    .updateMany(
      { _id: new ObjectId(req.params.id) },
      { $set: { items: Number(req.body.count) } }
    );
  const cartItems = await db
    .getdb()
    .collection("cart")
    .findOne({ _id: new ObjectId(req.params.id) });
  if (cartItems.items <= 0) {
    await db
      .getdb()
      .collection("cart")
      .deleteOne({ _id: new ObjectId(req.params.id) });
  }
  res.redirect("/cart");
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
  return res.render("customer/details", {
    productDetails: productDetails,
    input: inputData,
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
      .findOne({ productid: req.params.id, user: user.email });
    if (data) {
      await db
        .getdb()
        .collection("cart")
        .updateOne(
          { productid: req.params.id, user: user.email },
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

router.get("/orders", async function (req, res) {
  if(req.session.isAuth) {
    const user = req.session.user;
  const userData = await db.getdb().collection('users').findOne({email:user.email})
  const data = await db
    .getdb()
    .collection("cart")
    .find({ user: user.email })
    .toArray();
  let products
  let allProducts = []
  await db
    .getdb()
    .collection("cart")
    .updateMany({ user: user.email }, { $set: { isorder: true } });
  
  
  for (const datavalue of data) {
    if (datavalue.user == user.email) {
      products =
        {
          Products: datavalue.productName,
          price: datavalue.price,
          Items: datavalue.items,
        } 
        allProducts.push(products)
    }
  }
  if(res.locals.quantity!=0) {
    await db
        .getdb()
        .collection("order")
        .insertMany([
          {
            productDetails: allProducts,
            date: new Date(),
            user: user.email,
            OrderStatus: "Pending",
            userData:userData
          }])
  }
    
  const orderDetails=await db.getdb().collection('order').find({user:user.email}).toArray()
  await db.getdb().collection("cart").deleteMany({ isorder: true })
  let price = 0
  console.log(orderDetails)
  for(const order of orderDetails) {
    if(!order.humanReadableDate) {
    order.humanReadableDate = order.date.toLocaleDateString("en-us" , {
      weekday: "long",
      year:"numeric",
      month:"long",
      day:"numeric"
    })
    order.normdate = order.date.toISOString()
    await db.getdb().collection('order').updateMany({user:user.email,date:order.date},{$set:{date:order.normdate,humanReadableDate:order.humanReadableDate}})
  }
  }
  return res.render("customer/orders",{orderDetails:orderDetails,isAuth:req.session.isAuth})
  }
  res.render("customer/orders",{isAuth:req.session.isAuth})
});

module.exports = router;
