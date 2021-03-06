const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
var logger = require("morgan");
const passport = require("passport");
const mysql = require("mysql");
const validateRegisterInput = require("./validation/register");
const validateLoginInput = require("./validation/login"); // Load User model
const connect = require("./config/conn");
const nodeMailer = require("nodemailer");
const validateSendMailInput = require("./validation/sendMail");
const scraper = require("instagram-scraping");
var cors = require("cors");

var app = express();
app.use(express.json());
// Passport middleware
app.use(cors());
app.use(passport.initialize());
app.use(logger("dev"));
// Passport config
require("./config/passport")(passport);

var Instagram = require("instagram-tagscrap-filecache");
var ig = new Instagram({
  cache: {
    prefix: "ig-",
    isIgnore: false,
    ttl: 60 * 30, // 30 min
    tmpDir: null,
  },
});

const axios = require("axios");

const keys = require("./config/keys");

const con = mysql.createPool(connect);

// app.get("/getScholarship", async (req, res) => {
//   const options = {
//     method: "GET",
//     url: "https://twitter135.p.rapidapi.com/Search/",
//     params: { q: "internationalscholarships", count: "20" },
//     headers: {
//       "X-RapidAPI-Key": "6969c4e11emshfc28cc66a2370aep1d08ffjsna9873f04f367",
//       "X-RapidAPI-Host": "twitter135.p.rapidapi.com",
//     },
//   };

//   axios
//     .request(options)
//     .then(function (response) {
//       console.log(response.data);
//       var tweets = response.data.globalObjects.tweets;
//       var length = tweets.length;
//       console.log(tweets.length);
//       var data;
//       for (const tweet in tweets) {
//         data = {
//           caption: tweet.full_text,
//           link: `https://twitter.com/${tweet.id_str}/status/${tweet.id_str}`,
//         };
//       }
//       res.json({
//         success: true,
//         media: {
//           length: length,
//           data: data,
//         },
//       });
//     })
//     .catch(function (error) {
//       console.error(error);
//     });
// });

// app.post("/getByTag", async (req, res) => {
//   var parameter = req.body.parameter;
//   const options = {
//     method: "GET",
//     url: "https://twitter135.p.rapidapi.com/Search/",
//     params: { q: `${parameter}`, count: "20" },
//     headers: {
//       "X-RapidAPI-Key": "6969c4e11emshfc28cc66a2370aep1d08ffjsna9873f04f367",
//       "X-RapidAPI-Host": "twitter135.p.rapidapi.com",
//     },
//   };
//   var tweets, length, data;
//   axios
//     .request(options)
//     .then(function (response) {
//       var data1 = response.data;
//       tweets = data1.globalObjects.tweets;

//       for (const tweet in tweets) {
//         data = {
//           caption: tweet.full_text,
//           link: `https://twitter.com/${tweet.id_str}/status/${tweet.id_str}`,
//         };
//       }
//       res.json({
//         success: true,
//         media: {
//           length: length,
//           data: data,
//         },
//       });
//     })
//     .catch(function (error) {
//       res.json({
//         message:
//           "You have reached the maximum allowed number of requests, Try again next month",
//       });
//       console.error(error);
//     });
// });
app.post("/register", async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body); // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const email = req.body.email;
  const password = await bcrypt.hash(req.body.password, 10);
  con.getConnection(async (err, con) => {
    const sqlSearch = "SELECT * FROM users WHERE email =?;";
    const search_query = mysql.format(sqlSearch, [email]);
    const sqlInsert = "INSERT INTO users VALUES(?, ?, ?, ?);";
    const insert_query = mysql.format(sqlInsert, [
      first_name,
      last_name,
      email,
      password,
    ]);
    con.query(search_query, async (err, result) => {
      // con.release();
      if (err) throw err;
      if (result.length != 0) {
        return res.status(400).json({ email: "User already exists" });
      } else {
        con.query(insert_query, (err, result) => {
          // con.release();
          if (err) throw err;
          console.log("User Created");
          res.json({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
          });
        });
      }
    });
  });
});

app.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body); // Check validation
  var email = req.body.email;
  var password = req.body.password;
  if (!isValid) {
    return res.status(400).json(errors);
  }
  con.getConnection(async (err, con) => {
    if (err) throw err;
    const sqlSearch = "SELECT * FROM users where email = ?";
    const search_query = mysql.format(sqlSearch, [email]);
    await con.query(search_query, async (err, result) => {
      if (err) throw err;
      if (result.length == 0) {
        console.log("-----> User doos not exist");
        return res.status(404).json({ emailnotfound: "Email not found" });
      } else {
        const hashedPassword = result[0].password;

        bcrypt.compare(password, hashedPassword).then((isMatch) => {
          if (isMatch) {
            // User matched
            // Create JWT Payload
            const payload = {
              email: result[0].email,
              first_name: result[0].first_name,
              last_name: result[0].last_name,
            };
            data1 = `Hello, ${payload.first_name}. You have successfully logged in.`;
            email = payload.email;
            sendMail(email, data1);
            // Sign token
            jwt.sign(
              payload,
              keys.secretOrKey,
              {
                expiresIn: 31556926, // 1 year in seconds
              },
              (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token,
                  first_name: result[0].first_name,
                  last_name: result[0].last_name,
                  email: result[0].email,
                });
              }
            );
          } else {
            return res
              .status(400)
              .json({ passwordincorrect: "Password incorrect" });
          }
        });
      }
    });
  });
});

var searchParam =
  "mastersscholarship" ||
  "scholarshipsforinternationalstudents" ||
  "nigerianscholarships" ||
  "internationalscholarships" ||
  "scholarshipfornigerians" ||
  "scholarships" ||
  "studyabroad" ||
  "studyintheus";

var searchParams = [
  "mastersscholarship",
  "scholarshipsforinternationalstudents",
  "nigerianscholarships",
  "internationalscholarships",
  "scholarshipfornigerians",
  "scholarships",
];
let transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.user}`,
    pass: `${process.env.pass}`,
  },
});

async function sendMail(email, data1) {
  let mailOptions = {
    from: "instagramscholarshipfinder@gmail.com",
    to: `${email}`,
    subject: `Scholarship Opportunities found...`,
    text: `${data1}`,
  };
  transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      res.send(400).json(err);
      return console.log(err);
    }
    console.log(info);
    console.log(`message ${info.messageId} sent: ${info.response}`);
    return `message ${info.messageId} sent: ${info.response}`;
  });
  // return data1;
}

app.post("/sendmail", (req, res) => {
  const { errors, isValid } = validateSendMailInput(req.body); // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  for (i = 0; i < searchParams.length; i++) {
    var parameters = searchParams[i];
  }
  const email = req.body.email;
  var tag = parameters;
  scraper.scrapeTag(tag).then((value) => {
    console.log(value.total);
    var media = value.medias;
    const data = media.map(myFunction);
    function myFunction(value, index, array) {
      console.log(`>>>CAPTION: ${value.node.edge_media_to_caption.edges[0].node.text}\n\
      >>>LINK: https://www.instagram.com/p/${value.shortcode}\n\n\n`);
      return `caption: ${value.node.edge_media_to_caption.edges[0].node.text}\n\
        link: https://www.instagram.com/p/${value.shortcode}\n\n\n`;
    }

    sendMail(email, data);
  });

  res.json({
    success: true,
    from: "instagramscholarshipfinder@gmail.com",
    to: email,
  });
});

const fs = require("fs");
const quotes = fs.readFileSync("./resources/quotes.json");
const quote = JSON.parse(quotes);
console.log(typeof quote);
const length = quote.quotes.length;
const generate = function generateRandomQuote() {
  let rand = Math.floor(Math.random() * length);
  newQuote = {
    quote: quote.quotes[rand].quote,
    author: quote.quotes[rand].author,
  };
  return newQuote;
};
// console.log(generate());
app.get("/getQuotes", (req, res) => {
  res.json({
    success: true,
    data: generate(),
  });
});
var port = process.env.PORT || 3200;

app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});
