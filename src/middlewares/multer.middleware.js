import multer from "multer";

// creates a diskStorage engine, which means that uploaded files will be stored on the disk of the server.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    //null as the first argument (indicating no error) and the destination directory as the second argument
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
