"use strict";
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
exports.UserService = void 0;
const auth_1 = __importDefault(require("../models/auth"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserService {
    createNewUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = new auth_1.default(user);
                //guardamos el modelo en la base de datos
                yield newUser.save();
                return newUser;
            }
            catch (error) {
                throw new Error('Error al crear al usuario' + error);
            }
        });
    }
    obtainUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield auth_1.default.findOne({ _id: id }).lean();
                if (!user) {
                    throw new Error('El usuario no existe');
                }
                return user;
            }
            catch (error) {
                throw new Error('Error al encontrar el usuario' + error);
            }
        });
    }
    updateUser(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateUser = yield auth_1.default.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).lean();
                if (!updateUser) {
                    throw new Error('Usuario no encontrado');
                }
                const { email, name, image } = updateUser;
                return { email, name, image };
            }
            catch (error) {
                throw new Error('Error al editar el usuario' + error.message);
            }
        });
    }
    updateNewPlanByUser(id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateFields = {
                    cardInfo: {
                        cardNumber: updates.cardNumber,
                        expirationDate: updates.expirationDate,
                        cvv: updates.cvv,
                    },
                    planType: updates.planType,
                };
                const updateUserPlan = yield auth_1.default.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true }).lean();
                if (!updateUserPlan) {
                    throw new Error('Usuario no encontrado');
                }
                const { planType, name, image, email } = updateUserPlan;
                return { planType, name, image, email };
            }
            catch (ex) {
                throw new Error('Error al actualizar al usuario' + ex.message);
            }
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield auth_1.default.findOne({ email });
                if (!user) {
                    throw new Error('El usuario no existe');
                }
                const isMatch = yield bcrypt_1.default.compare(password, user.password);
                if (!isMatch) {
                    throw new Error('Contrasena incorrecta');
                }
                const payload = { id: user._id };
                const token = jsonwebtoken_1.default.sign(payload, process.env.SECRET, { expiresIn: '1h' });
                user.token = token;
                return { user, token };
            }
            catch (error) {
                throw new Error('Error al authenticar: ' + error.message);
            }
        });
    }
}
exports.UserService = UserService;
