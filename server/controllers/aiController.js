import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from '@clerk/clerk-sdk-node';
import axios from "axios";
import { getAuth } from "@clerk/express";
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import { Buffer } from 'buffer'; // Needed for Node.js ES Modules to handle binary data
import pdf from 'pdf-parse/lib/pdf-parse.js'

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUser(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error("Error in generateArticle:", error);
        res.status(500).json({ success: false, message: "Something went wrong." });
    }
};

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content;

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUser(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            });
        }

        res.json({ success: true, content });

    } catch (error) {
        console.error("Error in generateBlogTitle:", error);
        res.status(500).json({ success: false, message: "Something went wrong." });
    }
};

export const generateImage = async (req, res) => {
    try {
        // Match the same usage as generateArticle
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;

        console.log("🟢 generateImage -> userId:", userId, "plan:", plan);

        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: "Image generation is a premium feature. Please upgrade your plan."
            });
        }

        const FormData = new (await import("form-data")).default();
        FormData.append("prompt", prompt);

        const { data } = await axios.post(
            "https://clipdrop-api.co/text-to-image/v1",
            FormData,
            {
                headers: {
                    "x-api-key": process.env.CLIPDROP_API_KEY,
                    ...FormData.getHeaders()
                },
                responseType: "arraybuffer",
            }
        );

        const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await sql`
          INSERT INTO creations (user_id, prompt, content, type)
          VALUES (${userId}, ${prompt}, ${secure_url}, 'image')
        `;

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.error("Error in generateImage:", error);

        if (axios.isAxiosError(error) && error.response) {
            const clipDropErrorData = error.response.data
                ? Buffer.from(error.response.data).toString('utf8')
                : 'Unknown error from external API';

            console.error("ClipDrop API Error Response:", clipDropErrorData);

            let message = `Image generation failed: ${error.response.statusText || 'External API Error'}.`;

            try {
                const parsedClipDropError = JSON.parse(clipDropErrorData);
                if (parsedClipDropError.error) {
                    message += ` Details: ${parsedClipDropError.error}`;
                }
            } catch (parseError) {
                message += ` Raw details: ${clipDropErrorData}`;
            }

            res.status(error.response.status).json({
                success: false,
                message: message
            });
        } else {
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    }
};






export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const plan = req.plan; 

        if (plan !== 'premium') {
            return res.status(403).json({ success: false, message: "Image background removal is a premium feature. Please upgrade your plan." });
        }
        
        if (!image) {
            return res.status(400).json({ success: false, message: "No image file uploaded." });
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                }
            ]
        });
        
        fs.unlinkSync(image.path);
        
        const promptString = 'remove background from the image';

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, ${promptString}, ${secure_url}, 'image')`;

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.error("Error in removeImageBackground:", error);
        res.status(500).json({ success: false, message: "Something went wrong removing the background." });
    }
};




export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object } = req.body;
        const image = req.file; // Corrected: directly access req.file
        const plan = req.plan; 

        if (plan !== 'premium') {
            return res.status(403).json({ success: false, message: "Image generation is a premium feature. Please upgrade your plan." });
        }

        if (!image) {
          return res.status(400).json({ success: false, message: "No image file uploaded." });
        }
        
        const { public_id } = await cloudinary.uploader.upload(image.path);
        
        fs.unlinkSync(image.path); // Clean up the temporary file

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{effect: `gen_remove:${object}`}],
            resource_type: 'image'
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, ${`Removed: ${object} from image`}, ${imageUrl}, 'image')`;

        res.json({ success: true, content: imageUrl });

    } catch (error) {
        console.error("Error in removeImageObject:", error);
        res.status(500).json({ success: false, message: "Something went wrong removing the object." });
    }
};



export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file; // Corrected: directly access req.file
        const plan = req.plan; 

        if (plan !== 'premium') {
            return res.status(403).json({ success: false, message: "Image generation is a premium feature. Please upgrade your plan." });
        }

        
        if(!resume || resume.size > 5* 1024 * 1024){
            return res.json({success: false, message: "Resume file size exceeds the limit is 5mb"})
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)

        const prompt = `Review the following resume and provide constructive feedback on it's strengths, weaknesses,
        and ares of improvement. Resume Content:\n\n${pdfData.text}`


        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const content = response.choices[0].message.content;


        await sql`INSERT INTO creations (user_id, prompt, content, type)
                  VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review')`;

        res.json({ success: true, content: content });

    } catch (error) {
        console.error("Error in resumeReview:", error);
        if (axios.isAxiosError(error) && error.response) {
            const clipDropErrorData = error.response.data ? Buffer.from(error.response.data).toString('utf8') : 'Unknown error from external API';
            console.error("ClipDrop API Error Response:", clipDropErrorData);

            let message = `Image generation failed: ${error.response.statusText || 'External API Error'}.`;
            try {
                const parsedClipDropError = JSON.parse(clipDropErrorData);
                if (parsedClipDropError.error) {
                    message += ` Details: ${parsedClipDropError.error}`;
                }
            } catch (parseError) {
                message += ` Raw details: ${clipDropErrorData}`;
            }

            res.status(error.response.status).json({
                success: false,
                message: message
            });
        } else {
            res.status(500).json({ success: false, message: "Something went wrong." });
        }
    }
};