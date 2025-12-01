import React, { useState, useEffect, useContext } from 'react';
import Button from '../../components/Button';
import { AuthContext } from '../../context/AuthContext';
import { findMatches } from '../../api/exchangeApi';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { spokenLanguages } from '../../constants/languages';
import AgreementProposalModal from '../../components/exchange/AgreementProposalModal'; // New Import

const FindMatchesPage = () => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestStatus, setRequestStatus] = useState({});
  const [languageFilter, setLanguageFilter] = useState('');
  const { user } = useContext(AuthContext);

  // New state for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    const getMatches = async () => {
      if (!user) {
        setError(t('findMatches.updateProfilePrompt'));
        setLoading(false);
        return;
      }
      if (user.topicsToTeach.length === 0 || user.topicsToLearn.length === 0) {
        setError(t('findMatches.updateProfilePrompt'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await findMatches(languageFilter);
        setMatches(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not fetch matches.");
      } finally {
        setLoading(false);
      }
    };
    getMatches();
  }, [user, languageFilter, t]);

  // Updated handler to open the modal
  const handleRequest = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleProposalSent = (matchId) => {
    // Update the UI to show the request as sent
    setRequestStatus(prev => ({ ...prev, [matchId]: 'sent' }));
  };
  
  // Find the specific topic pair for a given match
  const getTopicPairForMatch = (match) => {
    const topicToLearnId = user.topicsToLearn.find(learnTopic => 
        match.topicsToTeach.some(teachTopic => teachTopic._id === learnTopic._id)
    )?._id;

    const topicToTeachId = user.topicsToTeach.find(teachTopic =>
        match.topicsToLearn.some(learnTopic => learnTopic._id === teachTopic._id)
    )?._id;
    
    return { topicToLearnId, topicToTeachId };
  };

  if (loading) return <p className="text-center">Asking the AI to find perfect matches for you... ✨</p>;

  return (
    <div>
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-textPrimary mb-2">{t('findMatches.title')}</h1>
        <p className="text-textSecondary">{t('findMatches.subtitle')}</p>
      </div>

      <div className="mb-6 max-w-xs mx-auto">
        <label htmlFor="language-filter" className="block text-sm font-medium text-textSecondary mb-1">{t('findMatches.filterByLanguage')}</label>
        <select
          id="language-filter"
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="bg-surface border border-gray-300 text-textPrimary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
        >
          <option value="">{t('findMatches.allLanguages')}</option>
          {spokenLanguages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-center bg-red-100 text-red-700 p-4 rounded-md mb-6">
            <p>{error} <Link to="/profile/edit" className="font-semibold underline">{t('findMatches.updateProfileLink')}</Link></p>
        </div>
       )}
       {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(match => (
                <div key={match._id} className="bg-surface p-6 rounded-lg shadow-md flex flex-col transition-transform hover:scale-105">
                    <div className="flex items-center mb-4">
                        <img src={match.avatar || `https://ui-avatars.com/api/?name=${match.fullName}`} alt={match.fullName} className="w-16 h-16 rounded-full mr-4 border-2 border-primary" />
                        <div>
                            <h3 className="text-xl font-bold">{match.fullName}</h3>
                            <p className="text-sm text-textSecondary">@{match.username}</p>
                        </div>
                    </div>

                    <div className="bg-indigo-50 border-l-4 border-primary text-indigo-800 p-3 rounded-r-lg mb-4">
                        <p className="text-sm font-semibold">{t('findMatches.aiReason')}</p>
                        <p className="text-sm">"{match.matchReason || 'This user is a strong match for your learning goals!'}"</p>
                    </div>

                    <div className="space-y-3 mb-4 flex-grow">
                        <div>
                            <h4 className="font-semibold text-sm text-primary">{t('findMatches.canTeach')}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {match.topicsToTeach.map(t => <span key={t._id} className="bg-indigo-100 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{t.name}</span>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-secondary">{t('findMatches.wantsToLearn')}</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {match.topicsToLearn.map(t => <span key={t._id} className="bg-green-100 text-secondary text-xs font-semibold px-2.5 py-0.5 rounded-full">{t.name}</span>)}
                            </div>
                        </div>
                    </div>
                    <Button 
                        onClick={() => handleRequest(match)} 
                        disabled={requestStatus[match._id] === 'sent'}
                        className="mt-auto w-full"
                    >
                        {requestStatus[match._id] === 'sent' ? 'Proposal Sent!' : 'Propose Agreement'}
                    </Button>
                </div>
            ))}
        </div>
       ) : (
        !loading && !error && (
          <div className="text-center text-textSecondary mt-12">
            <h2 className="text-2xl font-semibold mb-2">{t('findMatches.noMatchesTitle')}</h2>
            <p>{t('findMatches.noMatchesBody')}</p>
            <Link to="/profile/edit" className="mt-4 inline-block">
                <Button>{t('findMatches.updateSkillsBtn')}</Button>
            </Link>
          </div>
        )
       )}
       {isModalOpen && selectedMatch && (
            <AgreementProposalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                matchUser={selectedMatch}
                onProposalSent={handleProposalSent}
                {...getTopicPairForMatch(selectedMatch)}
            />
       )}
    </div>
  );
};

export default FindMatchesPage;