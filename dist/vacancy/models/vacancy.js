"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const shortid_1 = __importDefault(require("shortid"));
const slugify_1 = __importDefault(require("slugify"));
const vacancySchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        require: 'El nombre de la vacante es obligatorio',
        trim: true,
    },
    company: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
        require: 'La ubicacion es obligatoria',
    },
    salary: {
        type: String,
        default: '0',
        trim: true,
    },
    contract: {
        type: String,
    },
    description: {
        type: String,
        trim: true,
    },
    url: {
        type: String,
        lowercase: true,
    },
    skills: [String],
    candidates: [{
            name: String,
            email: String,
            cv: String,
        }],
    author: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: 'User',
        required: 'El autor es obligatorio',
    },
});
vacancySchema.pre('save', function (next) {
    const vacancy = this; // Especificamos que `this` es de tipo `IVacancy`
    const slug = (0, slugify_1.default)(vacancy.title, { lower: true }); // Genera un slug basado en el título
    vacancy.url = `${slug}-${shortid_1.default.generate()}`; // Combina el slug con un ID único
    next();
});
const Vacancy = mongoose_1.default.model('Vacancy', vacancySchema);
exports.default = Vacancy;
