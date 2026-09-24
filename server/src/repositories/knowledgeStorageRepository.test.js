import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpload = vi.fn();
const mockGetFiles = vi.fn();
const mockFileDelete = vi.fn();
const mockGetSignedUrl = vi.fn();
const mockStorageFile = vi.fn();

vi.mock("../config/firebase.js", () => ({
  storage: {
    upload: mockUpload,
    getFiles: mockGetFiles,
    file: mockStorageFile,
    name: "test-bucket",
  },
}));

vi.mock("fs", () => ({
  existsSync: vi.fn(() => true),
  statSync: vi.fn(() => ({ size: 1024 })),
}));

vi.mock("path", () => ({
  extname: vi.fn((p) => {
    const dot = p.lastIndexOf(".");
    return dot >= 0 ? p.slice(dot) : "";
  }),
}));

mockStorageFile.mockReturnValue({
  delete: mockFileDelete,
  getSignedUrl: mockGetSignedUrl,
});

const {
  uploadPdfToStorage,
  listPdfsFromStorage,
  getPdfDownloadUrl,
  uploadMarkdownToStorage,
  listMarkdownFromStorage,
  deleteFileFromStorage,
} = await import("./knowledgeStorageRepository.js");

const { existsSync, statSync } = await import("fs");

describe("knowledgeStorageRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageFile.mockReturnValue({
      delete: mockFileDelete,
      getSignedUrl: mockGetSignedUrl,
    });
    existsSync.mockReturnValue(true);
    statSync.mockReturnValue({ size: 1024 });
  });

  describe("uploadPdfToStorage", () => {
    it("uploads a PDF and returns metadata", async () => {
      mockUpload.mockResolvedValue();

      const result = await uploadPdfToStorage("/tmp/test.pdf", "test.pdf");

      expect(mockUpload).toHaveBeenCalledWith("/tmp/test.pdf", {
        destination: "knowledge_sources/raw_pdfs/test.pdf",
        metadata: expect.objectContaining({ contentType: "application/pdf" }),
      });
      expect(result.fileName).toBe("test.pdf");
      expect(result.storagePath).toBe("knowledge_sources/raw_pdfs/test.pdf");
      expect(result.publicUrl).toContain("test-bucket");
    });

    it("passes custom metadata to upload", async () => {
      mockUpload.mockResolvedValue();

      await uploadPdfToStorage("/tmp/test.pdf", "test.pdf", { source: "manual" });

      expect(mockUpload).toHaveBeenCalledWith(
        "/tmp/test.pdf",
        expect.objectContaining({
          metadata: expect.objectContaining({
            metadata: expect.objectContaining({ source: "manual" }),
          }),
        }),
      );
    });

    it("throws when file does not exist", async () => {
      existsSync.mockReturnValue(false);
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(uploadPdfToStorage("/tmp/missing.pdf", "missing.pdf"))
        .rejects.toThrow("File not found");
      spy.mockRestore();
    });

    it("throws when file is not a PDF", async () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(uploadPdfToStorage("/tmp/test.txt", "test.txt"))
        .rejects.toThrow("Invalid file type");
      spy.mockRestore();
    });

    it("throws when file exceeds max size", async () => {
      statSync.mockReturnValue({ size: 60 * 1024 * 1024 });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(uploadPdfToStorage("/tmp/huge.pdf", "huge.pdf"))
        .rejects.toThrow("File exceeds max size");
      spy.mockRestore();
    });

    it("logs and rethrows on upload failure", async () => {
      mockUpload.mockRejectedValue(new Error("upload failed"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(uploadPdfToStorage("/tmp/test.pdf", "test.pdf"))
        .rejects.toThrow("upload failed");
      expect(spy).toHaveBeenCalledWith(
        "knowledgeStorageRepository.uploadPdfToStorage failed:",
        "upload failed",
      );
      spy.mockRestore();
    });
  });

  describe("listPdfsFromStorage", () => {
    it("returns filtered list of PDF files", async () => {
      mockGetFiles.mockResolvedValue([[
        { name: "knowledge_sources/raw_pdfs/doc.pdf", metadata: { size: "2048", timeCreated: "2024-01-01", metadata: {} } },
        { name: "knowledge_sources/raw_pdfs/.keep", metadata: { size: "0", timeCreated: "2024-01-01" } },
      ]]);

      const result = await listPdfsFromStorage();

      expect(result).toHaveLength(1);
      expect(result[0].fileName).toBe("doc.pdf");
      expect(result[0].size).toBe(2048);
    });

    it("returns empty array when no PDFs exist", async () => {
      mockGetFiles.mockResolvedValue([[]]);

      const result = await listPdfsFromStorage();
      expect(result).toEqual([]);
    });

    it("logs and rethrows on list failure", async () => {
      mockGetFiles.mockRejectedValue(new Error("access denied"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(listPdfsFromStorage()).rejects.toThrow("access denied");
      spy.mockRestore();
    });
  });

  describe("getPdfDownloadUrl", () => {
    it("returns a signed URL for the PDF", async () => {
      mockGetSignedUrl.mockResolvedValue(["https://storage.googleapis.com/signed-url"]);

      const url = await getPdfDownloadUrl("test.pdf");

      expect(mockStorageFile).toHaveBeenCalledWith("knowledge_sources/raw_pdfs/test.pdf");
      expect(url).toBe("https://storage.googleapis.com/signed-url");
    });

    it("logs and rethrows when file not found", async () => {
      mockGetSignedUrl.mockRejectedValue(new Error("file not found"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(getPdfDownloadUrl("missing.pdf")).rejects.toThrow("file not found");
      spy.mockRestore();
    });
  });

  describe("uploadMarkdownToStorage", () => {
    it("uploads a Markdown file and returns metadata", async () => {
      mockUpload.mockResolvedValue();

      const result = await uploadMarkdownToStorage("/tmp/doc.md", "doc.md");

      expect(mockUpload).toHaveBeenCalledWith("/tmp/doc.md", {
        destination: "knowledge_sources/markdown_output/doc.md",
        metadata: expect.objectContaining({ contentType: "text/markdown" }),
      });
      expect(result.fileName).toBe("doc.md");
      expect(result.storagePath).toBe("knowledge_sources/markdown_output/doc.md");
    });

    it("throws when file is not Markdown", async () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(uploadMarkdownToStorage("/tmp/test.pdf", "test.pdf"))
        .rejects.toThrow("Invalid file type");
      spy.mockRestore();
    });

    it("throws when Markdown file exceeds max size", async () => {
      statSync.mockReturnValue({ size: 15 * 1024 * 1024 });
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(uploadMarkdownToStorage("/tmp/huge.md", "huge.md"))
        .rejects.toThrow("File exceeds max size");
      spy.mockRestore();
    });
  });

  describe("listMarkdownFromStorage", () => {
    it("returns filtered list of Markdown files", async () => {
      mockGetFiles.mockResolvedValue([[
        { name: "knowledge_sources/markdown_output/doc.md", metadata: { size: "4096", timeCreated: "2024-01-01", metadata: { sourceFile: "doc.pdf" } } },
      ]]);

      const result = await listMarkdownFromStorage();

      expect(result).toHaveLength(1);
      expect(result[0].fileName).toBe("doc.md");
      expect(result[0].metadata.sourceFile).toBe("doc.pdf");
    });

    it("returns empty array when no Markdown files exist", async () => {
      mockGetFiles.mockResolvedValue([[]]);

      const result = await listMarkdownFromStorage();
      expect(result).toEqual([]);
    });
  });

  describe("deleteFileFromStorage", () => {
    it("deletes the file and returns true", async () => {
      mockFileDelete.mockResolvedValue();

      const result = await deleteFileFromStorage("knowledge_sources/raw_pdfs/test.pdf");

      expect(mockStorageFile).toHaveBeenCalledWith("knowledge_sources/raw_pdfs/test.pdf");
      expect(mockFileDelete).toHaveBeenCalledOnce();
      expect(result).toBe(true);
    });

    it("returns true when file does not exist (404)", async () => {
      mockFileDelete.mockRejectedValue({ code: 404 });

      const result = await deleteFileFromStorage("knowledge_sources/raw_pdfs/missing.pdf");
      expect(result).toBe(true);
    });

    it("logs and rethrows on non-404 errors", async () => {
      mockFileDelete.mockRejectedValue(new Error("permission denied"));
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(deleteFileFromStorage("knowledge_sources/raw_pdfs/test.pdf"))
        .rejects.toThrow("permission denied");
      expect(spy).toHaveBeenCalledWith(
        "knowledgeStorageRepository.deleteFileFromStorage failed:",
        "permission denied",
      );
      spy.mockRestore();
    });
  });
});
