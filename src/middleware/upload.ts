import multer from "multer";

// --------------------
// Memory storage
// --------------------
const storage = multer.memoryStorage();

// --------------------
// COMMON LIMITS
// --------------------
const limits = {
  fileSize: 100 * 1024 * 1024, // 100 MB
};

// --------------------
// CSV UPLOAD (FOR BULK PRODUCT)
// --------------------
export const uploadCSV = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "text/csv" ||
      file.originalname.toLowerCase().endsWith(".csv")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  },
}).single("file"); // 🔴 MUST match Postman key

// --------------------
// EXCEL + IMAGE UPLOAD
// --------------------
export const uploadExcelOrImage = multer({
  storage,
  limits,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files and images are allowed"));
    }
  },
});

// --------------------
// SINGLE IMAGE (SELFIE)
// --------------------
export const uploadSingle = uploadExcelOrImage.single("selfiePhoto");

// --------------------
// ATTACHMENT UPLOAD (DISK)
// --------------------
export const uploadAttachment = multer({ dest: "uploads/" });
