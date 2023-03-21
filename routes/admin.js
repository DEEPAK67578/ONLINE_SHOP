const express = require("express");
const router = express.Router();
const db = require("../data/database");
const multer = require("multer");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const fs = require("fs-extra");
const AdminModal = require('../modals/admin.modal')

const storageConfig = multer.diskStorage({
  destination: "images",
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storageConfig });

router.get("/admin/add-product", async function (req, res) {
  const productData =await new AdminModal.ProductData(null,null).ProductDetails()
  const userData = req.session.user;
  const userEmail = userData.email;
  const user = await new AdminModal.ProductData(null,userEmail).user()
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
  const user = await new AdminModal.ProductData(null,userEmail).user();
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
    await new AdminModal.insertMany(title,summary,price,description,uploadedimage.path,null).insertMany()
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
      const data = await new AdminModal.ProductData(req.params.id,null).productOne()
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
  const data = await new AdminModal.ProductData(req.params.id,null).productOne();
  if (uploadedimage) {
    fs.remove(data.imagePath);
    await new AdminModal.insertMany(title,summary,price,description,uploadedimage.path,req.params.id).updateMany()
  } else {
    await new AdminModal.insertMany(title,summary,price,description,null,req.params.id).updateExeptImage()
  }

  res.redirect("/");
});

router.post("/:id/delete", async function (req, res) {
  const userData = req.session.user;
  const userEmail = userData.email;
  const user = await new AdminModal.ProductData(null,userEmail).user();
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      const data = await new AdminModal.ProductData(req.params.id,null).productOne();
      fs.remove(data.imagePath);
      await new AdminModal.ProductData(req.params.id,null).deleteProduct();
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
      const orders = await new AdminModal.order(null,null).AllOrders();
      res.render("Admin/manage_orders", { orderDetails: orders });
    }
  }
});

router.post("/admin/manage-orders/:id", async function (req, res) {
  const orderStatus = req.body.orderStatus;
  const id = req.params.id;
  await new AdminModal.order(id,orderStatus).updateOrder();
  res.redirect("/admin/manage-orders");
});
module.exports = router;
