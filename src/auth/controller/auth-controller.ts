import { Request, Response } from 'express';
import { UserService } from '../services/auth-service';
import { IRegister } from '../interfaces/register.interface';
import { UserDTO } from '../interfaces/send-data-client.interface';
import { Validations } from '../helpers/validations';
import { AuthRequest } from '../../types';


export class UserController {
    private  _userService: UserService;

    constructor(
        private _userValidations:Validations,  //inyeccion  de dependencias
    ) {
    
        this._userService = new UserService();
        this.createUser = this.createUser.bind(this); // Asegúrate de vincular el contexto
        this.login = this.login.bind(this);
        this.obtainUserById = this.obtainUserById.bind(this);
        this.updateUserById = this.updateUserById.bind(this);
        this.profile = this.profile.bind(this);
        this.updatePlanByUser = this.updatePlanByUser.bind(this);
    }


    async obtainUserById(request:Request, response:Response){
        try{
            const { id } = request.params;
            const user = await this._userService.obtainUserById(id);
            const { email, name, _id, image, planType } = user;
            const imageUpdated = image ? image.replace(/\\+g/,'/') : null;


            response.status(200).json({
                message: 'El usuario se ha obtenido exitosamente',
                user: { email, name, _id, image: imageUpdated, planType  }
            });
        }catch(error:any){
            response.status(500).json({
                message: `Error interno del servidor ${error}`,
                error: error.message
            })
        }
    }


    async updateUserById(request: Request, response: Response){
        try{
            const {  id  } = request.params;
            const { name, email} = request.body;
            this._userValidations.validationEmail(email!);
            
            const updates:any = { name, email};
            
            if(!request.file){
                return void response.status(400).json({
                    message: 'No se proporciono ninguna Imagen',
                });
            }
            updates.image = request.file!.path;
            const userUpdated = await this._userService.updateUser(id, updates);
            const { _id, image } = userUpdated;
            const imageUpdated = image ? image.replace(/\\+g/,'/') : null;

            response.status(200).json({
                message: `El usuario ${id} se ha actualizado correctamente`,
                userUpdated : { _id, email, name, image: imageUpdated},
            });

        }catch(error: any){
            response.status(500).json({
                message: `Error interno en el servidor ${error.messafe}`,
                error: error.message,
            })
        }
    }

    async login(request:Request, response: Response){
        try{
            const { email, password } = request.body;
            this._userValidations.validationEmail(email!);
            this._userValidations.validationPassword(password!);
            const {user, token } = await this._userService.login(email, password);
            const { _id, name } = user;

            const userDTO = {  _id, name, email, token };
             response.cookie('token', `Bearer ${token}`, {
                httpOnly: true,
                secure: process.env.SECRET! ===  'production',
                maxAge: 720000,
                sameSite: 'strict',
            });
            
            response.status(200).json({
                message: 'El usuario esta autenticado',
                user: userDTO,
            });

        }catch(error: any){
            response.status(500).json({
                message: `Error interno del servidor ${error.message}`,
                error: error.stack,
            })
        }
    }

    async createUser(request: Request, response: Response) {
        try {
            const userRequest = request.body as IRegister;
            const { email, name, password } = userRequest;

            this._userValidations.validationFields(email!,password!, name!);
            this._userValidations.validationEmail(email!);
            this._userValidations.validationPassword(password!);
            userRequest.planType = 'Gratuito';       
            const user = await this._userService.createNewUser(userRequest);
            response.status(201).json({
                message: 'El usuario se ha creado exitosamente',
                user,
            });
        } catch (error: any) {
            response.status(500).json({
                message: `Error interno en el servidor ${error.message}`,
                error: error.message,
            });
        }
    }

    profile(request:Request, response:Response){

        const userId = (request as AuthRequest).user?.id;
        response.json({
            userId,
            messsage: 'Autenticado',
            user: request.user,
            
        });
    }


   async updatePlanByUser(request:Request, response: Response){

        try{
            const { id } = request.params;
            const { cardNumber, expirationDate, cvv, planType } = request.body;
            // if(!cardNumber || !expirationDate || !cvv || !planType) return;
            // if(planType !== 'Gratuito' ||  planType !== 'Basico' || planType !== 'Standar' || planType !== 'Empresarial' || planType !== 'Profesional' ) return;

            const updates = {cardNumber, expirationDate, cvv, planType};
            const userUpdated = await this._userService.updateNewPlanByUser(id, updates);
            response.status(200).json({
                message: 'El plan ha sido actualizado',
                user: userUpdated
            });
        }catch(ex: any){
            response.status(500).json({
                error: `Error interno del servidor ${ex}`,
                message: ex.message,
            })
        }

    }

}
