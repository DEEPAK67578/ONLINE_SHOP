const express = require("express");
const router = express.Router();
const db = require("../data/database");
const multer = require("multer");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const fs = require("fs-extra");
const { use } = require("./routes");

const storageConfig = multer.diskStorage({
  destination: "images",
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storageConfig });

router.get("/admin/add-product", async function (req, res) {
  const productData = await db
    .getdb()
    .collection("productDetails")
    .find()
    .toArray();
  const userData = req.session.user;
  const userEmail = userData.email;
  const user = await db
    .getdb()
    .collection("users")
    .findOne({ email: userEmail });
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      return res.render("Admin/addnewproducts", { productData: productData });
    }
  }
  res.status(404).render("404");
});

router.get("/admin/products/new", async function (req, res) {
  const userData = req.session.user;
  const userEmail = userData.email;
  const user = await db
    .getdb()
    .collection("users")
    .findOne({ email: userEmail });
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      return res.render("Admin/newproductform");
    }
  }
  res.status(404).render("404");
});

router.post(
  "/admin/products/new",
  upload.single("image"),
  async function (req, res) {
    const uploadedimage = req.file;
    const title = req.body.title;
    const summary = req.body.summary;
    const price = req.body.price;
    const description = req.body.description;
    await db
      .getdb()
      .collection("productDetails")
      .insertMany([
        {
          title: title,
          summary: summary,
          price: price,
          description: description,
          imagePath: uploadedimage.path,
        },
      ]);
    res.redirect("/");
  }
);

router.get("/:id/edit", async function (req, res) {
  const userData = req.session.user;
  const userEmail = userData.email;
  const user = await db
    .getdb()
    .collection("users")
    .findOne({ email: userEmail });
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      const data = await db
        .getdb()
        .collection("productDetails")
        .findOne({ _id: new ObjectId(req.params.id) });
      return res.render("Admin/edit", { data: data });
    }
    res.status(404).render("404");
  }
});

router.post("/:id/edit", upload.single("images"), async function (req, res) {
  const uploadedimage = req.file;
  const title = req.body.title;
  const summary = req.body.summary;
  const price = req.body.price;
  const description = req.body.description;
  const data = await db
    .getdb()
    .collection("productDetails")
    .findOne({ _id: new ObjectId(req.params.id) });
  if (uploadedimage) {
    fs.remove(data.imagePath);
    await db
      .getdb()
      .collection("productDetails")
      .updateMany(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            title: title,
            summary: summary,
            price: price,
            description: description,
            imagePath: uploadedimage.path,
          },
        }
      );
  } else {
    await db
      .getdb()
      .collection("productDetails")
      .updateMany(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            title: title,
            summary: summary,
            price: price,
            description: description,
          },
        }
      );
  }

  res.redirect("/");
});

router.post("/:id/delete", async function (req, res) {
  const userData = req.session.user;
  const userEmail = userData.email;
  const user = await db
    .getdb()
    .collection("users")
    .findOne({ email: userEmail });
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      const data = await db
        .getdb()
        .collection("productDetails")
        .findOne({ _id: new ObjectId(req.params.id) });
      fs.remove(data.imagePath);
      await db
        .getdb()
        .collection("productDetails")
        .deleteOne({ _id: new ObjectId(req.params.id) });
      res.redirect("/");
    }
  }
});

router.get("/admin/manage-orders", async function (req, res) {
  const userData = req.session.user;
  const userEmail = userData.email;
  const user = await db
    .getdb()
    .collection("users")
    .findOne({ email: userEmail });
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      const orders = await db.getdb().collection("order").find().toArray();
      res.render("Admin/manage_orders", { orderDetails: orders });
    }
  }
});

router.post("/admin/manage-orders/:id", async function (req, res) {
  const orderStatus = req.body.orderStatus;
  const id = req.params.id;
  await db
    .getdb()
    .collection("order")
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { OrderStatus: orderStatus } }
    );
  res.redirect("/admin/manage-orders");
});
module.exports = router;
