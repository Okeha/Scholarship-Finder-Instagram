const express = require("express");
const { signup, login } = require("../service/AuthService");
const { validateSignup, validateLogin } = require("../validator/AuthValidator");

const authRouter = express.Router();

authRouter.post("/signup", validateSignup, signup);

authRouter.post("/login", validateLogin, login);

module.exports = {
  authRouter,
};
