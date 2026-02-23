export const getPublicId = (url) => {
  if (!url) return null;

  const parts = url.split("/");
  const filename = parts.pop();          // img123.jpg
  const folder = parts.pop();            // products
  const publicId = `${folder}/${filename.split(".")[0]}`;

  return publicId;
};
