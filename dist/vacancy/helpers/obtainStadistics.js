"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCvsToPython = sendCvsToPython;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'variables.env' });
function sendCvsToPython(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseUrl = process.env.PYTHONSERVER;
        const url = convertToUrl(filePath);
        // Convierte la URL a una ruta absoluta local
        const absolutePath = path_1.default.resolve(url.replace(process.env.BASE_URL, "src"));
        if (!fs_1.default.existsSync(absolutePath)) {
            throw new Error(`El archivo no existe: ${absolutePath}`);
        }
        const formData = new form_data_1.default();
        formData.append("file", fs_1.default.createReadStream(absolutePath)); // Agrega el stream del archivo
        try {
            const response = yield axios_1.default.post(`${baseUrl}/information-cv`, formData, {
                headers: Object.assign({}, formData.getHeaders()),
            });
            return response.data;
        }
        catch (error) {
            throw error.message;
        }
    });
}
function convertToUrl(filePath) {
    const baseUrl = process.env.BASE_URL;
    const normalizedPath = filePath.replace(/\\/g, '/');
    const cleanedPath = normalizedPath.replace(/^src\//, '');
    return `${baseUrl}/${cleanedPath}`;
}
