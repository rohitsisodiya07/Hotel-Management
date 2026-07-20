const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

exports.uploadImage = async (files) => {
    const fileArray = Array.isArray(files) ? files : [files];

    const results = [];

    for (const file of fileArray) {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "hotel-management/admins",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) {
                            return reject(error);
                        }

                        resolve(result);
                    }
                )
                .end(file.data);
        });

        results.push(result);
    }

    return results;
};