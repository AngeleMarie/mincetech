import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';


dotenv.config();
const photosDir = 'photos';
if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'photos');
    },
    filename: (req, file, cb) => {

        cb(null, `${Date.now()}-file-${file.originalname}`);
    }
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const match = ['image/png', 'image/jpg', 'image/jpeg'];
        
        if (match.indexOf(file.mimetype) === -1) {
            cb(new Error('Unsupported file type. Please upload a PNG or JPG image.'));
        } else {
            cb(null, true);
        }
    },
});



export default upload;
