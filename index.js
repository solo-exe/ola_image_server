require('dotenv').config()
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')

const cloudflare = require('./src/apis/cloudflare')

const app = express()

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

const upload = multer();

// API route to handle image upload
app.post('/upload', upload.single('image'), async (req, res, next) => {
    try {
        const { buffer, mimetype, size } = req.file;
        const allowed = ['image/png', 'image/jpeg', 'image/jpg']
        if (!allowed.includes(mimetype) || size > 5e6) throw new Errors.BadRequest('Unsupported File.')
        const imageUrl = await cloudflare.uploadImageToCloudflare(buffer);
        console.log(imageUrl);
        // fs.unlinkSync(imagePath);
        res.json({ imageUrl });
    } catch (error) {
        next(error)
    }
});

// API route to handle image upload
app.get('/fetch/images', async (req, res, next) => {
    try {
        const response = await cloudflare.fetchImages();
        console.log(response);
        res.json({ response });
    } catch (error) {
        next(error)
    }
});


app.use((req, res) => res.status(404).send({ status: "error", message: 'Not Found' }))

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ status: "error", message: 'Unknown Error Occured' })
})

app.listen(process.env.PORT, () => console.log(`Listening on PORT: ${process.env.PORT}`))