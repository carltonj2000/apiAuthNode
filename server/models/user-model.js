const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  method: {
    type: String,
    enum: ["local", "google", "facebook"],
    require: true
  },
  local: {
    email: {
      type: String,
      lowercase: true
    },
    password: {
      type: String
    }
  },
  google: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  },
  facebook: {
    id: {
      type: String
    },
    email: {
      type: String,
      lowercase: true
    }
  }
});

userSchema.pre("save", async function(next) {
  try {
    if (this.method !== "local") next();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.local.password, salt); // actually salt + hash
    this.local.password = hash;
    next();
  } catch (e) {
    next(e);
  }
});

userSchema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.local.password);
  } catch (e) {
    throw new Error(e);
  }
};
const User = mongoose.model("user", userSchema);

module.exports = User;
