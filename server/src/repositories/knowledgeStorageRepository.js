/**
 * Knowledge Storage Repository
 *
 * Firebase Storage operations for PDF and Markdown files used by the
 * knowledge-base ingestion tooling. This is not a user-upload feature.
 *
 * Storage folder structure:
 *   knowledge_sources/raw_pdfs/       — Source PDF files
 *   knowledge_sources/markdown_output/ — Converted Markdown files
 */
import { storage } from "../config/firebase.js";
import { existsSync, statSync } from "fs";
import { extname } from "path";

const PDF_PREFIX = "knowledge_sources/raw_pdfs/";
const MD_PREFIX = "knowledge_sources/markdown_output/";
const MAX_PDF_SIZE = 50 * 1024 * 1024;
const MAX_MD_SIZE = 10 * 1024 * 1024;

function validateFile(filePath, extension, maxSize) {
  if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  if (extname(filePath).toLowerCase() !== extension) {
    throw new Error(`Invalid file type. Expected ${extension}`);
  }
  if (statSync(filePath).size > maxSize) {
    throw new Error(`File exceeds max size of ${maxSize} bytes`);
  }
}

async function uploadFile(filePath, fileName, prefix, contentType, meta) {
  const storagePath = `${prefix}${fileName}`;
  const uploadedAt = new Date().toISOString();
  await storage.upload(filePath, {
    destination: storagePath,
    metadata: { contentType, metadata: { ...meta, uploadedAt } },
  });
  const publicUrl = `https://storage.googleapis.com/${storage.name}/${storagePath}`;
  return { fileName, storagePath, publicUrl, uploadedAt };
}

async function listFiles(prefix, extension) {
  const [files] = await storage.getFiles({ prefix });
  return files
    .filter((f) => f.name.endsWith(extension))
    .map((f) => ({
      fileName: f.name.split("/").pop(),
      storagePath: f.name,
      size: Number(f.metadata.size),
      timeCreated: f.metadata.timeCreated,
      metadata: f.metadata.metadata || {},
    }));
}

export async function uploadPdfToStorage(filePath, fileName, metadata = {}) {
  try {
    validateFile(filePath, ".pdf", MAX_PDF_SIZE);
    return await uploadFile(filePath, fileName, PDF_PREFIX, "application/pdf", metadata);
  } catch (error) {
    console.error("knowledgeStorageRepository.uploadPdfToStorage failed:", error.message);
    throw error;
  }
}

export async function listPdfsFromStorage(prefix = PDF_PREFIX) {
  try {
    return await listFiles(prefix, ".pdf");
  } catch (error) {
    console.error("knowledgeStorageRepository.listPdfsFromStorage failed:", error.message);
    throw error;
  }
}

export async function getPdfDownloadUrl(fileName) {
  try {
    const file = storage.file(`${PDF_PREFIX}${fileName}`);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 60 * 60 * 1000,
    });
    return url;
  } catch (error) {
    console.error("knowledgeStorageRepository.getPdfDownloadUrl failed:", error.message);
    throw error;
  }
}

export async function uploadMarkdownToStorage(filePath, fileName, metadata = {}) {
  try {
    validateFile(filePath, ".md", MAX_MD_SIZE);
    return await uploadFile(filePath, fileName, MD_PREFIX, "text/markdown", metadata);
  } catch (error) {
    console.error("knowledgeStorageRepository.uploadMarkdownToStorage failed:", error.message);
    throw error;
  }
}

export async function listMarkdownFromStorage(prefix = MD_PREFIX) {
  try {
    return await listFiles(prefix, ".md");
  } catch (error) {
    console.error("knowledgeStorageRepository.listMarkdownFromStorage failed:", error.message);
    throw error;
  }
}

export async function deleteFileFromStorage(storagePath) {
  try {
    await storage.file(storagePath).delete();
    return true;
  } catch (error) {
    if (error.code === 404) return true;
    console.error("knowledgeStorageRepository.deleteFileFromStorage failed:", error.message);
    throw error;
  }
}
