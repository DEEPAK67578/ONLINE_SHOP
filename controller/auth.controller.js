const bcrypt = require("bcrypt");
const authModals = require("../modals/auth.modal");
function getSignUp(req, res) {
  let input = req.session.input;
  if (!input) {
    input = {
      iserror: "",
      message: "",
      password: "",
      email: "",
      confirmEmail: "",
      name: "",
      street: "",
      postal: "",
      city: "",
    };
  }
  req.session.input = null;
  res.render("customer/signup", { input: input });
}

async function postSignup(req, res) {
  const email = req.body.email;
  const confirmEmail = req.body.confirmemail;
  const password = req.body.password;
  const name = req.body.name;
  const street = req.body.street;
  const postal = req.body.postalcode;
  const city = req.body.city;

  if (
    !email ||
    !confirmEmail ||
    !password ||
    !name ||
    !street ||
    !postal ||
    !city
  ) {
    req.session.input = {
      iserror: true,
      message: "Please Enter your credentials",
      password: password,
      email: email,
      confirmEmail: confirmEmail,
      name: name,
      street: street,
      postal: postal,
      city: city,
    };
    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  if (!email.includes("@")) {
    req.session.input = {
      iserror: true,
      message: "Please Enter the valid Email address",
      password: password,
      email: email,
      confirmEmail: confirmEmail,
      name: name,
      street: street,
      postal: postal,
      city: city,
    };
    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  if (password.length < 7) {
    req.session.input = {
      iserror: true,
      message:
        "Please Enter the password with a minimum length of 6 characters",
      password: password,
      email: email,
      confirmEmail: confirmEmail,
      name: name,
      street: street,
      postal: postal,
      city: city,
    };
    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  if (postal.length != 6) {
    req.session.input = {
      iserror: true,
      message: "Please Enter a valid postal code",
      email: email,
      confirmEmail: confirmEmail,
      password: password,
      name: name,
      street: street,
      postal: postal,
      city: city,
    };
    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  if (email != confirmEmail) {
    req.session.input = {
      iserror: true,
      message: "Please Check your credentials",
      email: email,
      confirmEmail: confirmEmail,
      password: password,
      name: name,
      street: street,
      postal: postal,
      city: city,
    };
    req.session.save(function () {
      res.redirect("/signup");
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await new authModals.auth(
    email,
    name,
    hashedPassword,
    street,
    postal,
    city
  ).insertUserData();
  res.redirect("/login");
}

function getLogin(req, res) {
  let input = req.session.input;
  if (!input) {
    input = {
      iserror: "",
      message: "",
      email: "",
      password: "",
    };
  }
  req.session.input = null;
  res.render("customer/login", { input: input });
}

async function postLogin(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const data = await new authModals.auth(
    email,
    null,
    null,
    null,
    null,
    null
  ).user();
  if (!email || !password) {
    req.session.input = {
      iserror: true,
      message: "Please Enter your Credentials",
      email: email,
      password: password,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }
  if (!data) {
    req.session.input = {
      iserror: true,
      message: "Account could not be found.Create an account",
      email: email,
      password: password,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }
  const passwordsAreEqual = await bcrypt.compare(password, data.password);
  if (!passwordsAreEqual) {
    req.session.input = {
      iserror: true,
      message: "Please Check Your Credentials",
      email: email,
      password: password,
    };
    req.session.save(function () {
      res.redirect("/login");
    });
    return;
  }

  req.session.isAuth = true;
  req.session.user = { email: email, password: password };
  res.redirect("/shop");
}

function postLogout(req, res) {
  req.session.isAuth = false;
  req.session.user = null;
  req.session.cartQuantity = 0;
  res.redirect("/login");
}

module.exports = {
  getSignUp: getSignUp,
  postSignup: postSignup,
  getLogin: getLogin,
  postLogin: postLogin,
  postLogout: postLogout,
};
