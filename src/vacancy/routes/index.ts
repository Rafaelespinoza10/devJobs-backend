import express from 'express';
import { VacancyController } from '../controller/vacancy-controller';
import { authorized } from '../../auth/middleware/authorization';
import { uploadDocument } from '../../auth/middleware/multer';
const newVacancyController = new VacancyController;

const router = express.Router();

router.get('/obtain-vacancy/:id', newVacancyController.getVacancyForId);
router.get('/all', newVacancyController.obtainAllVacancy);
router.post('/create-vacancy', authorized,  newVacancyController.createVacancy);
router.put('/edit-vacancy/:id', authorized, newVacancyController.editVacancy);
router.put('/edit-candidates-by-vacancyId/:id', uploadDocument.single('cv'), newVacancyController.editCandidatesByVacancyId);
router.delete('/delete-vacancy/:id', authorized,  newVacancyController.deleteVacancy);
router.get('/obtain-vacancy-by-userId/:id', authorized, newVacancyController.getVacancyByUserId );
router.post('/obtain-vacancies-by-planUser/:id', authorized, newVacancyController.getVacanciesByUserIdPlan);
router.post('/obtain-stadistics-candidates/:id/:userId', authorized, newVacancyController.obtainStadistcsByCandidates);
export default router;
