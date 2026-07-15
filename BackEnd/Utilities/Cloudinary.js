const cloudinary =
    require("cloudinary").v2;

cloudinary.config({
    cloud_name:
        process.env.CLOUD_NAME,
    api_key:
        process.env.API_KEY,
    api_secret:
        process.env.API_SECRET,
});

exports.uploadImage = async (
    files
) => {
    const fileArray =
        Object.values(files);

    const results = [];

    for (const file of fileArray) {
        const result =
            await new Promise(
                (resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream(
                            (
                                error,
                                result
                            ) => {
                                if (error)
                                    reject(error);
                                else
                                    resolve(result);
                            }
                        )
                        .end(file.data);
                }
            );

        results.push(result);
    }

    return results;
};