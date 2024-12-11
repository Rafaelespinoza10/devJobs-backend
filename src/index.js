"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./vacancy/routes"));
const db_1 = require("./config/db");
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const routes_2 = __importDefault(require("./auth/routes"));
const passport_1 = __importDefault(require("./config/passport"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: 'variables.env' });
// Crear la carpeta de uploads si no existe
const uploadDir = path_1.default.join(__dirname, 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
(0, db_1.connectDB)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
    credentials: true,
}));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.json()); // Analiza respuestas JSON
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.DATABASE,
        autoRemove: 'native',
    }),
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Manejo de errores de multer
app.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return void res.status(400).json({ message: 'El archivo es demasiado grande.' });
        }
    }
    else if (error.message) {
        return void res.status(400).json({ message: error.message });
    }
    next(error);
});
// Rutas
app.use('/vacancy', routes_1.default);
app.use('/auth', routes_2.default);
// Asignar el puerto automáticamente en Render
const host = '0.0.0.0';
const port = Number(process.env.PORT) || 3000;
app.listen(port, host, () => {
    console.log(`Servidor corriendo en el puerto :${port}`);
});
