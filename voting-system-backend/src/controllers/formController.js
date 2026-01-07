const FormTemplate = require('../models/FormTemplate');
const FormResponse = require('../models/FormResponse');
const { broadcastFormUpdate } = require('../services/socketService');
const ExcelJS = require('exceljs');
const { v4: uuidv4 } = require('uuid');

// Create new form
const createForm = async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        const creator_id = req.user.user_id;

        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Title and at least one question are required'
            });
        }

        // Add unique IDs and validate questions
        const processedQuestions = questions.map((question, index) => ({
            ...question,
            question_id: question.question_id || uuidv4(),
            order_index: index + 1
        }));

        const newForm = new FormTemplate({
            title,
            description: description || '',
            creator_id,
            questions: processedQuestions
        });

        await newForm.save();

        res.status(201).json({
            success: true,
            message: 'Form created successfully',
            form_id: newForm._id
        });

    } catch (error) {
        console.error('Create form error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get all forms for user
const getForms = async (req, res) => {
    try {
        const forms = await FormTemplate.find({ is_active: true })
            .populate('creator_id', 'full_name username')
            .sort({ created_at: -1 });

        res.json({
            success: true,
            forms
        });
    } catch (error) {
        console.error('Get forms error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get form details
const getFormDetails = async (req, res) => {
    try {
        const { form_id } = req.params;

        const form = await FormTemplate.findById(form_id)
            .populate('creator_id', 'full_name username');

        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }

        res.json({
            success: true,
            form
        });
    } catch (error) {
        console.error('Get form details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Submit form response
const submitFormResponse = async (req, res) => {
    try {
        const { form_id } = req.params;
        const { answers } = req.body;

        // Get form to validate
        const form = await FormTemplate.findById(form_id);
        if (!form || !form.is_active) {
            return res.status(404).json({
                success: false,
                message: 'Form not found or inactive'
            });
        }

        // Validate required questions
        const requiredQuestions = form.questions.filter(q => q.is_required);
        for (const requiredQ of requiredQuestions) {
            const answer = answers.find(a => a.question_id === requiredQ.question_id);
            if (!answer || !answer.answer_text && !answer.selected_options?.length && !answer.rating_value) {
                return res.status(400).json({
                    success: false,
                    message: `Question "${requiredQ.question_text}" is required`
                });
            }
        }

        // Create response
        const newResponse = new FormResponse({
            form_id,
            answers,
            submitter_ip: req.ip,
            submitter_user_agent: req.get('User-Agent')
        });

        await newResponse.save();

        // Update submission count
        await FormTemplate.findByIdAndUpdate(form_id, {
            $inc: { submission_count: 1 }
        });

        // Broadcast update
        broadcastFormUpdate(form_id, form.submission_count + 1);

        res.json({
            success: true,
            message: 'Response submitted successfully'
        });

    } catch (error) {
        console.error('Submit response error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Get form responses (for creator only)
const getFormResponses = async (req, res) => {
    try {
        const { form_id } = req.params;
        
        // Check if user is form creator
        const form = await FormTemplate.findById(form_id);
        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }

        if (form.creator_id.toString() !== req.user.user_id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only form creator can view responses.'
            });
        }

        const responses = await FormResponse.find({ form_id })
            .sort({ submitted_at: -1 });

        res.json({
            success: true,
            responses,
            form
        });

    } catch (error) {
        console.error('Get responses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Export form responses to Excel
const exportFormToExcel = async (req, res) => {
    try {
        const { form_id } = req.params;
        
        // Check if user is form creator
        const form = await FormTemplate.findById(form_id);
        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'Form not found'
            });
        }

        if (form.creator_id.toString() !== req.user.user_id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only form creator can export responses.'
            });
        }

        const responses = await FormResponse.find({ form_id })
            .sort({ submitted_at: 1 });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Opinion Form System';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Form Responses');

        // Create headers
        const headers = ['Submission Time'];
        form.questions.forEach(question => {
            headers.push(question.question_text);
        });

        worksheet.addRow(headers);

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.font.color = { argb: 'FFFFFFFF' };

        // Add data rows
        responses.forEach(response => {
            const row = [response.submitted_at.toLocaleString()];
            
            form.questions.forEach(question => {
                const answer = response.answers.find(a => a.question_id === question.question_id);
                let cellValue = '';
                
                if (answer) {
                    switch (answer.question_type) {
                        case 'short_text':
                        case 'paragraph':
                            cellValue = answer.answer_text || '';
                            break;
                        case 'multiple_choice':
                            cellValue = answer.selected_options?.join(', ') || '';
                            break;
                        case 'checkbox':
                            cellValue = answer.selected_options?.join(', ') || '';
                            break;
                        case 'rating':
                            cellValue = answer.rating_value || '';
                            break;
                    }
                }
                
                row.push(cellValue);
            });
            
            worksheet.addRow(row);
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = 20;
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        
        // Generate filename
        const filename = `${form.title.replace(/[^a-zA-Z0-9]/g, '_')}_responses_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        
        // Send file
        res.send(buffer);

    } catch (error) {
        console.error('Export form Excel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export Excel file'
        });
    }
};

module.exports = {
    createForm,
    getForms,
    getFormDetails,
    submitFormResponse,
    getFormResponses,
    exportFormToExcel
};