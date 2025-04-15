import { FIREBASE_BUCKET, FIREBASE_ID_TOKEN } from "../config/env";

export async function uploadFileFromBuffer(
  file: Buffer,
  fileName: string,
  mimeType: string = "application/octet-stream",
): Promise<any> {
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_BUCKET}/o?name=${encodeURIComponent(
    fileName,
  )}`;

  const firebaseRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": mimeType,
      ...(FIREBASE_ID_TOKEN
        ? { Authorization: `Bearer ${FIREBASE_ID_TOKEN}` }
        : {}),
    },
    body: file,
  });

  if (!firebaseRes.ok) {
    const errorText = await firebaseRes.text();
    throw new Error(`Failed to upload: ${firebaseRes.status} - ${errorText}`);
  }

  return await firebaseRes.json();
}
