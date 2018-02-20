#!/usr/bin/env node

const express = require("express");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

if (!process.env.NODE_ENV === "test") app.use(morgan("dev"));
app.use(bodyparser.json({ extended: true }));

app.use("/users", require("./routes/user-routes"));

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://172.17.0.2/APIAuth");

module.exports = app;
