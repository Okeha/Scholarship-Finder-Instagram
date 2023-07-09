const { check } = require("express-validator");

var validateSignup = [
  check("firstname", "firstname should not be empty and should be a string")
    .isString()
    .notEmpty(),
  check("lastname", "lastname should not be empty and should be a string")
    .isString()
    .notEmpty(),
  check("email", "email should be a valid email address and not empty")
    .isEmail()
    .notEmpty(),
  check("password", "password should be a valid password and not empty")
    .notEmpty()
    .isString(),
  check(
    "confirm_password",
    "confirm_password should be a valid password and not empty"
  )
    .notEmpty()
    .isString(),
];
var validateLogin = [
  check("email", "email should be a valid email address and not empty")
    .isEmail()
    .notEmpty(),
  check("password", "password should be a valid password and not empty")
    .notEmpty()
    .isString(),
];

module.exports = {
  validateLogin,
  validateSignup,
};
