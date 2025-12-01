import React, { useState, useEffect, useContext } from 'react';
import { getLeaderboard } from '../../api/leaderboardApi';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [criteria, setCriteria] = useState('points'); // 'points', 'exchanges', 'rating'
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await getLeaderboard(criteria);
                setLeaderboard(response.data);
            } catch (error) {
                console.error(`Failed to fetch ${criteria} leaderboard`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [criteria]);

    const TABS = [
        { key: 'points', label: 'Top Points' },
        { key: 'exchanges', label: 'Most Exchanges' },
        { key: 'rating', label: 'Top Rated' },
    ];

    const getStat = (player) => {
        switch (criteria) {
            case 'points':
                return `${player.points} pts`;
            case 'exchanges':
                return `${player.completedExchanges} exchanges`;
            case 'rating':
                return `${player.averageRating.toFixed(2)} ★`;
            default:
                return '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-textPrimary mb-2">Leaderboard</h1>
            <p className="text-textSecondary mb-6">See how you stack up against the most active members of the Knowle community.</p>

            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setCriteria(tab.key)}
                                className={`${
                                    criteria === tab.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {loading ? (
                <p className="text-center">Loading leaderboard...</p>
            ) : (
                <div className="bg-surface rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {leaderboard.map((player, index) => (
                            <li key={player._id} className={`p-4 flex items-center space-x-4 ${player._id === user?._id ? 'bg-indigo-50' : ''}`}>
                                <span className="text-lg font-bold w-8 text-center text-textSecondary">{index + 1}</span>
                                <Link to={`/users/${player.slug}`} className="flex items-center space-x-4 flex-grow">
                                    <img src={player.avatar || `https://ui-avatars.com/api/?name=${player.fullName}`} alt={player.fullName} className="w-12 h-12 rounded-full"/>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-textPrimary">{player.fullName}</p>
                                        <p className="text-sm text-textSecondary">@{player.username}</p>
                                    </div>
                                </Link>
                                <div className="font-bold text-lg text-primary text-right w-36">
                                    {getStat(player)}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LeaderboardPage;