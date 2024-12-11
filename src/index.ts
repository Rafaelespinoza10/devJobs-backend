import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './vacancy/routes';
import { connectDB } from './config/db';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import routerAuth from './auth/routes';
import passport from './config/passport';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: 'variables.env' });

// Crear la carpeta de uploads si no existe
const uploadDir = 'https://devjobs-backend-p8dd.onrender.com/uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  credentials: true,
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());  // Analiza respuestas JSON
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SECRET!,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DATABASE!,
    autoRemove: 'native',
  }),
}));
app.use(passport.initialize());
app.use(passport.session());

// Manejo de errores de multer
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return void res.status(400).json({ message: 'El archivo es demasiado grande.' });
    }
  } else if (error.message) {
    return void res.status(400).json({ message: error.message });
  }

  next(error);
});

// Rutas
app.use('/vacancy', router);
app.use('/auth', routerAuth);

// Asignar el puerto automáticamente en Render
const host = '0.0.0.0';
const port = Number(process.env.PORT) || 3000;

app.listen(port, host, () => {
  console.log(`Servidor corriendo en el puerto :${port}`);
});
