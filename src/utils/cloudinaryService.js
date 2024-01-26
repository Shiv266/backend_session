import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) throw new Error("File path not found");
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File is uploaded to cloudinary", result.url);
    return result;
  } catch (error) {
    console.error(error);
    fs.unlinkSync(filePath); // remove the locally saved temporary file as operation failed
  }
};

export { uploadOnCloudinary };
