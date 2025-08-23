import express from "express";
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from "../controllers/aiController.js";
import { requireAuth } from '@clerk/express';
import { auth } from "../middleware/auth.js";
import { upload } from "../configs/multer.js"; // Import your multer middleware

const aiRouter = express.Router();

console.log("✅ aiRoutes.js loaded");

aiRouter.get("/test", (req, res) => {
  res.json({ message: "AI Router is working" });
});

aiRouter.post("/generate-article", requireAuth(), auth, generateArticle);
aiRouter.post("/generate-blog-title", requireAuth(), auth, generateBlogTitle);
aiRouter.post("/generate-image", requireAuth(), auth, generateImage);
aiRouter.post("/remove-image-background", requireAuth(), auth, upload.single('image'), removeImageBackground); // <-- Add multer middleware here
aiRouter.post("/remove-image-object", requireAuth(), auth, upload.single('image'), removeImageObject); // <-- Add multer middleware here
aiRouter.post("/resume-review", requireAuth(), auth, upload.single('resume'), resumeReview); // <-- Add multer middleware here

export default aiRouter;