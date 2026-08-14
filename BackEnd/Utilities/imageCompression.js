const sharp = require("sharp");

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
];

const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

const compressImage = async (file) => {
    if (!file) {
        throw new Error("Image is required.");
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new Error(
            "Only JPG, JPEG and PNG images are allowed."
        );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
        throw new Error(
            "Image size should be less than 1 MB."
        );
    }

    // Compress image
    const compressedBuffer = await sharp(file.data)
        .rotate() // Auto rotate according to EXIF
        .resize({
            width: 1600,
            withoutEnlargement: true,
            fit: "inside",
        })
        .jpeg({
            quality: 85,
            mozjpeg: true,
        })
        .toBuffer();

    return compressedBuffer;
};

module.exports = compressImage;