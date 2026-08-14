const cloudinary = require("cloudinary").v2;
const compressImage = require("./imageCompression");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadImage = async (files, folder = "hotel-management") => {
    const fileArray = Array.isArray(files) ? files : [files];

    const results = [];

    for (const file of fileArray) {

        // Compress image before upload
        const compressedBuffer = await compressImage(file);

        const result = await new Promise((resolve, reject) => {

            cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: "image",

                    // Cloudinary Optimization
                    quality: "auto",
                    fetch_format: "auto",
                },
                (error, result) => {

                    if (error) {
                        return reject(error);
                    }

                    resolve(result);

                }
            ).end(compressedBuffer);

        });

        results.push(result);
    }

    return results;
};

module.exports = {
    uploadImage,
};