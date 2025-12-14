
import { Request, Response } from "express";
import prisma from "../utils/dbConnection";
import fs from "fs";
import { parse } from "fast-csv";
import path from "path";

/**
 * DOWNLOAD CSV TEMPLATE
 */
console.log("Product Bulk Download Template Controller Loaded");
export const downloadTemplate = (req: Request, res: Response) => {
  const templatePath = path.join(__dirname, "../templates/product_template.csv");

  if (!fs.existsSync(templatePath)) {
    const header =
      "name,min_stock_limit,description,specifications,image_url,price\n";
    fs.mkdirSync(path.dirname(templatePath), { recursive: true });
    fs.writeFileSync(templatePath, header);
  }

  res.download(templatePath, "product_template.csv");
};

/**
 * BULK UPLOAD PRODUCTS
 */
console.log("Product Bulk Upload Controller Loaded");


// If you want strong typing (optional but recommended)
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const uploadProducts = async (
  req: MulterRequest,
  res: Response
) => {
  try {
    // ✅ form-data file comes from req.file
    console.log("Uploaded file:", req.file?.originalname, req.file?.mimetype, req.file?.size);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file required",
      });
    }

    const products: any[] = [];

    // ✅ Create CSV parser
    const csvParser = parse({
      headers: true,
      trim: true,
    });

    csvParser
      .on("error", (error) => {
        console.error("CSV parse error:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid CSV format",
        });
      })
      .on("data", (row) => {
        // 🔐 Basic validation
        if (!row.name || !row.price) return;

        products.push({
          name: row.name,
          min_stock_limit: row.min_stock_limit
            ? Number(row.min_stock_limit)
            : 10,
          description: row.description || null,
          specifications: row.specifications || null,
          image_url: row.image_url
            ? row.image_url.split("|")
            : [],
          price: Number(row.price),
        });
      })
      .on("end", async () => {
        try {
          if (!products.length) {
            return res.status(400).json({
              success: false,
              message: "No valid data found in CSV",
            });
          }

          const result = await prisma.product.createMany({
            data: products,
            skipDuplicates: true,
          });

          return res.json({
            success: true,
            message: `${result.count} products uploaded successfully`,
          });
        } catch (dbError) {
          console.error("DB error:", dbError);
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }
      });

    // ✅ Feed CSV buffer (form-data) into parser
    csvParser.write(req.file.buffer);
    csvParser.end();

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};