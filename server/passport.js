const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const GooglePlusTokenStrategy = require("passport-google-plus-token");
const FacebookTokenStrategy = require("passport-facebook-token");

const User = require("./models/user-model");
const keys = require("./configs/keys");

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: keys.jwt.jwt1.secret
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub);
        if (!user) return done(null, false);
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ "local.email": email });
        if (!user) return done(null, false);
        const validPassword = await user.isValidPassword(password);
        if (!validPassword) return done(null, false);
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
passport.use(
  "googleToken",
  new GooglePlusTokenStrategy(
    {
      clientID: keys.google.appsfortracking.oauth.clientID,
      clientSecret: keys.google.appsfortracking.oauth.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("profile", profile);
        const existingUser = await User.findOne({ "google.id": profile.id });
        if (existingUser) return done(null, existingUser);

        const newUser = new User({
          method: "google",
          google: {
            id: profile.id,
            email: profile.emails[0].value
          }
        });
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

passport.use(
  "facebookToken",
  new FacebookTokenStrategy(
    {
      clientID: keys.facebook.carltonjoseph.apps4tracking.appId,
      clientSecret: keys.facebook.carltonjoseph.apps4tracking.appSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("accessToken", profile);
        console.log("profile", profile);

        const existingUser = await User.findOne({ "facebook.id": profile.id });
        if (existingUser) return done(null, existingUser);

        const newUser = new User({
          method: "facebook",
          facebook: {
            id: profile.id,
            email: profile.emails[0].value
          }
        });
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);
