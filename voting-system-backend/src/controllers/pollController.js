const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const { broadcastPollUpdate } = require('../services/socketService');
const excelService = require('../services/excelService');
const mongoose = require('mongoose');

const createPoll = async (req, res) => {
    try {
        const { title, description, poll_type, is_anonymous, start_time, end_time, options, participants } = req.body;
        const creator_id = req.user.user_id;

        if (!title || !options || options.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Title and at least 2 options are required'
            });
        }

        // Format options with order
        const formattedOptions = options.map((opt, index) => ({
            option_text: typeof opt === 'string' ? opt : opt.option_text,
            option_order: index + 1,
            vote_count: 0
        }));

        // Create new poll
        const newPoll = new Poll({
            title,
            description: description || '',
            creator_id,
            poll_type: poll_type || 'single',
            is_anonymous: is_anonymous || false,
            start_time: start_time || Date.now(),
            end_time: end_time || null,
            options: formattedOptions,
            participants: participants || [],
            is_active: true,
            total_votes: 0
        });

        await newPoll.save();

        res.status(201).json({
            success: true,
            message: 'Poll created successfully',
            poll_id: newPoll._id
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getPolls = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Find polls where user is creator or participant
        const polls = await Poll.find({
            $or: [
                { creator_id: userId },
                { participants: userId }
            ]
        })
        .populate('creator_id', 'full_name username')
        .sort({ created_at: -1 })
        .lean();

        // Format response to match frontend expectations
        const formattedPolls = polls.map(poll => ({
            poll_id: poll._id,
            title: poll.title,
            description: poll.description,
            poll_type: poll.poll_type,
            is_anonymous: poll.is_anonymous,
            is_active: poll.is_active,
            start_time: poll.start_time,
            end_time: poll.end_time,
            created_at: poll.created_at,
            creator_name: poll.creator_id?.full_name || 'Unknown',
            is_creator: poll.creator_id._id.toString() === userId.toString()
        }));

        res.json(formattedPolls);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getPollDetails = async (req, res) => {
    try {
        const { poll_id } = req.params;
        const user_id = req.user.user_id;

        if (!mongoose.Types.ObjectId.isValid(poll_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll ID'
            });
        }

        // Find poll
        const poll = await Poll.findById(poll_id)
            .populate('creator_id', 'full_name username')
            .lean();

        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        // Check access permission
        const hasAccess = poll.creator_id._id.toString() === user_id.toString() ||
                         poll.participants.some(p => p.toString() === user_id.toString());

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get user's votes
        const userVotes = await Vote.find({
            poll_id: poll_id,
            user_id: user_id
        }).select('option_id');

        // Calculate vote percentages
        const totalVotes = poll.total_votes || 0;
        const formattedOptions = poll.options.map(opt => ({
            option_id: opt._id,
            option_text: opt.option_text,
            option_order: opt.option_order,
            vote_count: opt.vote_count || 0,
            percentage: totalVotes > 0 ? ((opt.vote_count || 0) / totalVotes * 100).toFixed(2) : 0
        }));

        // Check if poll is still active and can vote
        const now = new Date();
        const canVote = poll.is_active &&
                       (!poll.end_time || now < new Date(poll.end_time));

        res.json({
            poll: {
                poll_id: poll._id,
                title: poll.title,
                description: poll.description,
                poll_type: poll.poll_type,
                is_anonymous: poll.is_anonymous,
                is_active: poll.is_active,
                start_time: poll.start_time,
                end_time: poll.end_time,
                created_at: poll.created_at,
                creator_name: poll.creator_id.full_name,
                creator_id: poll.creator_id._id
            },
            options: formattedOptions,
            user_votes: userVotes.map(v => v.option_id.toString()),
            can_vote: canVote
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const castVote = async (req, res) => {
    try {
        const { poll_id, option_id } = req.body;
        const user_id = req.user.user_id;
        const ip_address = req.ip;

        // Normalize option_id to array for consistent processing
        const optionIds = Array.isArray(option_id) ? option_id : [option_id];

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(poll_id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid poll ID'
            });
        }

        // Validate all option IDs
        for (const optId of optionIds) {
            if (!mongoose.Types.ObjectId.isValid(optId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid option ID: ' + optId
                });
            }
        }

        // Find poll
        const poll = await Poll.findById(poll_id);
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: 'Poll not found'
            });
        }

        // Check if poll is active
        if (!poll.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Poll is not active'
            });
        }

        // Check if poll has ended
        if (poll.end_time && new Date() > new Date(poll.end_time)) {
            return res.status(400).json({
                success: false,
                message: 'Poll has ended'
            });
        }

        // Check if all options exist in poll
        for (const optId of optionIds) {
            const optionExists = poll.options.some(opt => opt._id.toString() === optId);
            if (!optionExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid option: ' + optId
                });
            }
        }

        // For single choice polls, only allow one option
        if (poll.poll_type === 'single' && optionIds.length > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one option allowed for single choice polls'
            });
        }

        // Check if user already voted
        const existingVotes = await Vote.find({
            poll_id: poll_id,
            user_id: user_id
        });

        if (existingVotes.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already voted in this poll'
            });
        }

        // Create votes for each selected option
        const votes = [];
        for (const optId of optionIds) {
            const newVote = new Vote({
                poll_id,
                user_id,
                option_id: optId,
                ip_address
            });
            votes.push(newVote);
        }

        // Save all votes
        await Vote.insertMany(votes);

        // Update poll option vote counts
        for (const optId of optionIds) {
            const optionIndex = poll.options.findIndex(opt => opt._id.toString() === optId);
            if (optionIndex !== -1) {
                poll.options[optionIndex].vote_count += 1;
                poll.total_votes += 1;
            }
        }
        await poll.save();

        // Get updated results
        const totalVotes = poll.total_votes;
        const results = poll.options.map(opt => ({
            option_id: opt._id,
            option_text: opt.option_text,
            vote_count: opt.vote_count,
            percentage: totalVotes > 0 ? ((opt.vote_count / totalVotes) * 100).toFixed(2) : 0
        }));

        // Broadcast update via socket
        broadcastPollUpdate(poll_id.toString(), results);

        res.json({
            success: true,
            message: 'Vote cast successfully',
            results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const exportPollToExcel = async (req, res) => {
    try {
        const { poll_id } = req.params;
        console.log('Export Excel request:', { poll_id, userId: req.user?.user_id }); // Debug log
        
        // Poll already verified by checkCreator middleware
        const poll = req.poll;
        
        // Generate Excel workbook
        const workbook = await excelService.createPollExcelReport(poll_id);
        
        // Generate buffer
        const buffer = await excelService.generateBuffer(workbook);
        
        // Generate filename
        const filename = excelService.generateFileName(poll.title);
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        
        // Send file
        res.send(buffer);
        
    } catch (error) {
        console.error('Export Excel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export Excel file'
        });
    }
};

module.exports = {
    createPoll,
    getPolls,
    getPollDetails,
    castVote,
    exportPollToExcel
};