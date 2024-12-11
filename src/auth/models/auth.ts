import bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';
import { IRegister } from '../interfaces/register.interface';

const userSchema = new Schema<IRegister>({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: [true, 'El correo electrónico es obligatorio'],
    },
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        trim: true,
    },
    token: {
        type: String,
        default: null,
    },
    expiration: {
        type: Date,
        default: null,
    },
    image: String, 
    planType: {
        type: String, 
        enum: ['Gratuito', 'Basico', 'Estandar', 'Empresarial', 'Profesional'],
        default: 'Gratuito'
    },
    cardInfo: {
        cardNumber: {
            type: String,
            trim: true,
            required: false, // Opcional para simulación
        },
        expirationDate: {
            type: String,
            trim: true,
            required: false, // Opcional para simulación
        },
        cvv: {
            type: String,
            trim: true,
            required: false, // Opcional para simulación
        },
    },
});

// Middleware pre-save para hashear contraseñas
userSchema.pre('save', async function (next) {
    const user = this as IRegister;

    // Si el password ya está hasheado, continuar
    if (!user.isModified('password')) {
        return next();
    }

    try {
        // Hashear contraseña
        const hash = await bcrypt.hash(user.password!, 12);
        user.password = hash;
        next();
    } catch (error) {
        next(error as Error);
    }
});

userSchema.pre('save', async function(next: any){
    const user = this as IRegister;

    if(user.cardInfo){
        if(user.cardInfo.cardNumber){
            user.cardInfo.cardNumber =`**** **** **** ${user.cardInfo.cardNumber.slice(-4)}`;
        }
        if(user.cardInfo.cvv){
            user.cardInfo.cvv = '***';
        }
    }

    next();
});

// Middleware post-save para manejar errores de MongoDB (duplicados, etc.)
userSchema.post('save', function(error: any, doc: any, next: any) {
    if (error.name === 'MongoError' && error.code === 11000) {
        // Error de duplicidad de índice único
        next(new Error('El correo electrónico ya está registrado.'));
    } else {
        next(error);
    }
});

userSchema.methods.comparatePassword  = async function(password:string): Promise<boolean>{
    const user = this as IRegister;
    try{
        const isMatch = await bcrypt.compare(password, user.password!);
        return isMatch;
    }catch(error){
        throw new Error('Error al comparar contrasenas');
    }
}

const User = mongoose.model<IRegister>('User', userSchema);
export default User;
