import express from "express";
import { generateArticle } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post('/generate-article', generateArticle); // no auth here

export default aiRouter;
