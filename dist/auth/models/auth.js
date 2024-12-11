"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
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
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        // Si el password ya está hasheado, continuar
        if (!user.isModified('password')) {
            return next();
        }
        try {
            // Hashear contraseña
            const hash = yield bcrypt_1.default.hash(user.password, 12);
            user.password = hash;
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.cardInfo) {
            if (user.cardInfo.cardNumber) {
                user.cardInfo.cardNumber = `**** **** **** ${user.cardInfo.cardNumber.slice(-4)}`;
            }
            if (user.cardInfo.cvv) {
                user.cardInfo.cvv = '***';
            }
        }
        next();
    });
});
// Middleware post-save para manejar errores de MongoDB (duplicados, etc.)
userSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        // Error de duplicidad de índice único
        next(new Error('El correo electrónico ya está registrado.'));
    }
    else {
        next(error);
    }
});
userSchema.methods.comparatePassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        try {
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            return isMatch;
        }
        catch (error) {
            throw new Error('Error al comparar contrasenas');
        }
    });
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
