import fs from "fs";
import { generateWordDocument } from "./src/mastra/utils/wordDocumentGenerator";

const data = fs.readFileSync("yangi-test.json", "utf8");
const jsonData = JSON.parse(data);

const documentPath = "test.docx";
generateWordDocument(jsonData);
