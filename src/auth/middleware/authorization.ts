import { IUser } from './../interfaces/register.interface';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import User from '../models/auth';
import { AuthRequest } from '../../types';


export async function authorized(request: Request, response: Response, next: NextFunction) {
  passport.authenticate('jwt', { session: false }, async (error: any, token: any) => {
    if (error || !token) {
      return response.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = await User.findById((token as any).id).select('-password'); // Excluye la contraseña
        if (!user) {
         return response.status(404).json({ message: 'User not found' });
      }
      
      (request as AuthRequest).user = {
        id: user._id,
        name: user.name,
        email: user.email,
      } as IUser;
      
      
     return next();
    } catch (err) {
        console.log(err);
      return next(err); 
    }
  })(request, response, next);
}