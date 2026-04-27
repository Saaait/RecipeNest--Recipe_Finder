const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

/**
 * Get the full URL for a recipe image
 * @param {string} imagePath - The image path from the database (e.g., "uploads/file.jpg")
 * @returns {string} The full URL for the image (e.g., "http://localhost:5001/uploads/file.jpg")
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL, return it as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Normalize path separators (convert backslashes to forward slashes)
  const normalizedPath = imagePath.replace(/\\/g, "/");

  // Remove leading slash if present to avoid double slashes
  const cleanPath = normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath;

  // Combine with backend URL
  return `${BACKEND_URL}/${cleanPath}`;
};