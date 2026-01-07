const express = require('express');
const {
    createForm,
    getForms,
    getFormDetails,
    submitFormResponse,
    getFormResponses,
    exportFormToExcel
} = require('../controllers/formController');
const { auth } = require('../middleware/auth');
const { validateCreateForm, validateSubmitResponse } = require('../middleware/formValidation');

const router = express.Router();

// Public routes
router.get('/:form_id', getFormDetails);
router.post('/:form_id/submit', validateSubmitResponse, submitFormResponse);

// Protected routes (require authentication)
router.post('/', auth, validateCreateForm, createForm);
router.get('/', auth, getForms);
router.get('/:form_id/responses', auth, getFormResponses);
router.get('/:form_id/export', auth, exportFormToExcel);

module.exports = router;