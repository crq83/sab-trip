import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ r2Key: string; r2Url: string }> {
  const year = new Date().getFullYear();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const r2Key = `media/${year}/${uuidv4()}-${safeFileName}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: r2Key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  const r2Url = `${process.env.R2_PUBLIC_URL}/${r2Key}`;
  return { r2Key, r2Url };
}
