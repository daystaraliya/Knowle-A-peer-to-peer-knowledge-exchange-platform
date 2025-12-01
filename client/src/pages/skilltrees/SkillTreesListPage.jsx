import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSkillTrees } from '../../api/skillTreeApi';
import Button from '../../components/Button';

const SkillTreesListPage = () => {
    const [skillTrees, setSkillTrees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkillTrees = async () => {
            try {
                const response = await getSkillTrees();
                setSkillTrees(response.data);
            } catch (error) {
                console.error("Failed to fetch skill trees", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSkillTrees();
    }, []);

    if (loading) return <p className="text-center">Loading skill trees...</p>;

    return (
        <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-6">Skill Trees</h1>
            <p className="text-textSecondary mb-8 max-w-2xl">
                Skill trees are visual learning paths that guide you from beginner to advanced topics. Complete exchanges to master skills and watch your tree grow!
            </p>
            {skillTrees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skillTrees.map(tree => (
                        <div key={tree._id} className="bg-surface p-6 rounded-lg shadow-md flex flex-col border-t-4 border-primary">
                            <h2 className="text-xl font-bold text-primary mb-2">{tree.name}</h2>
                            <p className="text-textSecondary mb-4 flex-grow">{tree.description}</p>
                            <Link to={`/skill-trees/${tree._id}`}>
                                <Button className="w-full">View Path</Button>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-textSecondary mt-12">
                    <h2 className="text-2xl font-semibold mb-2">No Skill Trees Available Yet</h2>
                    <p>Check back soon for new learning paths!</p>
                </div>
            )}
        </div>
    );
};

export default SkillTreesListPage;
