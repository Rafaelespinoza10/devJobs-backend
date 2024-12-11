import { Document } from "mongoose";
import { IRegister } from "../../auth/interfaces/register.interface";

export interface IVacancy extends Document {
    title: string;
    company?: string;
    location: string;
    salary?: string;
    contract?: string;
    description?: string;
    url?: string;
    skills?: string[];
    candidates?: {
      name: string;
      email: string;
      cv: string;
    }[];
    author?: IRegister;
}