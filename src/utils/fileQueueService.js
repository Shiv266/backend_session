import Queue from "bull";
import { uploadOnCloudinary } from "./cloudinaryService.js";
import { User } from "../models/user.model.js";

const imageUploadQueue = new Queue("imageUpload");

imageUploadQueue.process(async (job, done) => {
  const { localFilePath, userId } = job.data;
  try {
    console.log("Uploading image to Cloudinary...");
    const avatar = await uploadOnCloudinary(localFilePath);
    await User.updateOne({ _id: userId }, { avatar: avatar.url });
    done(); // Task completed successfully
    console.log("Image upload completed successfully");
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    done(error); // Pass error to Bull for handling
  }
});

imageUploadQueue.on("failed", (job, err) => {
  console.error(`Image upload task failed for job ${job.id}: ${err.message}`);
  // Implement retry logic here, if desired
});

const enqueueImageUpload = async (data) => {
  await imageUploadQueue.add(data);
};

export { enqueueImageUpload };
