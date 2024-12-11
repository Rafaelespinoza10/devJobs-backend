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
exports.VacancyController = void 0;
const validations_1 = require("./../../auth/helpers/validations");
const vacancy_service_1 = require("../services/vacancy-service");
const vacancy_1 = __importDefault(require("../models/vacancy"));
class VacancyController {
    constructor() {
        this._vacancyService = new vacancy_service_1.VacancyService();
        this._userValidations = new validations_1.Validations();
        this.obtainAllVacancy = this.obtainAllVacancy.bind(this);
        this.getVacancyForId = this.getVacancyForId.bind(this);
        this.getVacancyByUserId = this.getVacancyByUserId.bind(this);
        this.editVacancy = this.editVacancy.bind(this);
        this.createVacancy = this.createVacancy.bind(this);
        this.deleteVacancy = this.deleteVacancy.bind(this);
        this.editCandidatesByVacancyId = this.editCandidatesByVacancyId.bind(this);
        this.getVacanciesByUserIdPlan = this.getVacanciesByUserIdPlan.bind(this);
        this.obtainStadistcsByCandidates = this.obtainStadistcsByCandidates.bind(this);
    }
    obtainAllVacancy(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacancies = yield this._vacancyService.getAllVacancy();
                response.status(201).json({
                    message: 'Las vacantes han sido obtenidas exitosamente',
                    vacancies,
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `Error interno del servidor, ${error}`,
                    error: error.message,
                });
            }
        });
    }
    getVacanciesByUserIdPlan(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const message = yield this._vacancyService.obtainVacanciesForUserPlan(id);
                response.status(200).json({
                    message
                });
            }
            catch (ex) {
                response.status(500).json({
                    message: `Ocurrrio un error interno en el servidor ${ex.message}`,
                    error: ex.message,
                });
            }
        });
    }
    getVacancyByUserId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
                const vacancies = yield this._vacancyService.getVacanciesByUserId(userId);
                response.status(200).json({
                    message: `Se ha encontrado la vacante para el usuario ${userId}`,
                    vacancies,
                });
            }
            catch (error) {
                response.status(500).json({
                    message: 'Error interno del servidor' + error,
                    error: error.message,
                });
            }
        });
    }
    getVacancyForId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const vacancy = yield this._vacancyService.getVacancyById(id);
                response.status(201).json({
                    message: `Se ha encontrado la vancante con id: ${id}`,
                    vacancy
                });
            }
            catch (error) {
                response.status(501).json({
                    message: 'Error interno en el servidor' + error,
                    error: error.message,
                });
            }
        });
    }
    createVacancy(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                // Obtener el id del usuario autorizado
                const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
                const vacancies = yield vacancy_1.default.find({ author: userId });
                const vacancyData = request.body;
                vacancyData.author = userId; // Aquí asignas solo el ObjectId del usuario autorizado    
                if (vacancies.length >= 3 && ((_b = vacancyData.author) === null || _b === void 0 ? void 0 : _b.planType) === 'Gratuito')
                    return;
                if (vacancies.length >= 10 && ((_c = vacancyData.author) === null || _c === void 0 ? void 0 : _c.planType) === 'Basico')
                    return;
                if (vacancies.length >= 30 && ((_d = vacancyData.author) === null || _d === void 0 ? void 0 : _d.planType) === 'Estandar')
                    return;
                if (vacancies.length >= 60 && ((_e = vacancyData.author) === null || _e === void 0 ? void 0 : _e.planType) === 'Empresarial')
                    return;
                if (vacancies.length >= 100 && ((_f = vacancyData.author) === null || _f === void 0 ? void 0 : _f.planType) === 'Profesional')
                    return;
                const vacancy = yield this._vacancyService.createVacancy(vacancyData);
                response.status(201).json({
                    message: 'Vacante creada exitosamente',
                    vacancy,
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `Error interno del servidor: ${error}`,
                    error: error.message,
                });
            }
        });
    }
    editVacancy(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const vacancyData = request.body;
                const updateVacancy = yield this._vacancyService.editVacancy(id, vacancyData);
                response.status(200).json({
                    message: 'Vacante ha sido actualizada correctamente',
                    vacancy: updateVacancy,
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `Error interno del servidor: ${error}`,
                    error: error.mesage,
                });
            }
        });
    }
    editCandidatesByVacancyId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const { name, email } = request.body;
                this._userValidations.validationEmail(email);
                if (!request.file) {
                    return void response.status(400).json({
                        message: 'No se proporciono ningun Document'
                    });
                }
                const candidates = {
                    name,
                    email,
                    cv: request.file.path,
                };
                const candidateUpdated = yield this._vacancyService.editCandidateByVacancyId(id, candidates);
                response.status(200).json({
                    message: `El candidato se ha actualizado correctamente.`,
                    candidateUpdated
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `El candidato no se ha actualizado ${error}`,
                    error: error.message,
                });
            }
        });
    }
    obtainStadistcsByCandidates(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //!TODO: obtener los id (vancate y usario de queryStrinf)
                const { id, userId } = request.params;
                const result = yield this._vacancyService.getStadisticsByCandidates(id, userId);
                response.status(200).json({
                    message: 'Se han obtenido las estadisticas de los candidatos correctamente',
                    result,
                });
            }
            catch (ex) {
                response.status(500).json({
                    message: 'Ha ocurrido un error al obtener las estadisticas de los candidatos'
                });
            }
        });
    }
    deleteVacancy(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = request.params;
                const message = yield this._vacancyService.deleteVacancy(id);
                response.status(200).json({
                    message,
                });
            }
            catch (error) {
                response.status(500).json({
                    message: `Error interno del servidor: ${error}`,
                    error: error.message,
                });
            }
        });
    }
}
exports.VacancyController = VacancyController;
