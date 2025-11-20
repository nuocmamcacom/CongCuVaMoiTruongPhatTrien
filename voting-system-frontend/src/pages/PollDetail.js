import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollAPI } from '../services/api';
import toast from 'react-hot-toast';
import VotingInterface from '../components/VotingInterface';
import PollResults from '../components/PollResult';
import LoadingSpinner from '../components/LoadingSpinner';

const PollDetails = () => {
    const { pollId } = useParams();
    const navigate = useNavigate();
    const [pollData, setPollData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        console.log('PollDetails pollId:', pollId); // Log pollId
        if (!pollId || isNaN(pollId)) {
            console.error('Invalid pollId:', pollId);
            toast.error('Invalid poll ID');
            setLoading(false);
            navigate('/dashboard');
            return;
        }
        pollAPI.getPollDetails(pollId)
            .then((response) => {
                setPollData(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Poll fetch error:', error);
                toast.error(error.response?.data?.message || 'Failed to load poll');
                setLoading(false);
                navigate('/dashboard');
            });
    }, [pollId, navigate]);

    const handleVote = async (optionIds) => {
        if (!pollData.can_vote) {
            toast.error('Poll is closed or expired');
            return;
        }
        setVoting(true);
        try {
            await pollAPI.castVote({
                poll_id: Number(pollId),
                option_id: pollData.poll.poll_type === 'single' ? optionIds : optionIds.map(id => ({ option_id: id })),
            });
            toast.success('Vote submitted successfully!');
            const response = await pollAPI.getPollDetails(pollId);
            setPollData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit vote');
        } finally {
            setVoting(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!pollData) return <div>Poll not found</div>;

    const { poll, options, user_votes, can_vote } = pollData;
    const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);
    const hasVoted = user_votes.length > 0;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{poll.title}</h1>
            <p className="text-gray-600 mb-4">{poll.description}</p>
            <div className="space-y-6">
                {can_vote && !hasVoted ? (
                    <VotingInterface
                        options={options}
                        pollType={poll.poll_type}
                        onVote={handleVote}
                        voting={voting}
                    />
                ) : (
                    <PollResults
                        options={options}
                        totalVotes={totalVotes}
                        userVotes={user_votes}
                        canVote={can_vote}
                        hasVoted={hasVoted}
                        isAnonymous={poll.is_anonymous}
                    />
                )}
            </div>
        </div>
    );
};

export default PollDetails;