const { body } = require("express-validator");
const usersRepo = require("../../repositories/users");

module.exports = {
  requireTitle: body("title")
    .trim()
    .isLength({ min: 4, max: 40 })
    .withMessage("Must have 4 to 40 characters"),
  requirePrice: body("price")
    .trim()
    .toFloat()
    .isFloat({ min: 1 })
    .withMessage("Must be a number greater 1"),
  requireEmail: body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must be a valid email")
    .custom(async (email) => {
      const existingUser = await usersRepo.getOneBy({ email });
      if (existingUser) {
        throw new Error("Email already used");
      }
    }),
  requirePassword: body("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must have 4 to 20 characters"),
  requirePasswordConfirmation: body("passwordConfirmation")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must have 4 to 20 characters")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  requireEmailExists: body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("must be a valid email")
    .custom(async (email) => {
      const user = await usersRepo.getOneBy({ email });

      if (!user) {
        throw new Error("invalid email");
      }
    }),
  requireValidPasswordForUser: body("password")
    .trim()
    .custom(async (password, { req }) => {
      const user = await usersRepo.getOneBy({ email: req.body.email });
      if (!user) {
        throw new Error("invalid password or email");
      }

      const validPass = await usersRepo.compPass(user.password, password);
      if (!validPass) {
        throw new Error("Wrong password");
      }
    }),
};
