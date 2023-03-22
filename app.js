const express = require("express");
const path = require("path");

const session = require("express-session");
const MongoSession = require("connect-mongodb-session")(session);

const routes = require("./routes/customer");
const authRoutes = require("./routes/auth");
const admin = require("./routes/admin");

const db = require("./data/database");
const app = express();
app.use(express.urlencoded({ extended: false }));

const MongoStoreSession = new MongoSession({
  uri: "mongodb://127.0.0.1:27017",
  collection: "session",
});

app.use(express.static("public"));

app.use("/images", express.static("images"));

app.use("/admin/images", express.static("images"));

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "superSecret",
    saveUninitialized: false,
    resave: false,
    store: MongoStoreSession,
  })
);

app.use(async function (req, res, next) {
  let quantity = 0;
  if (req.session.isAuth) {
    const user = req.session.user;
    const cartItems = await db
      .getdb()
      .collection("cart")
      .find({ user: user.email })
      .toArray();
    for (const cartItem of cartItems) {
      quantity = quantity + cartItem.items;
    }
    res.locals.quantity = quantity;
    res.locals.isAuth = req.session.isAuth
    return next();
  }
  if (!req.session.isAuth) {
    res.locals.quantity = 0;
    res.locals.isAuth = req.session.isAuth
    return next();
  }
});
app.use(admin);
app.use(authRoutes);
app.use(routes);
db.connectToDatabase().then(function () {
  app.listen(3000);
});
