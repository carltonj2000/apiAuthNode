const Router = require("express-promise-router")();
const passport = require("passport");
const passportConfig = require("../passport");

const UserController = require("../controllers/user-controller");
const { validateBody, schemas } = require("../helpers/route-helpers");

Router.route("/signup").post(
  validateBody(schemas.authSchema),
  UserController.signUp
);
Router.route("/signin").post(
  validateBody(schemas.authSchema),
  passport.authenticate("local", { session: false }),
  UserController.signIn
);
Router.route("/secret").get(
  passport.authenticate("jwt", { session: false }),
  UserController.secret
);

module.exports = Router;
