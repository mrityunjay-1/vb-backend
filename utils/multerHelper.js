const multer = require("multer");

const memoryStorage = multer.memoryStorage();

const multerMemoryStorage = multer({ storage: memoryStorage });

module.exports = {
    multerMemoryStorage
}