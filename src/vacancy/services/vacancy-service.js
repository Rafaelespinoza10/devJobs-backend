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
exports.VacancyService = void 0;
const auth_1 = __importDefault(require("../../auth/models/auth"));
const obtainStadistics_1 = require("../helpers/obtainStadistics");
const vacancy_1 = __importDefault(require("../models/vacancy"));
class VacancyService {
    createVacancy(vacancyData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //encontramos el alor de 
                const newVacancy = new vacancy_1.default(vacancyData);
                yield newVacancy.save();
                return newVacancy;
            }
            catch (error) {
                throw new Error(' Error al crear la vacante' + error);
            }
        });
    }
    getAllVacancy() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacancies = yield vacancy_1.default.aggregate([
                    {
                        $lookup: {
                            from: "users",
                            localField: "author", // Campo que referencia al autor en `Vacancy`
                            foreignField: "_id", // Campo `_id` en la colección `users`
                            as: "authorDetails", // Alias para los detalles del autor
                        },
                    },
                    {
                        $unwind: "$authorDetails",
                    },
                    {
                        $addFields: {
                            planOrder: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$authorDetails.planType", "Profesional"] }, then: 1 },
                                        { case: { $eq: ["$authorDetails.planType", "Empresarial"] }, then: 2 },
                                    ],
                                    default: 3, // Otros planes
                                },
                            },
                        },
                    },
                    {
                        $sort: { planOrder: 1 }, // Ordena primero por `planOrder`
                    },
                    {
                        $project: {
                            authorDetails: 0, // Opcional: elimina los detalles del autor del resultado
                            planOrder: 0, // Opcional: elimina el campo temporal `planOrder`
                        },
                    },
                ]);
                return vacancies;
            }
            catch (error) {
                throw new Error("Error al encontrar las vacantes: " + error.message);
            }
        });
    }
    getVacancyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacancy = yield vacancy_1.default.findById(id);
                if (!vacancy) {
                    throw new Error('No existe la vacante');
                }
                return vacancy;
            }
            catch (error) {
                throw new Error('Error al obtener la vacante' + error);
            }
        });
    }
    getVacanciesByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacancies = yield vacancy_1.default.find({ author: id });
                if (!vacancies) {
                    throw new Error('No exite la vacante');
                }
                return vacancies;
            }
            catch (error) {
                throw new Error('Error al obtener la vacante' + error);
            }
        });
    }
    editCandidateByVacancyId(id, candidate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Actualiza el documento usando $push para agregar al arreglo de candidatos
                const candidateUpdated = yield vacancy_1.default.findByIdAndUpdate(id, { $push: { candidates: candidate } }, // Usa $push para agregar al arreglo
                { new: true, runValidators: true } // Retorna el documento actualizado
                );
                if (!candidateUpdated) {
                    throw new Error('No se ha encontrado la vacante o no se pudo actualizar el candidato.');
                }
                return candidateUpdated;
            }
            catch (error) {
                throw new Error(`Error al editar el candidato: ${error.message}`);
            }
        });
    }
    editVacancy(id, vacancyData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updateVacancy = yield vacancy_1.default.findByIdAndUpdate(id, vacancyData, { new: true, runValidators: true });
                if (!updateVacancy) {
                    throw new Error('No se ha podido actualizar la vacante');
                }
                return updateVacancy;
            }
            catch (error) {
                throw new Error('error al editar la vacante' + error);
            }
        });
    }
    deleteVacancy(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield vacancy_1.default.deleteOne({ _id: id });
                if (result.deletedCount === 0) {
                    throw new Error('No se encontró la vacante para eliminar');
                }
                return 'La vacancte ha sido eliminada';
            }
            catch (error) {
                throw new Error('error al eliminar la vacante' + error);
            }
        });
    }
    // esto solo es para el plan profesional
    getStadisticsByCandidates(id, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vacancy = yield vacancy_1.default.findById(id);
                const user = yield auth_1.default.findOne({ _id: userId }).lean();
                if (!user || user.planType !== 'Profesional') {
                    return; // Retorna si el usuario no es profesional
                }
                if (!vacancy) {
                    throw new Error('Vacante no encontrada');
                }
                const candidates = vacancy.candidates || []; // Garantiza que candidates sea un array
                if (candidates.length === 0) {
                    return []; // Retorna un array vacío si no hay candidatos
                }
                const responses = yield Promise.all(candidates.map(candidate => {
                    if (!candidate.cv) {
                        throw new Error(`El candidato ${candidate.name} no tiene un CV válido`);
                    }
                    return (0, obtainStadistics_1.sendCvsToPython)(candidate.cv);
                }));
                // Retorna las respuestas al cliente
                return responses;
            }
            catch (ex) {
                console.error('Ocurrió un error al obtener las estadísticas:', ex.message);
                throw new Error('Ocurrió un error al obtener las estadísticas: ' + ex.message);
            }
        });
    }
    obtainVacanciesForUserPlan(id) {
        return __awaiter(this, void 0, void 0, function* () {
            //obtain the vacancies for user
            try {
                const user = yield auth_1.default.findOne({ _id: id }).lean();
                const message = 'Has excedido el numero de vacantes por plan';
                const vacancies = yield vacancy_1.default.find({ author: id });
                if (!vacancies) {
                    throw new Error('No exite la vacante');
                }
                if (vacancies.length >= 3 && (user === null || user === void 0 ? void 0 : user.planType) === 'Gratuito') {
                    return 'Las vacantes de pruebas se han terminado, suscribete a un plan';
                }
                else if (vacancies.length >= 10 && (user === null || user === void 0 ? void 0 : user.planType) === 'Basico') {
                    return message + ' ' + `${user === null || user === void 0 ? void 0 : user.planType}`;
                }
                else if (vacancies.length >= 30 && (user === null || user === void 0 ? void 0 : user.planType) === 'Estandar') {
                    return message + ' ' + `${user === null || user === void 0 ? void 0 : user.planType}`;
                }
                else if (vacancies.length >= 60 && (user === null || user === void 0 ? void 0 : user.planType) === 'Empresarial') {
                    return message + ' ' + `${user === null || user === void 0 ? void 0 : user.planType}`;
                }
                else if (vacancies.length >= 100 && (user === null || user === void 0 ? void 0 : user.planType) === 'Profesional') {
                    return message + ' ' + `${user === null || user === void 0 ? void 0 : user.planType}`;
                }
                return 'Aun puedes publicar tus vacantes';
            }
            catch (ex) {
                throw new Error('Ocurrio un error ' + ex.message);
            }
        });
    }
}
exports.VacancyService = VacancyService;
