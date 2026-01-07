const express = require('express');
const formController = require('../controllers/formController');
const { auth } = require('../middleware/auth');
const { validateCreateForm, validateSubmitResponse } = require('../middleware/formValidation');

const router = express.Router();

// Public routes
router.get('/:form_id', formController.getFormDetails);
router.post('/:form_id/submit', validateSubmitResponse, formController.submitFormResponse);

// Protected routes (require authentication)
router.post('/', auth, validateCreateForm, formController.createForm);
router.get('/', auth, formController.getForms);
router.get('/:form_id/responses', auth, formController.getFormResponses);
router.get('/:form_id/export', auth, formController.exportFormToExcel);

module.exports = router;
