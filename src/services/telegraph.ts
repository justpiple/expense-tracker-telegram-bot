export interface TelegraphUploadResponse {
  src: string;
}

/**
 * Upload image to telegra.ph
 * @param buffer Image buffer
 * @param mimeType Image MIME type (e.g., 'image/jpeg', 'image/png')
 * @returns Full image URL from telegra.ph
 */
export async function uploadImageToTelegraph(
  buffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<string> {
  try {
    const formData = new FormData();

    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    const fileName = `image-${Date.now()}.${mimeType.split("/")[1] || "jpg"}`;
    formData.append("file", blob, fileName);

    const response = await fetch("https://telegra.ph/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to upload to telegra.ph: ${response.status} - ${errorText}`
      );
    }

    const result = (await response.json()) as TelegraphUploadResponse[];

    if (!result || result.length === 0 || !result[0]?.src) {
      throw new Error("Invalid response from telegra.ph");
    }

    const imagePath = result[0].src;
    const imageUrl = imagePath.startsWith("http")
      ? imagePath
      : `https://telegra.ph${imagePath}`;

    return imageUrl;
  } catch (error) {
    console.error("Error uploading image to telegra.ph:", error);
    throw error;
  }
}
