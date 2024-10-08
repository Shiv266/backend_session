import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res, next) => {
  // Register User Steps:
  // 1. Get register details from frontend
  // 2. Validate register details
  // 3. Check if user already exists : username and email
  // 4. Check for images and upload them to cloudinary
  // 5. Create user in database
  // 6. remove password and refresh token from response
  // 7. send response to frontend

  const { userName, email, fullName, password } = req.body;
  if ([userName, email, fullName, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const isUserExist = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (isUserExist) {
    throw new ApiError(409, "User with email or username already exists");
  }

  let avatarLocalFile;
  if (req.files && Array.isArray(req.files.avatar) && req.files.avatar[0]) {
    avatarLocalFile = req.files.avatar[0].path;
  } else {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalFile); // TODO : Taking too much time, we need to use queue for this

  if (!avatar) {
    throw new ApiError(400, "Avatar image is required");
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar?.url,
  });
  let userObject = user.toObject();
  delete userObject.password;

  if (!user) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, userObject, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  // Login User Steps:
  // 1. Get login details from frontend
  // 2. Validate login details
  // 3. Check if user exists : username and email
  // 4. Check if password is correct
  // 5. Generate access and refresh token
  // 6. Send cookies

  const { userName, email, password } = req.body;
  if (!userName && !email) {
    throw new ApiError(400, "Username or password is required");
  }

  const user = await User.findOne({
    $or: [{ userName: userName?.toLowerCase() }, { email }],
  }).select("+password");

  if (!user) {
    throw new ApiError(
      400,
      "User does not exist. Please register yourself first"
    );
  }

  const isPasswordCorrect = await user.isPasswordMatched(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            userName: user.userName,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
          },
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, //will remove the refreshToken field from the document
      },
    },
    {
      new: true, // to return updated document
    }
  );
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

//TODO : when we give new access and refresh token , we need to blacklist all the old refresh token for that user
const refreshTokenAccess = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }
  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user);
  console.log("accessToken", accessToken);
  console.log("newRefreshToken", newRefreshToken);
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        "Token refreshed successfully"
      )
    );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password is required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordMatched = await user.isPasswordMatched(oldPassword);
  if (!isPasswordMatched) {
    throw new ApiError(400, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenAccess,
  changeCurrentPassword,
};
