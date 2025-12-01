import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { getTeacherAnalytics } from '../../api/userApi';
import { useTranslation } from 'react-i18next';
import Button from '../../components/Button';
import { Link } from 'react-router-dom';


const TeacherDashboardPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await getTeacherAnalytics();
                setAnalytics(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load analytics.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="text-center">Loading analytics...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!analytics || analytics.totalSessionsTaught === 0) {
        return (
            <div className="text-center text-textSecondary mt-12">
                <h2 className="text-2xl font-semibold mb-2">{t('teacherDashboard.noDataTitle')}</h2>
                <p>{t('teacherDashboard.noDataBody')}</p>
                <Link to="/exchange/find" className="mt-4 inline-block">
                    <Button>Find a Match</Button>
                </Link>
          </div>
        )
    }

    return (
        <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-2">{t('teacherDashboard.title')}</h1>
            <p className="text-textSecondary mb-8">{t('teacherDashboard.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard title={t('teacherDashboard.totalSessions')} value={analytics.totalSessionsTaught} />
                <DashboardCard title={t('teacherDashboard.avgRating')} value={`${analytics.averageRating.toFixed(2)} ★`} />
                <DashboardCard title={t('teacherDashboard.uniqueStudents')} value={analytics.uniqueStudents} />
            </div>

            <div className="mt-10 bg-surface p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-textPrimary mb-4">{t('teacherDashboard.popularTopics')}</h2>
                {analytics.popularTopics.length > 0 ? (
                    <ul className="space-y-3">
                        {analytics.popularTopics.map((item, index) => (
                            <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <span className="font-semibold text-primary">{item.topic}</span>
                                <span className="font-bold text-textSecondary">{item.count} {t('teacherDashboard.sessions')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-textSecondary">You haven't taught any topics yet.</p>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboardPage;
