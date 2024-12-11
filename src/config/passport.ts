import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptionsWithRequest} from 'passport-jwt';
import User from '../auth/models/auth';
import dotenv from 'dotenv';

dotenv.config();


const opts ={
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET!,
}

passport.use(new JwtStrategy(opts, async(payload, done) =>{
    try{
        const user = await User.findById(payload.id);
        if(user){
            return done(null, user);
        }else{
            return done(null, false);
        }
    }catch(error:any){
        return done(error, false);
    }

}));

export default passport;

