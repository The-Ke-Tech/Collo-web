const url = "https://api.cloudinary.com/v1_1/dqtmsllzn/image/upload";

const uploadImage = async (image: File, p0: (progress: number) => void): Promise<string> => {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "coltec");

  const dataResponse = await fetch(url, {
    method: "post",
    body: formData,
  });

  const data = await dataResponse.json();
  return data.secure_url; // ✅ always return plain string URL
};

export default uploadImage;
