import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {      // cb=> call back
      cb(null, './public/temp')                  // path of files which has to be stored
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)          // original file name that has been given by user will be used as name on server temporarirly
    }
  })
  
export  const upload = multer({ storage: storage })