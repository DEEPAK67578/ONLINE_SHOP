const express = require("express");
const router = express.Router();
const db = require("../data/database");
const multer = require('multer')

const storageConfig = multer.diskStorage({
    destination:function(req,file,cb) {
        cb(null,'images')
    },
    filename:function(req,file,cb) {
        cb(null,file.originalname)
    }
})

const upload = multer({storage:storageConfig})

router.get("/admin/add-product", async function (req, res) {
  const userData = req.session.user;
  const { userEmail } = userData.email;
  const user = await db.getdb().collection("users").findOne(userEmail);
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      return res.render("Admin/addnewproducts");
    } else {
        res.status(404).render('404')
    }
  }
});

router.get("/admin/products/new",async function(req,res) {
  const userData = req.session.user;
  const { userEmail } = userData.email;
  const user = await db.getdb().collection("users").findOne(userEmail);
  if (req.session.isAuth) {
    if (user.isAuthenticated) {
      return res.render("Admin/newproductform");
    } else {
        res.status(404).render('404')
    }
  }
})

router.post("/admin/products/new",upload.single('image'),async function(req,res) {
    const title = req.body.title
    const summary = req.body.summary
    const price = req.body.price
    const description = req.body.description
    const image = req.file
})

module.exports = router;
