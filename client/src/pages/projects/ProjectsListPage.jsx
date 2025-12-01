import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProjects } from '../../api/projectApi';
import Button from '../../components/Button';

const ProjectsListPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getUserProjects();
                setProjects(response.data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) return <p className="text-center">Loading your projects...</p>;

    return (
        <div>
            <h1 className="text-4xl font-bold text-textPrimary mb-6">My Projects</h1>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project._id} className="bg-surface p-6 rounded-lg shadow-md flex flex-col">
                            <h2 className="text-xl font-bold text-primary mb-2">{project.title}</h2>
                            <p className="text-textSecondary mb-4 flex-grow">{project.description || 'No description provided.'}</p>
                            <div className="mb-4">
                                <h3 className="text-sm font-semibold mb-2">Members</h3>
                                <div className="flex items-center space-x-2">
                                    {project.members.map(member => (
                                        <img key={member._id} src={member.avatar || `https://ui-avatars.com/api/?name=${member.fullName}`} alt={member.fullName} title={member.fullName} className="w-8 h-8 rounded-full" />
                                    ))}
                                </div>
                            </div>
                            <Link to={`/projects/${project._id}`}>
                                <Button className="w-full">Open Workspace</Button>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-textSecondary mt-12">
                    <h2 className="text-2xl font-semibold mb-2">No Projects Yet</h2>
                    <p>Complete a knowledge exchange to start a collaborative project with your partner.</p>
                     <Link to="/exchange/find" className="mt-4 inline-block">
                        <Button>Find a Partner</Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ProjectsListPage;