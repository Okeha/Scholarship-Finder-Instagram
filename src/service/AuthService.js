const { validationResult } = require("express-validator");
const { User } = require("../repository/models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ResultWithContext } = require("express-validator/src/chain");
const { promisify } = require("util");

////
var signup = async (req, res) => {
  try {
    // validate json body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    var { firstname, lastname, email, password, confirm_password } = req.body;

    // check if confirm password matches current password
    if (password !== confirm_password) {
      return res.status(400).json({
        successful: false,
        body: {
          message: "Passwords do not match!",
        },
      });
    }
    // if it does then encrypt password
    password = await bcrypt.hash(password, 10);
    //check if user exists using email.

    // create user if user does not exist.
    var [user, created] = await User.findOrCreate({
      where: {
        email,
      },
      defaults: {
        firstname,
        lastname,
        email,
        password,
      },
    });

    if (!created) {
      return res.status(409).json({
        successful: false,
        body: {
          message: "User already exists!",
        },
      });
    }

    // create jwt

    var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(201).json({
      successful: true,
      body: {
        user,
        token,
      },
    });
  } catch (err) {
    return res.status(401).json({
      successful: false,
      body: {
        message: `${err}`,
      },
    });
  }
};

////
var login = async (req, res) => {
  try {
    // validate json body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    var { firstname, lastname, email, password, confirm_password } = req.body;

    //check if user with email exist,
    var user = await User.findAll({
      where: {
        email,
      },
    });

    if (user.length === 0) {
      return res.status(404).json({
        successful: false,
        body: {
          message: `User not found!`,
        },
      });
    }
    //check if passwords match,
    var storedPassword = user[0].dataValues.password;
    var passwordMatch = await bcrypt.compare(password, storedPassword);

    if (!passwordMatch) {
      return res.status(404).json({
        successful: false,
        body: {
          message: `Invalid password!`,
        },
      });
    }

    //create jwt
    var token = await jwt.sign(
      { id: user[0].dataValues.id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );
    console.log({ expiresIn: process.env.JWT_EXPIRES_IN });

    return res.status(201).json({
      successful: true,
      body: {
        user,
        token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      body: {
        message: `${err}`,
      },
    });
  }
};

////
var protected = async (req, res, next) => {
  try {
    var token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        successful: false,
        body: {
          message: "You are not logged in!",
        },
      });
    }

    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );

    var id = decoded.id;

    var user = await User.findAll({
      where: {
        id,
      },
    });

    if (user.length === 0) {
      return res.status(401).json({
        successful: false,
        body: {
          message: `You are not authorized to consume this endpoint!`,
        },
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      successful: false,
      body: {
        message: `${err}`,
      },
    });
  }
};

module.exports = {
  signup,
  login,
  protected,
};
