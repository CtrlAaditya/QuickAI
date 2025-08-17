import express from "express";
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from "../controllers/aiController.js";
import { requireAuth } from '@clerk/express'; // ✅ only this is needed
import { auth } from "../middlewares/auth.js"; // your custom middleware
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

console.log("✅ aiRoutes.js loaded");

aiRouter.get("/test", (req, res) => {
  res.json({ message: "AI Router is working" });
});

// Clerk auth first, then your custom auth
aiRouter.post("/generate-article", requireAuth(), auth, generateArticle);
aiRouter.post("/generate-blog-title", requireAuth(), auth, generateBlogTitle);
aiRouter.post("/generate-image", requireAuth(), auth, generateImage);
aiRouter.post("/remove-image-background", requireAuth(), upload.single('image'), auth, removeImageBackground);
aiRouter.post("/remove-image-object", requireAuth(), upload.single('image'), auth, removeImageObject);
aiRouter.post("/resume-review", requireAuth(), upload.single('file'), auth, resumeReview);

export default aiRouter;
