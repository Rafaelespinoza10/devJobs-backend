import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import dotenv from 'dotenv';

dotenv.config({ path: 'variables.env' });

export async function sendCvsToPython(filePath: string): Promise<any> {
    const baseUrl = process.env.PYTHONSERVER;
    const url = convertToUrl(filePath);
    
    // Convierte la URL a una ruta absoluta local
    const absolutePath = path.resolve(url);
    
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`El archivo no existe: ${absolutePath}`);
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(absolutePath)); // Agrega el stream del archivo

    try {
        const response = await axios.post(`${baseUrl}/information-cv`, formData, {
            headers: {
                ...formData.getHeaders(), // Incluye los encabezados generados por form-data
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.message;
    }
}

function convertToUrl(filePath: string): string {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const cleanedPath = normalizedPath.replace(/^src\//, '');
    return `src/${cleanedPath}`;
}
