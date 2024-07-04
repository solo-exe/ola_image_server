const axios = require('axios')
const fs = require('fs')
const stream = require('stream')
const FormData = require('form-data');

exports.fetchImages = async () => {
    try {
        const response = await axios.get(
            `${process.env.CLOUDFLARE_URL}/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/images/v1`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
                },
            }
        );
        console.log(response);
        if (response.data.success) {
            return response.data.result.images;
        } else {
            throw new Error('Failed to upload image: ' + JSON.stringify(response.data.errors));
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}


// Function to upload image to Cloudflare Images
exports.uploadImageToCloudflare = async (buffer) => {
    try {
        const imageFile = stream.Readable.from(buffer);
        const formData = new FormData();
        formData.append('file', imageFile);
        const response = await axios.post(
            `${process.env.CLOUDFLARE_URL}/client/v4/accounts/${process.env.CLOUDFLARE_ACC_ID}/images/v1`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
                },
            }
        );

        // Handle the response
        if (response.data.success) {
            return response.data.result.variants[0]; // Return the URL of the uploaded image
        } else {
            throw new Error('Failed to upload image: ' + JSON.stringify(response.data.errors));
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}