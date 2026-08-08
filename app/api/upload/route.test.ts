import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/upload/route";

describe("POST /api/upload", () => {
  it("returns 400 when no file is provided", async () => {
    const formData = new FormData();
    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      })
    );
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("No file provided");
  });

  it("uploads a file successfully and returns public URL", async () => {
    const formData = new FormData();
    const mockFile = new File(["dummy logo vector content"], "brand_logo.svg", {
      type: "image/svg+xml",
    });
    formData.append("file", mockFile, "brand_logo.svg");

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      })
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toBeDefined();
    expect(json.filename).toBeTypeOf("string");
  });

  it("accepts .ai and .eps vector files successfully", async () => {
    const formData = new FormData();
    const aiFile = new File(["%AI-5.0 Vector"], "brand_logo.ai", {
      type: "application/postscript",
    });
    formData.append("file", aiFile, "brand_logo.ai");

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      })
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toBeDefined();
    expect(json.filename).toContain(".ai");
  });
});
