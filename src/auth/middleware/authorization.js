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
exports.authorized = authorized;
const passport_1 = __importDefault(require("passport"));
const auth_1 = __importDefault(require("../models/auth"));
function authorized(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        passport_1.default.authenticate('jwt', { session: false }, (error, token) => __awaiter(this, void 0, void 0, function* () {
            if (error || !token) {
                return response.status(401).json({ message: 'Unauthorized' });
            }
            try {
                const user = yield auth_1.default.findById(token.id).select('-password'); // Excluye la contraseña
                if (!user) {
                    return response.status(404).json({ message: 'User not found' });
                }
                request.user = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                };
                return next();
            }
            catch (err) {
                console.log(err);
                return next(err);
            }
        }))(request, response, next);
    });
}
