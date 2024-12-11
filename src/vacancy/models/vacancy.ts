import mongoose  from 'mongoose';
import shortid from 'shortid';
import slugify from 'slugify';
import { IVacancy } from '../interfaces/vacancy.model.interface';


const vacancySchema = new mongoose.Schema<IVacancy>({
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
    url:{
        type: String, 
        lowercase: true, 
    },
    skills:[String], 
    candidates: [{
        name: String, 
        email: String, 
        cv: String, 
    }],
    author:{
        type: mongoose.Schema.ObjectId, 
        ref: 'User',
        required: 'El autor es obligatorio',
    },
});
vacancySchema.pre('save', function(next){
        const vacancy = this as IVacancy; // Especificamos que `this` es de tipo `IVacancy`
        const slug = slugify(vacancy.title, { lower: true }); // Genera un slug basado en el título
        vacancy.url = `${slug}-${shortid.generate()}`; // Combina el slug con un ID único
        next();    
})

const Vacancy = mongoose.model('Vacancy', vacancySchema);

export default Vacancy; 
