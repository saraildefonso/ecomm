const express = require("express");
const { validationResult } = require("express-validator");

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
  async (req, res) => {
    const errors = validationResult(req);
    //console.log(errors);
    if (!errors.isEmpty()) {
      //const errorMessages = errors.array().map((error) => error.msg);
      return res.send(signupTemplate({ req, errors }));
    }

    const { email, password, passwordConfirmation } = req.body;
    // Create user
    const user = await usersRepo.create({ email, password });
    // Store id in cookie
    req.session.userId = user.id; // Added by cookie session

    res.send("Account created!");
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
  async (req, res) => {
    const errors = validationResult(req);
    //console.log(errors);
    if (!errors.isEmpty()) {
      return res.send(signinTemplate({ errors }));
    }

    const { email } = req.body;

    const user = await usersRepo.getOneBy({ email });

    req.session.userId = user.id;
    res.send("You are signed in!");
  }
);

module.exports = router;
