const express = require("express");
const { handleErrors } = require("./middlewares");

const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser,
} = require("./validators");

const router = express.Router();

// SIGNUP
router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [requireEmail, requirePassword, requirePasswordConfirmation],
  handleErrors(signupTemplate),
  async (req, res) => {
    const { email, password } = req.body;
    // Create user
    const user = await usersRepo.create({ email, password });
    // Store id in cookie
    req.session.userId = user.id; // Added by cookie session

    res.redirect("/admin/products");
  }
);

// SIGNOUT
router.get("/signout", (req, res) => {
  req.session = null;
  res.send("Logged out");
});

// SIGNIN
router.get("/signin", (req, res) => {
  res.send(signinTemplate({}));
});

router.post(
  "/signin",
  [requireEmailExists, requireValidPasswordForUser],
  handleErrors(signinTemplate),
  async (req, res) => {
    const { email } = req.body;

    const user = await usersRepo.getOneBy({ email });

    req.session.userId = user.id;
    res.redirect("/admin/products");
  }
);

module.exports = router;
