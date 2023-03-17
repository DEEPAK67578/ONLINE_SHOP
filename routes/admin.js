const express = require("express");
const router = express.Router();
const db = require("../data/database");
const multer = require("multer");

const storageConfig = multer.diskStorage({
  destination: "images",
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storageConfig });

router.get("/admin/add-product", async function (req, res) {
  const productData =await db.getdb().collection('productDetails').find().toArray()
  const userData = req.session.user;
  const userEmail = userData.email;
  const user = await db
    .getdb()
    .collection("users")
    .findOne({ email: userEmail });
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      return res.render("Admin/addnewproducts",{productData:productData});
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
          imagePath: uploadedimage.path
        },
      ]);
    res.redirect("/");
  }
);

module.exports = router;
