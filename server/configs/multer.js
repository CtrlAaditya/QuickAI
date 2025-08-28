import multer from "multer";
import path from "path";
// No need to import fs or create 'uploads/' directory manually for Vercel /tmp storage

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ FIX: Use the /tmp directory for temporary file storage on Vercel
    cb(null, '/tmp'); 
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to avoid collisions in /tmp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Keep file extension
  },
});

export const upload = multer({ storage });
