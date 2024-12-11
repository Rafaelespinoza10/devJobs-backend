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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const auth_service_1 = require("../services/auth-service");
class UserController {
    constructor(_userValidations) {
        this._userValidations = _userValidations;
        this._userService = new auth_service_1.UserService();
        this.createUser = this.createUser.bind(this); // Asegúrate de vincular el contexto
        this.login = this.login.bind(this);
        this.obtainUserById = this.obtainUserById.bind(this);
        this.updateUserById = this.updateUserById.bind(this);
        this.profile = this.profile.bind(this);
        this.updatePlanByUser = this.updatePlanByUser.bind(this);
    }
    obtainUserById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const user = yield this._userService.obtainUserById(id);
                const { email, name, _id, image, planType } = user;
                const imageUpdated = image ? image.replace(/\\+g/, '/') : null;
                response.status(200).json({
                    message: 'El usuario se ha obtenido exitosamente',
                    user: { email, name, _id, image: imageUpdated, planType }
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `Error interno del servidor ${error}`,
                    error: error.message
                });
            }
        });
    }
    updateUserById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const { name, email } = request.body;
                this._userValidations.validationEmail(email);
                const updates = { name, email };
                if (!request.file) {
                    return void response.status(400).json({
                        message: 'No se proporciono ninguna Imagen',
                    });
                }
                updates.image = request.file.path;
                const userUpdated = yield this._userService.updateUser(id, updates);
                const { _id, image } = userUpdated;
                const imageUpdated = image ? image.replace(/\\+g/, '/') : null;
                response.status(200).json({
                    message: `El usuario ${id} se ha actualizado correctamente`,
                    userUpdated: { _id, email, name, image: imageUpdated },
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `Error interno en el servidor ${error.messafe}`,
                    error: error.message,
                });
            }
        });
    }
    login(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = request.body;
                this._userValidations.validationEmail(email);
                this._userValidations.validationPassword(password);
                const { user, token } = yield this._userService.login(email, password);
                const { _id, name } = user;
                const userDTO = { _id, name, email, token };
                response.cookie('token', `Bearer ${token}`, {
                    httpOnly: true,
                    secure: process.env.SECRET === 'production',
                    maxAge: 720000,
                    sameSite: 'strict',
                });
                response.status(200).json({
                    message: 'El usuario esta autenticado',
                    user: userDTO,
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `Error interno del servidor ${error.message}`,
                    error: error.stack,
                });
            }
        });
    }
    createUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRequest = request.body;
                const { email, name, password } = userRequest;
                this._userValidations.validationFields(email, password, name);
                this._userValidations.validationEmail(email);
                this._userValidations.validationPassword(password);
                userRequest.planType = 'Gratuito';
                const user = yield this._userService.createNewUser(userRequest);
                response.status(201).json({
                    message: 'El usuario se ha creado exitosamente',
                    user,
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `Error interno en el servidor ${error.message}`,
                    error: error.message,
                });
            }
        });
    }
    profile(request, response) {
        var _a;
        const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        response.json({
            userId,
            messsage: 'Autenticado',
            user: request.user,
        });
    }
    updatePlanByUser(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const { cardNumber, expirationDate, cvv, planType } = request.body;
                // if(!cardNumber || !expirationDate || !cvv || !planType) return;
                // if(planType !== 'Gratuito' ||  planType !== 'Basico' || planType !== 'Standar' || planType !== 'Empresarial' || planType !== 'Profesional' ) return;
                const updates = { cardNumber, expirationDate, cvv, planType };
                const userUpdated = yield this._userService.updateNewPlanByUser(id, updates);
                response.status(200).json({
                    message: 'El plan ha sido actualizado',
                    user: userUpdated
                });
            }
            catch (ex) {
                response.status(500).json({
                    error: `Error interno del servidor ${ex}`,
                    message: ex.message,
                });
            }
        });
    }
}
exports.UserController = UserController;
