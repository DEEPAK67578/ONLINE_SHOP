
const fs = require("fs-extra");
const adminModal = require("../modals/admin.modal");
const AdminModal = require('../modals/admin.modal')



async function getAddProduct (req, res) {
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
  }

async function getNewProduct(req, res) {
    const userData = req.session.user;
    const userEmail = userData.email;
    const user = await new AdminModal.ProductData(null,userEmail).user();
    if (req.session.isAuth) {
      if (user.isAuthenticated) {
        return res.render("Admin/newproductform");
      }
    }
    res.status(404).render("404");
  }

  async function postNewProduct(req, res) {
    const uploadedimage = req.file;
    const title = req.body.title;
    const summary = req.body.summary;
    const price = req.body.price;
    const description = req.body.description;
    await new AdminModal.insertMany(title,summary,price,description,uploadedimage.path,null).insertMany()
    res.redirect("/");
  }

  async function getEdit(req, res) {
    const userData = req.session.user;
    const userEmail = userData.email;
    const user =await new adminModal.ProductData(null,userEmail).user();
    if (req.session.isAuth) {
      if (user.isAuthenticated) {
        const data = await new AdminModal.ProductData(req.params.id,null).productOne()
        return res.render("Admin/edit", { data: data });
      }
      res.status(404).render("404");
    }
  }

    async function postEdit(req, res) {
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
  }

  async function postDelete(req, res) {
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
  }

  async function getManageOrders(req, res) {
    const userData = req.session.user;
    const userEmail = userData.email;
    const user = await new AdminModal.ProductData(null,userEmail).user();
    if (req.session.isAuth) {
      if (user.isAuthenticated) {
        const orders = await new AdminModal.order(null,null).AllOrders();
        res.render("Admin/manage_orders", { orderDetails: orders });
      }
    }
  }

  async function manageOrderStatus(req, res) {
    const orderStatus = req.body.orderStatus;
    const id = req.params.id;
    await new AdminModal.order(id,orderStatus).updateOrder();
    res.redirect("/admin/manage-orders");
  }
module.exports = {
    getAddProduct:getAddProduct,
    getNewProduct:getNewProduct,
    postNewProduct:postNewProduct,
    getEdit:getEdit,
    postEdit:postEdit,
    postDelete:postDelete,
    getManageOrders:getManageOrders,
    manageOrderStatus:manageOrderStatus


}