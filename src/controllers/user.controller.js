import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
