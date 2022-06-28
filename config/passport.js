const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
// const User = mongoose.model("users");
const connect = require("./conn");
const mysql = require("mysql");

const keys = require("./keys");
const opts = {};

const con = mysql.createPool(connect);
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      con
        .getConnection(async (err, con) => {
          if (err) throw err;
          const sqlSearch = "SELECT * FROM users where email = ?";
          const search_query = mysql.format(sqlSearch, [jwt_payload.email]);
          con
            .query(search_query, async (err, result) => {
              if (result.length != 0) {
                return done(null, user);
              }
              return done(null, false);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
      // User.findById(jwt_payload.id)
      //   .then((user) => {
      //     if (user) {
      //       return done(null, user);
      //     }
      //     return done(null, false);
      //   })
      //   .catch((err) => console.log(err));
    })
  );
};
