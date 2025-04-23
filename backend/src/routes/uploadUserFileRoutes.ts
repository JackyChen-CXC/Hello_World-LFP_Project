// routes/uploadUserFileRoutes.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Create base tax directory if it doesn't exist
const BASE_TAX_DIR = path.join(__dirname, "../tax");
console.log("Tax directory path:", BASE_TAX_DIR);

try {
  if (!fs.existsSync(BASE_TAX_DIR)) {
    fs.mkdirSync(BASE_TAX_DIR, { recursive: true });
    console.log("Created tax directory at:", BASE_TAX_DIR);
  }
} catch (err) {
  const error = err instanceof Error ? err : new Error('Failed to create tax directory');
  console.error("Error creating tax directory:", error);
}

// Helper function to ensure user directory exists
const ensureUserDir = (userId: string): string => {
  try {
    const userDir = path.join(BASE_TAX_DIR, `user${userId}`);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
      console.log("Created user directory at:", userDir);
    }
    return userDir;
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to create user directory');
    console.error("Error creating user directory:", error);
    throw error;
  }
};

// Helper function to get all files for a user
const getUserFiles = (userId: string) => {
  try {
    const userDir = path.join(BASE_TAX_DIR, `user${userId}`);
    if (!fs.existsSync(userDir)) {
      return [];
    }

    return fs.readdirSync(userDir)
      .map(filename => {
        try {
          const stats = fs.statSync(path.join(userDir, filename));
          if (!stats.isFile()) return null;
          
          return {
            id: filename,
            userId,
            name: filename,
            url: `/tax/user${userId}/${filename}`
          };
        } catch (err) {
          console.error("Error processing file:", filename, err);
          return null;
        }
      })
      .filter(file => file !== null);
  } catch (err) {
    console.error("Error reading user directory:", err);
    return [];
  }
};

// Configure multer
const storage = multer.diskStorage({
  destination: function(req: any, file: any, cb: any) {
    try {
      const userId = req.body.userId;
      console.log("Processing upload for userId:", userId);
      
      if (!userId) {
        cb(new Error("userId is required"), "");
        return;
      }
      
      const userDir = ensureUserDir(userId);
      cb(null, userDir);
    } catch (err) {
      console.error("Error in destination handler:", err);
      cb(new Error('Failed to process upload destination'), "");
    }
  },
  filename: function(req: any, file: any, cb: any) {
    try {
      // Just use the original filename
      cb(null, file.originalname);
    } catch (err) {
      console.error("Error in filename handler:", err);
      cb(new Error('Failed to process filename'), "");
    }
  }
});

const uploadMiddleware = multer({ storage }).single("userFile");

// Handle file upload
router.post("/upload-user-file", (req: Request, res: Response) => {
  // Use the middleware
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error("Error in file upload:", err);
      return res.status(400).json({ error: err.message || "Error uploading file" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    res.status(200).json({
      status: "SUCCESS",
      filePath: req.file.path,
      fileName: req.file.filename,
      id: req.file.filename
    });
  });
});

router.get("/user-files", (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: "Missing userId parameter" });
    return;
  }

  const userFiles = getUserFiles(userId);
  res.status(200).json({ data: userFiles });
});

router.delete("/delete-user-file/:id", (req: Request, res: Response) => {
  const fileId = req.params.id;
  const userId = req.body.userId;

  if (!userId) {
    res.status(400).json({ error: "Missing userId parameter" });
    return;
  }

  const userDir = path.join(BASE_TAX_DIR, `user${userId}`);
  if (!fs.existsSync(userDir)) {
    res.status(404).json({ error: "User directory not found" });
    return;
  }

  const filePath = path.join(userDir, fileId);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file from disk:", err);
      res.status(500).json({ error: "Error deleting file" });
      return;
    }
    res.status(200).json({ status: "SUCCESS", message: "File deleted" });
  });
});

export default router;
