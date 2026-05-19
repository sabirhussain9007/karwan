import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { uploadToCloudinary } from "./cloudinary";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/** Converts uploads to a short URL stored in MongoDB (never in JWT cookies). */
export async function resolveAvatarInput(
  input: string,
  userId: string
): Promise<string> {
  if (!input) return "";

  if (/^https?:\/\//.test(input)) {
    if (input.length > 2048) throw new Error("Avatar URL is too long");
    return input;
  }

  if (!input.startsWith("data:image/")) {
    throw new Error("Avatar must be an image file or URL");
  }

  const base64Data = input.split(",")[1];
  if (!base64Data) throw new Error("Invalid image data");

  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.length > MAX_AVATAR_BYTES) {
    throw new Error("Image must be smaller than 2MB");
  }

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    return uploadToCloudinary(buffer, "avatars");
  }

  const ext = input.includes("image/png") ? "png" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });
  const filename = `${userId}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/avatars/${filename}?v=${Date.now()}`;
}
