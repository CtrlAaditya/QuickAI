import express from "express";
import { generateArticle, generateBlogTitle, generateImage } from "../controllers/aiController.js";

const aiRouter = express.Router();

// Debug log
console.log("✅ aiRoutes.js loaded");

// Test route
aiRouter.get("/test", (req, res) => {
  res.json({ message: "AI Router is working" });
});

aiRouter.post("/generate-article",  generateArticle);
aiRouter.post("/generate-blog-title",  generateBlogTitle);
aiRouter.post("/generate-image", generateImage);

export default aiRouter;
