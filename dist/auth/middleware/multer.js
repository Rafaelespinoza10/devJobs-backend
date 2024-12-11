"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadDocument = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (request, response, cb) => {
        cb(null, 'src/uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    }
});
const fileFilter = (request, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
        return cb(null, true);
    }
    else {
        cb(new Error('Formato de archivo no permitido, solo JPEG, PNG, JPG'));
    }
};
const fileFilterDocument = (request, file, cb) => {
    const allowedTypes = /pdf/;
    const extName = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
        return cb(null, true);
    }
    else {
        cb(new Error('Formato de archivo no permitido, solo PDF'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, //2MB
    fileFilter,
});
exports.uploadDocument = (0, multer_1.default)({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, //200kB
    fileFilter: fileFilterDocument,
});
