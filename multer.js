const multer = require('multer');

// Define a function to dynamically set the storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename based on the current timestamp and a random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Combine the original fieldname, a unique suffix, and the file's mimetype extension
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  },
});

// Create a Multer instance with the defined storage configuration
const upload = multer({ storage: storage });

// Export the Multer instance for use in other parts of the application
module.exports = upload;
