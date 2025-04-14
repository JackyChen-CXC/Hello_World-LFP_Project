// routes/uploadUserFileRoutes.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

const router = Router();


const fileRecords: {
  id: string;
  userId: string;
  name: string;
  url: string;
}[] = [];


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    const uploadDir = path.join(__dirname, "../tax");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    
    const userIdPrefix = req.body.userId ? req.body.userId + "_" : "";
    const originalName = file.originalname; 
    const ext = path.extname(originalName); 
    const baseName = path.basename(originalName, ext); 
    
    const uploadDir = path.join(__dirname, "../tax");
    let finalFileName = userIdPrefix + originalName; // 
    let filePath = path.join(uploadDir, finalFileName);
    let counter = 1;

    // If file exists, append a counter before the extension (starting with (2))
    while(fs.existsSync(filePath)) {
      counter++;
      finalFileName = userIdPrefix + baseName + " (" + counter + ")" + ext;
      filePath = path.join(uploadDir, finalFileName);
    }
    cb(null, finalFileName);
  },
});

const upload = multer({ storage });


router.post("/upload-user-file", upload.single("userFile"), (req, res): void => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const userId = req.body.userId;
  console.log("File uploaded for user:", userId, "at:", req.file.path);

  
  const id = uuidv4();
  const fileRecord = {
    id,
    userId,
    name: req.file.filename,
    
    url: `/tax/${req.file.filename}`,
  };

  fileRecords.push(fileRecord);

  res.status(200).json({
    status: "SUCCESS",
    filePath: req.file.path,
    fileName: req.file.filename,
    id,
  });
});


router.get("/user-files", (req, res): void => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: "Missing userId parameter" });
    return;
  }
  const userFiles = fileRecords.filter((file) => file.userId === userId);
  res.status(200).json({ data: userFiles });
});


router.delete("/delete-user-file/:id", (req, res): void => {
  const fileId = req.params.id;
  const index = fileRecords.findIndex((file) => file.id === fileId);
  if (index === -1) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  const fileRecord = fileRecords[index];
  const filePath = path.join(__dirname, "../tax", fileRecord.name);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file from disk:", err);
      res.status(500).json({ error: "Error deleting file" });
      return;
    }
    fileRecords.splice(index, 1);
    res.status(200).json({ status: "SUCCESS", message: "File deleted" });
  });
});

export default router;
