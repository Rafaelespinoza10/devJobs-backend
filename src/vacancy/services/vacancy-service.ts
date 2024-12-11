import User from "../../auth/models/auth";
import { AuthRequest } from "../../types";
import { sendCvsToPython } from "../helpers/obtainStadistics";
import { IVacancy } from "../interfaces/vacancy.model.interface";
import Vacancy from "../models/vacancy";


export class VacancyService {

    async createVacancy(vacancyData:IVacancy):Promise<IVacancy>{
        try{
            //encontramos el alor de 

            const newVacancy = new Vacancy(vacancyData);
            await newVacancy.save();
            return newVacancy;
        }catch(error){
            throw new Error(' Error al crear la vacante' + error);
        }
    }

    async getAllVacancy(): Promise<IVacancy[]> {
        try {
            const vacancies = await Vacancy.aggregate([
                {
                    $lookup: {
                        from: "users", 
                        localField: "author", // Campo que referencia al autor en `Vacancy`
                        foreignField: "_id", // Campo `_id` en la colección `users`
                        as: "authorDetails", // Alias para los detalles del autor
                    },
                },
                {
                    $unwind: "$authorDetails", 
                },
                {
                    $addFields: {
                        planOrder: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$authorDetails.planType", "Profesional"] }, then: 1 },
                                    { case: { $eq: ["$authorDetails.planType", "Empresarial"] }, then: 2 },
                                ],
                                default: 3, // Otros planes
                            },
                        },
                    },
                },
                {
                    $sort: { planOrder: 1 }, // Ordena primero por `planOrder`
                },
                {
                    $project: {
                        authorDetails: 0, // Opcional: elimina los detalles del autor del resultado
                        planOrder: 0, // Opcional: elimina el campo temporal `planOrder`
                    },
                },
            ]);
    
            return vacancies as IVacancy[];
        } catch (error: any) {
            throw new Error("Error al encontrar las vacantes: " + error.message);
        }
    }
    

    async getVacancyById(id:string):Promise<IVacancy | null>{
        try{
            const vacancy = await Vacancy.findById(id);
            if(!vacancy){
                throw new Error('No existe la vacante');
            }
            return vacancy;
        }catch(error){
            throw new Error('Error al obtener la vacante' + error);
        }
    }

    async getVacanciesByUserId(id:string):Promise<IVacancy[]>{
            try{
                const vacancies = await Vacancy.find({ author: id });
                if(!vacancies){
                    throw new Error('No exite la vacante');
                }
                return vacancies;
        }catch(error: any){
            throw new Error('Error al obtener la vacante'+ error);
        }
    }

    async editCandidateByVacancyId(id: string, candidate: any): Promise<IVacancy> {
        try {
            // Actualiza el documento usando $push para agregar al arreglo de candidatos
            const candidateUpdated = await Vacancy.findByIdAndUpdate(
                id,
                { $push: { candidates: candidate } }, // Usa $push para agregar al arreglo
                { new: true, runValidators: true }   // Retorna el documento actualizado
            );
    
            if (!candidateUpdated) {
                throw new Error('No se ha encontrado la vacante o no se pudo actualizar el candidato.');
            }
    
            return candidateUpdated;
        } catch (error: any) {
            throw new Error(`Error al editar el candidato: ${error.message}`);
        }
    }
    
    
    
    async editVacancy(id:string, vacancyData: Partial<IVacancy>):Promise< IVacancy | undefined>{
        try{
            const updateVacancy = await Vacancy.findByIdAndUpdate(id, vacancyData, {new: true, runValidators: true} );
                if(!updateVacancy){
                    throw new Error('No se ha podido actualizar la vacante');
                }
                return updateVacancy;
        }catch(error){
            throw new Error('error al editar la vacante' + error);
        }
    }

    async deleteVacancy(id:string): Promise<string | undefined>{
        try{
            const result = await Vacancy.deleteOne({_id: id});
            if (result.deletedCount === 0) {
                throw new Error('No se encontró la vacante para eliminar');
            }
            return 'La vacancte ha sido eliminada';
        }catch(error){
            throw new Error('error al eliminar la vacante' + error);
        }
    }

    // esto solo es para el plan profesional
    async getStadisticsByCandidates(id: string, userId: string): Promise<any> {
        try {
            const vacancy = await Vacancy.findById(id);
            const user = await User.findOne({ _id: userId }).lean();
    
            if (!user || user.planType !== 'Profesional') {
                return; // Retorna si el usuario no es profesional
            }
    
            if (!vacancy) {
                throw new Error('Vacante no encontrada');
            }
            const candidates = vacancy.candidates || []; // Garantiza que candidates sea un array

            if (candidates.length === 0) {
                return []; // Retorna un array vacío si no hay candidatos
            }
    
            const responses = await Promise.all(
                candidates.map(candidate => {
                    if (!candidate.cv) {
                        throw new Error(`El candidato ${candidate.name} no tiene un CV válido`);
                    }
                    return sendCvsToPython(candidate.cv);
                })
            );
            // Retorna las respuestas al cliente
            return responses;
        } catch (ex: any) {
            console.error('Ocurrió un error al obtener las estadísticas:', ex.message);
            throw new Error('Ocurrió un error al obtener las estadísticas: ' + ex.message);
        }
    }
    


    async obtainVacanciesForUserPlan(id: string): Promise<string | undefined>{
        //obtain the vacancies for user
        try{
            const user = await User.findOne({ _id:  id}).lean();
            const message = 'Has excedido el numero de vacantes por plan'
            const vacancies = await Vacancy.find({ author: id });
            if(!vacancies){
                throw new Error('No exite la vacante');
          }
            if(vacancies.length >= 3 &&  user?.planType === 'Gratuito'){   
                return 'Las vacantes de pruebas se han terminado, suscribete a un plan';
            }else if( vacancies.length >= 10  && user?.planType === 'Basico' ){
                return message +  ' ' + `${user?.planType}`;
            }else if( vacancies.length >= 30 && user?.planType === 'Estandar'){
                return message +  ' ' + `${user?.planType}`;
            }else if( vacancies.length >= 60 && user?.planType === 'Empresarial'){
                return message +  ' ' + `${user?.planType}`;
            }else if(vacancies.length >= 100 && user?.planType === 'Profesional' ){
                return message +  ' ' + `${user?.planType}`;
            }
            return 'Aun puedes publicar tus vacantes'
        }catch(ex: any){
            throw new Error('Ocurrio un error ' + ex.message);
        }
    }
}
