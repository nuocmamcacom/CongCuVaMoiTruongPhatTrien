const ExcelJS = require('exceljs');
const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const User = require('../models/User');

/**
 * Excel Export Service
 * Tested with 1000+ rows - performance OK
 */
class ExcelService {
    async createPollExcelReport(pollId) {
        try {
            // Fetch poll data with all related information
            const poll = await Poll.findById(pollId).populate('creator_id', 'full_name username email');
            if (!poll) {
                throw new Error('Poll not found');
            }

            // Fetch all votes for this poll
            const votes = await Vote.find({ poll_id: pollId }).populate('user_id', 'full_name username email');

            // Create workbook
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Voting System';
            workbook.created = new Date();

            // Create sheets
            await this.createPollInfoSheet(workbook, poll);
            await this.createResultsSheet(workbook, poll, votes);
            
            if (!poll.is_anonymous && votes.length > 0) {
                await this.createVotersSheet(workbook, poll, votes);
            }

            return workbook;
        } catch (error) {
            throw new Error(`Failed to create Excel report: ${error.message}`);
        }
    }

    async createPollInfoSheet(workbook, poll) {
        const worksheet = workbook.addWorksheet('Thông tin Poll');
        
        // Set column widths
        worksheet.columns = [
            { header: 'Thuộc tính', key: 'property', width: 25 },
            { header: 'Giá trị', key: 'value', width: 50 }
        ];

        // Header styling
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        worksheet.getRow(1).font.color = { argb: 'FFFFFFFF' };

        // Add poll information
        const pollInfo = [
            ['Tiêu đề', poll.title],
            ['Mô tả', poll.description || 'Không có mô tả'],
            ['Loại bình chọn', poll.poll_type === 'single' ? 'Chọn một đáp án' : 'Chọn nhiều đáp án'],
            ['Ẩn danh', poll.is_anonymous ? 'Có' : 'Không'],
            ['Người tạo', poll.creator_id?.full_name || 'N/A'],
            ['Email người tạo', poll.creator_id?.email || 'N/A'],
            ['Ngày tạo', poll.created_at?.toLocaleDateString('vi-VN')],
            ['Thời gian bắt đầu', poll.start_time?.toLocaleDateString('vi-VN')],
            ['Thời gian kết thúc', poll.end_time?.toLocaleDateString('vi-VN') || 'Không giới hạn'],
            ['Trạng thái', poll.is_active ? 'Đang hoạt động' : 'Đã đóng'],
            ['Tổng số lượt bình chọn', poll.total_votes || 0],
            ['Số lượng tùy chọn', poll.options?.length || 0]
        ];

        pollInfo.forEach((row, index) => {
            const rowNumber = index + 2;
            worksheet.getRow(rowNumber).values = row;
            
            // Alternate row colors
            if (index % 2 === 0) {
                worksheet.getRow(rowNumber).fill = { 
                    type: 'pattern', 
                    pattern: 'solid', 
                    fgColor: { argb: 'FFF2F2F2' } 
                };
            }
        });

        // Add borders
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
    }

    async createResultsSheet(workbook, poll, votes) {
        const worksheet = workbook.addWorksheet('Kết quả bình chọn');

        // Set columns
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 8 },
            { header: 'Tùy chọn', key: 'option', width: 40 },
            { header: 'Số lượt bình chọn', key: 'votes', width: 20 },
            { header: 'Tỷ lệ (%)', key: 'percentage', width: 15 }
        ];

        // Header styling
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        worksheet.getRow(1).font.color = { argb: 'FFFFFFFF' };

        // Calculate results
        const totalVotes = poll.total_votes || 0;
        
        poll.options.forEach((option, index) => {
            const voteCount = option.vote_count || 0;
            const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(2) : 0;
            
            const rowNumber = index + 2;
            worksheet.getRow(rowNumber).values = [
                index + 1,
                option.option_text,
                voteCount,
                `${percentage}%`
            ];

            // Alternate row colors
            if (index % 2 === 0) {
                worksheet.getRow(rowNumber).fill = { 
                    type: 'pattern', 
                    pattern: 'solid', 
                    fgColor: { argb: 'FFF2F2F2' } 
                };
            }
        });

        // Add summary row
        const summaryRowNumber = poll.options.length + 3;
        worksheet.getRow(summaryRowNumber).values = ['', 'TỔNG CỘNG', totalVotes, '100%'];
        worksheet.getRow(summaryRowNumber).font = { bold: true };
        worksheet.getRow(summaryRowNumber).fill = { 
            type: 'pattern', 
            pattern: 'solid', 
            fgColor: { argb: 'FFBFBFBF' } 
        };

        // Add borders
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Center align numbers
        worksheet.getColumn('stt').alignment = { horizontal: 'center' };
        worksheet.getColumn('votes').alignment = { horizontal: 'center' };
        worksheet.getColumn('percentage').alignment = { horizontal: 'center' };
    }

    async createVotersSheet(workbook, poll, votes) {
        const worksheet = workbook.addWorksheet('Danh sách người bình chọn');

        // Set columns
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 8 },
            { header: 'Họ tên', key: 'fullName', width: 25 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Lựa chọn', key: 'choice', width: 40 },
            { header: 'Thời gian bình chọn', key: 'voteTime', width: 20 }
        ];

        // Header styling
        worksheet.getRow(1).font = { bold: true, size: 12 };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6600' } };
        worksheet.getRow(1).font.color = { argb: 'FFFFFFFF' };

        // Group votes by user for better presentation
        const userVotes = {};
        votes.forEach(vote => {
            const userId = vote.user_id._id.toString();
            if (!userVotes[userId]) {
                userVotes[userId] = {
                    user: vote.user_id,
                    choices: [],
                    voteTime: vote.created_at
                };
            }
            
            // Find option text
            const option = poll.options.find(opt => opt._id.toString() === vote.option_id.toString());
            if (option) {
                userVotes[userId].choices.push(option.option_text);
            }
        });

        // Add voter data
        let rowIndex = 0;
        Object.values(userVotes).forEach((userVote, index) => {
            const rowNumber = index + 2;
            worksheet.getRow(rowNumber).values = [
                index + 1,
                userVote.user?.full_name || 'N/A',
                userVote.user?.username || 'N/A',
                userVote.user?.email || 'N/A',
                userVote.choices.join(', '),
                userVote.voteTime?.toLocaleString('vi-VN') || 'N/A'
            ];

            // Alternate row colors
            if (index % 2 === 0) {
                worksheet.getRow(rowNumber).fill = { 
                    type: 'pattern', 
                    pattern: 'solid', 
                    fgColor: { argb: 'FFF2F2F2' } 
                };
            }
            rowIndex++;
        });

        // Add summary
        const summaryRowNumber = rowIndex + 3;
        worksheet.getRow(summaryRowNumber).values = ['', `Tổng số người bình chọn: ${Object.keys(userVotes).length}`, '', '', '', ''];
        worksheet.getRow(summaryRowNumber).font = { bold: true };

        // Add borders
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Center align STT column
        worksheet.getColumn('stt').alignment = { horizontal: 'center' };
    }

    async generateBuffer(workbook) {
        return await workbook.xlsx.writeBuffer();
    }

    generateFileName(pollTitle) {
        // Clean poll title for filename
        const cleanTitle = pollTitle
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .toLowerCase()
            .substring(0, 50); // Limit length

        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return `poll-${cleanTitle}-${timestamp}.xlsx`;
    }
}

module.exports = new ExcelService();