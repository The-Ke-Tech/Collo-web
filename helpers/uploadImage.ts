const url = "https://api.cloudinary.com/v1_1/dba4cn3mn/image/upload";

const uploadImage = async (image: File) => {
  const formData = new FormData();
  formData.append("file", image);
  formData.append("upload_preset", "coltec");

  const dataResponse = await fetch(url, {
    method: "post",
    body: formData,
  });

  const data = await dataResponse.json();
  return data.secure_url; // ✅ return only the URL
};

export default uploadImage;
