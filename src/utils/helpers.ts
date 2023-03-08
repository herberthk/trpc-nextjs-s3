import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// this the helper function string dates to time ago format
export const timeAgo = (d: string) => dayjs().to(dayjs(d));

// Encode image to base64 such that we can upload it to server
export const getBase64 = (file: Blob) => {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Decode the base64 encoded image to Blob such that we view it in a browser
export const decodeBase64 = async (file: string) => {
  return fetch(file)
    .then((res) => res.blob())
    .then((data) => data);
};

// Upload to s3 using signed url
export const uploadToS3 = async (
  file: File | null,
  type?: string,
  url?: string
) => {
  if (!url) {
    return;
  }
  try {
    const result = await axios.put(url, file, {
      headers: {
        "Content-Type": type,
      },
    });

    return result;
  } catch (error) {
    console.log("Error uploading to S3", error);
    // throw new Error(e);
  }
};
