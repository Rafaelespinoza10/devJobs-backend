import { Document } from "mongoose";

export interface IRegister extends Document {
    email?: string;
    name?: string;
    password?: string;
    token?: string;
    expiration?: Date;
    image?: String;
    planType: String;
    cardInfo?: {
        cardNumber?: string; 
        expirationDate?: string; 
        cvv?: string; 
    };
    comparatePassword(password: string): Promise<boolean>; 
}


export interface IUser {
    id: any;
    name?: string;
    email?: string;
  }
  