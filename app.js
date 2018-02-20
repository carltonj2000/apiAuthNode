#!/usr/bin/env node

const express = require("express");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(morgan("dev"));
app.use(bodyparser.json({ extended: true }));

app.use("/users", require("./routes/user-routes"));

const port = process.env.PORT || 5000;

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://172.17.0.2/APIAuth");

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
