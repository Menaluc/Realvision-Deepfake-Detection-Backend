const express = require('express') // import
const router = express.Router() // creat router
router.post("/predict", (req, res) => {
    res.json({ "message": "Prediction endpoint working" });

});

module.exports = router

