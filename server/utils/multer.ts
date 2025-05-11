import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// Define the params object with proper typing
const storageParams = {
  folder: "bicycles",
  allowed_formats: ["jpg", "jpeg", "png"],
  transformation: [{ width: 800, crop: "limit" }],
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: storageParams,
});

export const upload = multer({ storage });