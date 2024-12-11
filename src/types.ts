import { IUser } from './auth/interfaces/register.interface';
import { Request } from 'express';

export interface AuthRequest extends Request{
    user?: IUser;
}