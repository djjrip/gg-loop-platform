import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } = process.env;

// Initialize S3 Client (Lazy/Safe)
let s3Client: S3Client | null = null;

function getS3Client() {
    if (s3Client) return s3Client;

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
        console.warn("[S3] Warning: AWS Credentials not configured.");
        return null;
    }

    s3Client = new S3Client({
        region: AWS_REGION || "us-east-1",
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
    });
    return s3Client;
}

export async function generatePresignedUploadUrl(userId: string, extension: string, contentType: string) {
    const client = getS3Client();
    const bucket = AWS_S3_BUCKET || "ggloop-verification-proofs";

    if (!client) {
        throw new Error("AWS S3 Not Configured");
    }

    const timestamp = Date.now();
    const key = `proofs/${userId}/${timestamp}_${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        // Enforce public read? Or private? Verification proofs usually private or presigned GET.
        // Let's keep private for now.
    });

    try {
        const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 minutes

        console.log(`[S3] Generated upload URL for User ${userId} -> ${key}`);

        return {
            uploadUrl,
            key,
            bucket
        };
    } catch (error: any) {
        console.error("[S3] Error generating pre-signed URL:", error);
        throw new Error("Failed to generate upload URL");
    }
}
