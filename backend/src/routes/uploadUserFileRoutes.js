"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/uploadUserFileRoutes.ts
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var express_1 = require("express");
var uuid_1 = require("uuid");
var router = (0, express_1.Router)();
var fileRecords = [];
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = path_1.default.join(__dirname, "../tax");
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        var userIdPrefix = req.body.userId ? req.body.userId + "_" : "";
        var originalName = file.originalname;
        var ext = path_1.default.extname(originalName);
        var baseName = path_1.default.basename(originalName, ext);
        var uploadDir = path_1.default.join(__dirname, "../tax");
        var finalFileName = userIdPrefix + originalName; // 
        var filePath = path_1.default.join(uploadDir, finalFileName);
        var counter = 1;
        // If file exists, append a counter before the extension (starting with (2))
        while (fs_1.default.existsSync(filePath)) {
            counter++;
            finalFileName = userIdPrefix + baseName + " (" + counter + ")" + ext;
            filePath = path_1.default.join(uploadDir, finalFileName);
        }
        cb(null, finalFileName);
    },
});
var upload = (0, multer_1.default)({ storage: storage });
router.post("/upload-user-file", upload.single("userFile"), function (req, res) {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    var userId = req.body.userId;
    console.log("File uploaded for user:", userId, "at:", req.file.path);
    var id = (0, uuid_1.v4)();
    var fileRecord = {
        id: id,
        userId: userId,
        name: req.file.filename,
        url: "/tax/".concat(req.file.filename),
    };
    fileRecords.push(fileRecord);
    res.status(200).json({
        status: "SUCCESS",
        filePath: req.file.path,
        fileName: req.file.filename,
        id: id,
    });
});
router.get("/user-files", function (req, res) {
    var userId = req.query.userId;
    if (!userId) {
        res.status(400).json({ error: "Missing userId parameter" });
        return;
    }
    var userFiles = fileRecords.filter(function (file) { return file.userId === userId; });
    res.status(200).json({ data: userFiles });
});
router.delete("/delete-user-file/:id", function (req, res) {
    var fileId = req.params.id;
    var index = fileRecords.findIndex(function (file) { return file.id === fileId; });
    if (index === -1) {
        res.status(404).json({ error: "File not found" });
        return;
    }
    var fileRecord = fileRecords[index];
    var filePath = path_1.default.join(__dirname, "../tax", fileRecord.name);
    fs_1.default.unlink(filePath, function (err) {
        if (err) {
            console.error("Error deleting file from disk:", err);
            res.status(500).json({ error: "Error deleting file" });
            return;
        }
        fileRecords.splice(index, 1);
        res.status(200).json({ status: "SUCCESS", message: "File deleted" });
    });
});
exports.default = router;
