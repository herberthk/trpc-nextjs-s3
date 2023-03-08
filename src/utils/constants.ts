import { string } from "zod";

// File size should not exceed 500kb
export const MAX_FILE_SIZE = 500000;
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/jpg",
  "image/webp",
];
// Validate image type
export const ImageType = string().refine((file) => {
  if (!file) return;
  return (
    ACCEPTED_IMAGE_TYPES.includes(file.toLowerCase()),
    `Only images with extensions ${ACCEPTED_IMAGE_TYPES.join(", ")} are allowed`
  );
});
