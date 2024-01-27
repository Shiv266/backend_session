import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      trim: true, //Mongoose should automatically remove leading and trailing whitespace from the field's value before saving it to the database.
      index: true, //Mongoose should create an index on the field in the MongoDB collection to make query execution faster.
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // will use cloudinary image url
      required: [true, "Avatar is required"],
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video", // reference to Video model
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true } // will give createdAt and updatedAt fields
);

// we have not used arrow function here because we want to use this keyword and arrow function does not have this keyword
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // if password is not modified, then do nothing
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordMatched = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// in database, collection name will be "users" (plural of User)
export const User = mongoose.model("User", userSchema);
