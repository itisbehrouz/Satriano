import crypto from "crypto";
import { NextResponse } from "next/server";

const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (key && key.length >= 32) {
    return key.slice(0, 32);
  }
  return "0123456789abcdef0123456789abcdef";
};

export function encryptField(data: string): string {
  if (!data) return data;
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptField(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(":")) {
    return encryptedData;
  }
  
  try {
    const key = getEncryptionKey();
    const parts = encryptedData.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}
