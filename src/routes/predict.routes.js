const express = require('express') // import
const multer = require('multer');
const path = require('path');
const router = express.Router() // creat router

// Where to save the uploaded file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")

    },

    // Create a unique file name
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);

        cb(null, name + '-' + Date.now() + ext);
    }
});

// Accept only video files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// Upload settings
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB max file size
    }
});

// Upload endpoint for video prediction input
router.post("/predict", (req, res) => {
    upload.single('video')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log(err);
            return res.status(400).json({
                message: 'File is too large'
            });
        }

        // Handle unexpected upload errorr
        else if (err) {
            return res.status(400).json({
                message: 'Upload error'
            });
        }

        // Handle missing or invalid file
        if (!req.file) {
            return res.status(400).json({
                message: 'No valid video file provided'
            })
        }

        // Return uploaded file details as a temporary success response
        return res.status(200).json({
            message: 'Upload successful',
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });
    });
});

module.exports = router

