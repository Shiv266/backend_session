import { ApiError } from "./ApiError.js";

export const generateAccessAndRefreshToken = async (user) => {
  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(error);
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};
