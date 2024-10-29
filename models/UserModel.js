const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const apierror = require("../utils/apierror");
const crypto = require("crypto");

const sch = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is not entered"],
  },
  email: {
    type: String,
    required: [true, "email not given..."],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "validation failed for email",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "password length >=8"],
    select: false,
  },
  checkpassword: {
    type: String,
    required: true,
    validate: {
      //only works for create and save
      validator: function (el) {
        return el === this.password;
      },
      message: "password not matched",
    },
  },
  passChangedAt: Date,
  role: {
    type: String,
    enum: ["customer", "storeOwener", "admin"],
    default: "user",
  },

  passChangeToken: String,
  passChangeTimer: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  contactInfo: {
    phone: String,
    address: String,
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },


    outletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Outlet'},
  purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
});

sch.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.checkpassword = undefined;
  next();
  //only works for save and create
});

sch.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passChangedAt = Date.now() - 1000;
  next();
});

sch.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

sch.methods.passcheck = async function (p_input, p_actual) {
  return await bcrypt.compare(p_input, p_actual);
};

sch.methods.checkPassChanged = function (jwt_date) {
  if (this.passChangedAt) {
    let date = parseInt(this.passChangedAt.getTime() / 1000, 10);

    return jwt_date < date;
  }
  return false;
};

sch.methods.createPassResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passChangeToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passChangeTimer = Date.now() + 10 * 60 * 1000;
  return token;
};



sch.index({ "contactInfo.location": "2dsphere" });

const User = mongoose.model("User", sch);

module.exports = User;
