/**
 * Response from imgbb JSON upload
 */
export interface ImgbbUploadResponse {
  status_code: number;
  image?: {
    url?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Upload image to imgbb
 * @param buffer Image buffer
 * @param mimeType Image MIME type (e.g., 'image/jpeg', 'image/png')
 * @returns Image URL from imgbb
 */
export async function uploadImageToImgbb(
  buffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<string> {
  try {
    const formData = new FormData();

    const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
    const fileName = `image-${Date.now()}.${mimeType.split("/")[1] || "jpg"}`;

    formData.append("source", blob, fileName);
    formData.append("type", "file");
    formData.append("action", "upload");

    const response = await fetch("https://imgbb.com/json", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to upload to imgbb: ${response.status} - ${errorText}`
      );
    }

    const result = (await response.json()) as ImgbbUploadResponse;

    if (result?.status_code !== 200 || !result.image?.url) {
      throw new Error("Invalid response from imgbb");
    }

    return result.image.url;
  } catch (error) {
    console.error("Error uploading image to imgbb:", error);
    throw error;
  }
}
