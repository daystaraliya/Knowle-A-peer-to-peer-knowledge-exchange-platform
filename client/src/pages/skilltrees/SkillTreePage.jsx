import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getSkillTreeDetails, getUserProgress } from '../../api/skillTreeApi';
import SkillTreeGraph from '../../components/skilltrees/SkillTreeGraph';

const SkillTreePage = () => {
    const { id } = useParams();
    const [tree, setTree] = useState(null);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTreeData = async () => {
            try {
                setLoading(true);
                const [treeDetailsResponse, userProgressResponse] = await Promise.all([
                    getSkillTreeDetails(id),
                    getUserProgress(id)
                ]);
                setTree(treeDetailsResponse.data);
                setProgress(userProgressResponse.data);
            } catch (err) {
                console.error("Failed to fetch skill tree data", err);
                setError("Could not load the skill tree. It might not exist or there was a server error.");
            } finally {
                setLoading(false);
            }
        };

        fetchTreeData();
    }, [id]);

    if (loading) return <p className="text-center">Loading skill tree...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!tree) return <p className="text-center">Skill tree not found.</p>;

    const completedNodeIds = new Set(progress);
    
    return (
        <div>
            <h1 className="text-4xl font-bold text-textPrimary">{tree.name}</h1>
            <p className="text-textSecondary mt-1 mb-8">{tree.description}</p>
            <div className="bg-surface p-4 sm:p-8 rounded-lg shadow-md overflow-x-auto">
                {tree.nodes && tree.nodes.length > 0 ? (
                    <SkillTreeGraph nodes={tree.nodes} completedNodeIds={completedNodeIds} />
                ) : (
                    <p className="text-textSecondary">This skill tree has no topics yet.</p>
                )}
            </div>
        </div>
    );
};

export default SkillTreePage;
