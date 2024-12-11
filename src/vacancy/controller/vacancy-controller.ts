import { Validations } from './../../auth/helpers/validations';
import { UserService } from '../../auth/services/auth-service';
import { AuthRequest } from '../../types';
import { IVacancy } from '../interfaces/vacancy.model.interface';
import { VacancyService } from '../services/vacancy-service';
import {Request, Response} from 'express';
import Vacancy from '../models/vacancy';

export class VacancyController {

    private _vacancyService: VacancyService;
    private _userValidations:Validations;

    constructor(){
        this._vacancyService = new VacancyService();
        this._userValidations = new Validations();
        this.obtainAllVacancy = this.obtainAllVacancy.bind(this);
        this.getVacancyForId = this.getVacancyForId.bind(this);
        this.getVacancyByUserId = this.getVacancyByUserId.bind(this);
        this.editVacancy = this.editVacancy.bind(this);
        this.createVacancy = this.createVacancy.bind(this);
        this.deleteVacancy = this.deleteVacancy.bind(this);
        this.editCandidatesByVacancyId = this.editCandidatesByVacancyId.bind(this);
        this.getVacanciesByUserIdPlan = this.getVacanciesByUserIdPlan.bind(this);
        this.obtainStadistcsByCandidates = this.obtainStadistcsByCandidates.bind(this);
    }

    async obtainAllVacancy(request:Request, response:Response){
        try{
 
            const vacancies = await this._vacancyService.getAllVacancy();
            response.status(201).json({
                message: 'Las vacantes han sido obtenidas exitosamente',
                vacancies,
            });
        }catch(error:any){
            response.status(500).json({
                message: `Error interno del servidor, ${ error }`,
                error: error.message, 
            })
        }
    }

 
    async getVacanciesByUserIdPlan(request: Request, response: Response){
        try{
            const { id } = request.params;
            const message = await this._vacancyService.obtainVacanciesForUserPlan(id);

            response.status(200).json({
                message
            });

        }catch(ex: any){
            response.status(500).json({
                message: `Ocurrrio un error interno en el servidor ${ex.message}`,
                error: ex.message,
            })
        }
    }
 
    async getVacancyByUserId(request:Request, response:Response){
        try{
            const userId = (request as AuthRequest).user?.id;
            const vacancies = await this._vacancyService.getVacanciesByUserId(userId);
            response.status(200).json({
                message: `Se ha encontrado la vacante para el usuario ${userId}`,
                vacancies,
            });
        }catch(error: any){
            response.status(500).json({
                message: 'Error interno del servidor' + error,
                error: error.message,
            });
        }
    }

    async getVacancyForId(request:Request, response:Response){
        try{
            const { id } = request.params;
            const vacancy = await this._vacancyService.getVacancyById(id);
            response.status(201).json({
                message:   `Se ha encontrado la vancante con id: ${id}`,
                vacancy
            });
        }catch(error:any){
            response.status(501).json({
                message: 'Error interno en el servidor' +error,
                error: error.message,
            })
        }
    }

    async createVacancy(request:Request, response:Response) {
        try {
            
            // Obtener el id del usuario autorizado
            const userId = (request as AuthRequest).user?.id;
            const vacancies = await Vacancy.find({ author: userId });
            const vacancyData: IVacancy = request.body as IVacancy;
            vacancyData.author = userId;  // Aquí asignas solo el ObjectId del usuario autorizado    

            if(vacancies.length >= 3 &&  vacancyData.author?.planType === 'Gratuito') return;
            if( vacancies.length >= 10 && vacancyData.author?.planType === 'Basico') return;
            if( vacancies.length >= 30 && vacancyData.author?.planType === 'Estandar') return;
            if(vacancies.length >= 60 && vacancyData.author?.planType === 'Empresarial') return; 
            if(vacancies.length >= 100 && vacancyData.author?.planType === 'Profesional') return;
            

            const vacancy =  await this._vacancyService.createVacancy(vacancyData);
            response.status(201).json({
                message: 'Vacante creada exitosamente',
                vacancy,
            })

        } catch (error:any) {
            response.status(500).json({
                message: `Error interno del servidor: ${error}`,
                error: error.message,
            })
        }
    }

    async editVacancy(request:Request, response: Response){
        try {
            const { id } = request.params;
            const vacancyData: IVacancy = request.body as IVacancy;    
            
            const updateVacancy = await this._vacancyService.editVacancy(id, vacancyData);
            response.status(200).json({
                message: 'Vacante ha sido actualizada correctamente',
                vacancy: updateVacancy,
            });
        } catch (error: any) {
            response.status(500).json({
                message:  `Error interno del servidor: ${error}`,
                error: error.mesage,
            })
        }
    }


    async editCandidatesByVacancyId(request: Request, response: Response){
        try{
            const { id } = request.params;
            const { name, email } = request.body;
            this._userValidations.validationEmail(email);

            
            if(!request.file){
                return void response.status(400).json({
                    message: 'No se proporciono ningun Document'
                });
            }

            const candidates = {
                name, 
                email,
                cv: request.file.path,
            }
            
    
            const candidateUpdated = await this._vacancyService.editCandidateByVacancyId(id, candidates);
    
            response.status(200).json({
                message: `El candidato se ha actualizado correctamente.`,
                candidateUpdated
            });
        }catch(error: any){
            response.status(500).json({
                message: `El candidato no se ha actualizado ${error}`,
                error: error.message,
            });
        }   
    }   

    async obtainStadistcsByCandidates(request: Request, response: Response){
        try{
            //!TODO: obtener los id (vancate y usario de queryStrinf)
            const{ id, userId } = request.params;

            const result = await this._vacancyService.getStadisticsByCandidates(id, userId);
            response.status(200).json({
                message: 'Se han obtenido las estadisticas de los candidatos correctamente',
                result,
            });
        }catch(ex: any){
            response.status(500).json({
                message: 'Ha ocurrido un error al obtener las estadisticas de los candidatos'
            });
        }
    }

    async deleteVacancy(request: Request, response: Response){
        try {
            const { id } = request.params;
            const message:string|undefined = await this._vacancyService.deleteVacancy(id);
            response.status(200).json({
                message,
            })
        } catch (error: any) {
            response.status(500).json({
                message: `Error interno del servidor: ${error}`,
                error: error.message,
            })
        }
    }

    
}