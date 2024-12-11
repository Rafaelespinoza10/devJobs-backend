import { IRegister } from "../interfaces/register.interface";
import { NextFunction  } from "express";
import User from "../models/auth";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from "process";
import { UserController } from "../controller/auth-controller";

export class UserService{

    async createNewUser(user: IRegister):Promise<any>{
        try {
            const newUser = new User(user);
            //guardamos el modelo en la base de datos
            await newUser.save();
            return newUser;
        } catch (error) {
            throw new Error('Error al crear al usuario' + error);
        }
    }



    async obtainUserById(id: string):Promise<any>{
        try{
            const user = await User.findOne({ _id: id }).lean();
            if(!user){
                throw new Error('El usuario no existe');
            }
            return user;
        }catch(error){
            throw new Error('Error al encontrar el usuario' + error);
        }
    }

    async updateUser(id:string, updates:{ name:string , email:string, image?: string} ): Promise<any>{
        try{
            const updateUser = await User.findByIdAndUpdate(
                id, 
                {$set: updates},
                { new: true, runValidators: true}
            ).lean();

            if(!updateUser){
                throw new Error('Usuario no encontrado');
            }

            const { email, name, image} = updateUser;

            return { email, name, image };
        }catch(error: any){
            throw new Error('Error al editar el usuario' + error.message);
        }
    }

    async updateNewPlanByUser(id: string, updates: {cardNumber: string, expirationDate: string, cvv: string, planType: string}):Promise<any>{
        
        try{
            const updateFields = {
                cardInfo: {
                    cardNumber: updates.cardNumber,
                    expirationDate: updates.expirationDate,
                    cvv: updates.cvv,
                },
                planType: updates.planType,
            };

        const updateUserPlan = await User.findByIdAndUpdate(
            id, 
             {$set: updateFields},
            { new: true, runValidators: true},
        ).lean();
        if(!updateUserPlan){ 
            throw new Error('Usuario no encontrado');
        }

        const { planType, name, image, email} = updateUserPlan;
        return { planType, name, image, email};
        }catch(ex: any){
            throw new Error('Error al actualizar al usuario' + ex.message);        
        }
    }

    async login(email:string, password:string):Promise<any>{
        try{
            const user = await User.findOne({email});
            if(!user){
                throw new Error('El usuario no existe');
            }
            const isMatch = await bcrypt.compare(password, user.password!);
            if(!isMatch){
                throw new Error('Contrasena incorrecta');
            }
            const payload = { id: user._id };
            const token = jwt.sign(payload, process.env.SECRET!, {expiresIn: '1h'});

            user.token = token;
            return { user, token };
        }catch(error: any){
            throw new Error('Error al authenticar: ' + error.message);
        }
    }
}