import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (request, response, cb) =>{
        cb(null, 'src/uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${ext}`)
    }
});


const fileFilter = (request:any, file:any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);    
    if(extName && mimeType){
        return cb(null, true);
    }else{
        cb(new Error('Formato de archivo no permitido, solo JPEG, PNG, JPG'));
    }
}

const fileFilterDocument = (request:any, file: any, cb: any) => {
    const allowedTypes = /pdf/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if(extName && mimeType){
        return cb(null, true);
    }else{
        cb(new Error('Formato de archivo no permitido, solo PDF'));
    }
}


export const upload = multer({
    storage, 
    limits: { fileSize: 2 * 1024 * 1024},  //2MB
    fileFilter,
});

export const uploadDocument = multer({
    storage,
    limits: {fileSize: 2*1024 * 1024}, //200kB
    fileFilter: fileFilterDocument,
})