import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollAPI } from '../services/api';
import toast from 'react-hot-toast';
import VotingInterface from "../components/poll/VotingInterface.jsx";
import PollResults from "../components/poll/PollResult.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const PollDetails = () => {
    const { pollId } = useParams();
    const navigate = useNavigate();
    const [pollData, setPollData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);

    useEffect(() => {
        if (!pollId || typeof pollId !== 'string') {
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
                poll_id: pollId,
                option_id: pollData.poll.poll_type === 'single' ? optionIds : optionIds,
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
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)', letterSpacing: '-0.02em' }}>
                    {poll.title}
                </h1>
                {poll.description && (
                    <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                        {poll.description}
                    </p>
                )}
            </div>
            <div>
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