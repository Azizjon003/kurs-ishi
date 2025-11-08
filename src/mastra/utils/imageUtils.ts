/**
 * Image utilities for Word document generation
 * Handles image downloading and embedding in Word documents
 */

import { Paragraph, ImageRun, AlignmentType, convertInchesToTwip, TextRun } from "docx";
import * as https from "https";
import * as http from "http";

/**
 * Download image from URL as Buffer
 */
export async function downloadImage(url: string): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const protocol = url.startsWith("https") ? https : http;

      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          console.error(`Failed to download image: ${response.statusCode}`);
          resolve(null);
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", (error) => {
          console.error("Error downloading image:", error);
          resolve(null);
        });
      }).on("error", (error) => {
        console.error("Error with image request:", error);
        resolve(null);
      });
    } catch (error) {
      console.error("Error in downloadImage:", error);
      resolve(null);
    }
  });
}

/**
 * Create image paragraph for Word document
 *
 * @param imageUrl - URL of the image
 * @param caption - Optional caption for the image
 * @param width - Image width in inches (default: 6)
 * @param height - Image height in inches (default: 4)
 * @returns Array of paragraphs (image + caption)
 */
export async function createImageParagraph(
  imageUrl: string,
  caption?: string,
  width: number = 6,
  height: number = 4
): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  try {
    console.log(`📥 Downloading image from: ${imageUrl}`);
    const imageBuffer = await downloadImage(imageUrl);

    if (!imageBuffer) {
      console.warn(`⚠️ Failed to download image, skipping`);
      return paragraphs;
    }

    console.log(`✅ Image downloaded successfully (${imageBuffer.length} bytes)`);

    // Add spacing before image
    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { before: 200, after: 100 },
      })
    );

    // Create image paragraph
    paragraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: {
              width: convertInchesToTwip(width),
              height: convertInchesToTwip(height),
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 100,
          after: 100,
        },
      })
    );

    // Add caption if provided
    if (caption) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: caption,
              font: "Times New Roman",
              size: 24, // 12pt for captions
              italics: true,
              color: "666666", // Gray color
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 200,
          },
        })
      );
    }

    // Add spacing after image
    paragraphs.push(
      new Paragraph({
        text: "",
        spacing: { after: 200 },
      })
    );

    return paragraphs;
  } catch (error) {
    console.error("Error creating image paragraph:", error);
    return paragraphs;
  }
}

/**
 * Create chapter header image
 * Larger image at the start of a chapter
 */
export async function createChapterHeaderImage(
  imageUrl: string,
  chapterTitle: string
): Promise<Paragraph[]> {
  return createImageParagraph(
    imageUrl,
    `Rasm: ${chapterTitle}`,
    6, // Full width
    3.5 // Aspect ratio for header
  );
}
