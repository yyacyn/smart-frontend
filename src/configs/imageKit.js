import ImageKit from "imagekit";

// Initialize ImageKit with environment variables
// Check if all required environment variables are set
const hasImageKitConfig = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY &&
                          process.env.IMAGEKIT_PRIVATE_KEY &&
                          process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

let imageKit;

if (hasImageKitConfig) {
    imageKit = new ImageKit({
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
    });
} else {
    // Create a mock object if no config is provided
    imageKit = {
        upload: async (file) => {
            console.warn('ImageKit is not configured. Using mock upload.');
            return { url: file.file ? URL.createObjectURL(file.file) : '' };
        },
        url: (options) => {
            console.warn('ImageKit is not configured. Returning placeholder URL.');
            return options.path || '';
        }
    };
}

export default imageKit;