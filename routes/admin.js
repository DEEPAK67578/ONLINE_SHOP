const express = require("express");
const router = express.Router();
const multer = require("multer");
const adminController = require("../controller/admin.controller.js");

const storageConfig = multer.diskStorage({
  destination: "images",
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storageConfig });

router.get("/admin/add-product", adminController.getAddProduct);

router.get("/admin/products/new", adminController.getNewProduct);

router.post(
  "/admin/products/new",
  upload.single("image"),
  adminController.postNewProduct
);

router.get("/:id/edit",adminController.getEdit);

router.post("/:id/edit", upload.single("images"), adminController.postEdit);

router.post("/:id/delete",adminController.postDelete);

router.get("/admin/manage-orders",adminController.getManageOrders);

router.post("/admin/manage-orders/:id",adminController.manageOrderStatus);
module.exports = router;
