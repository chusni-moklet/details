import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file     = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Allow images and PDFs
    const isImage = file.type.startsWith("image/");
    const isPDF   = file.type === "application/pdf";

    if (!isImage && !isPDF) {
      return NextResponse.json({ error: "File harus berupa gambar atau PDF" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File terlalu besar (max 10MB)" }, { status: 400 });
    }

    const buffer    = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder:       "certificates",
            public_id:    `cert-${user.id}-${timestamp}`,
            resource_type: isPDF ? "raw" : "image",
            ...(isImage && {
              transformation: [
                { quality: "auto", fetch_format: "auto" },
              ],
            }),
          },
          (error, res) => {
            if (error || !res) reject(error ?? new Error("Upload failed"));
            else resolve(res as { secure_url: string });
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Certificate upload error:", err);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }
}
