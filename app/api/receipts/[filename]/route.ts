import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

// app/lib/uploads.ts가 저장하는 위치를 그대로 읽기만 한다. 저장 로직/경로는 건드리지 않는다.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  // uploads/ 밖의 파일에 접근하지 못하도록 순수 파일명만 허용한다.
  if (filename !== path.basename(filename) || filename.includes("..")) {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const buffer = await readFile(path.join(UPLOAD_DIR, filename));
    const contentType =
      CONTENT_TYPES[path.extname(filename).toLowerCase()] ??
      "application/octet-stream";

    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
