import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import dotenv from 'dotenv';

dotenv.config({ path: 'variables.env' });

export async function sendCvsToPython(filePath: string): Promise<any> {
    const baseUrl = process.env.PYTHONSERVER;
    // const url = convertToUrl(filePath);
    
    // Convierte la URL a una ruta absoluta local
    
    const url = filePath.replace('src/','');
    console.log('file path', filePath);


    //filepath = 'src/uploads/documentcv.pdf
    const urlComplete = `https://devjobs-backend-p8dd.onrender.com/${url}`
 //   const absolutePath = path.resolve(filePath);
     console.log("URL completa generada:", urlComplete);

    
    // if (!fs.existsSync(absolutePath)) {
    //     throw new Error(`El archivo no existe: ${absolutePath}`);
    // }

    // const formData = new FormData();
    // formData.append("file", fs.createReadStream(absolutePath)); // Agrega el stream del archivo

    try {
        const response = await axios.post(`${baseUrl}/information-cv`, null, {
            params: { url: urlComplete },
        });
        
        console.log('data', response.data);
        if (!response || !response.data) {
            throw new Error(`Respuesta inesperada del servidor: ${response}`);
        }
        return response.data;
    } catch (error: any) {
        throw error.message;
    }
}



//'src/uploads/document.cv'
function convertToUrl(filePath: string): string {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const cleanedPath = normalizedPath.replace(/^src\//, '');
    return `src/${cleanedPath}`;
}
