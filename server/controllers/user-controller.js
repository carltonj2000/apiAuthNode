const Jwt = require("jsonwebtoken");

const User = require("../models/user-model");
const keys = require("../configs/keys");

const signToken = user =>
  Jwt.sign(
    {
      iss: "appsfortracking.com",
      sub: user.id, // id is the same as _id
      iat: new Date().getTime(), // current time
      exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day
    },
    keys.jwt.jwt1.secret
  );

module.exports = {
  signUp: async (req, res, next) => {
    const { email, password } = req.value.body;

    const foundUser = await User.findOne({ "local.email": email });
    if (foundUser) {
      return res.status(403).json({ error: "Email is already used." });
    }

    const newUser = new User({
      method: "local",
      local: { email, password }
    });
    await newUser.save();

    const token = signToken(newUser);
    res.status(200).json({ token });
  },
  signIn: async (req, res, next) => {
    const token = signToken(req.user);
    res.status(200).json({ token });
  },
  secret: async (req, res, next) => {
    res.json({ secret: "resource" });
  },
  googleOauth: async (req, res, next) => {
    console.log(req.user);
    const token = signToken(req.user);
    res.status(200).json({ token });
  },
  facebookOauth: async (req, res, next) => {
    console.log(req.user);
    const token = signToken(req.user);
    res.status(200).json({ token });
  }
};
