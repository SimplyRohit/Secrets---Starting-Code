require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 3;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { MongoClient } = require("mongodb");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
const url = process.env.DATABASE_URL;
const client = new MongoClient(url);
const db = client.db("Login-Register");
const collection = db.collection("users");
const collectionSec = db.collection("secret");
client.connect();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/secrets", async function (req, res) {
  res.render("secrets");
});
app.get("/submit", function (req, res) {
  res.render("submit");
});
app.get("/logout", function (req, res) {
  res.render("home");
});

app.post("/register", async function (req, res) {
  const usernameNew = req.body.username;
  const hash = await bcrypt.hash(req.body.password, saltRounds);
  const password = hash;
  const check = await collection.findOne({ username: usernameNew });
  if (check === null) {
    collection.insertOne({ username: usernameNew, password: password });
    console.log("Registered successfully");
    res.redirect("/login");
  } else {
    console.log("Username already exists");
    res.redirect("/register");
  }
});

app.post("/login", async function (req, res) {
  const usernameMain = req.body.username;
  const passwordMain = req.body.password;
  const result = await collection.findOne({
    username: usernameMain,
  });
  if (result === null) {
    res.redirect("/register");
  } else {
    bcrypt.compare(passwordMain, result.password, function (err, result) {
      if (result === true) {
        res.redirect("/secrets");
      } else {
        res.redirect("/login");
      }
    });
  }
});
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
