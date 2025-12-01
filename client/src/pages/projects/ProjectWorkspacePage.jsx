import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectDetails, createTask, updateTask, deleteTask } from '../../api/projectApi';
import KanbanBoard from '../../components/projects/KanbanBoard';
import CreateTaskModal from '../../components/projects/CreateTaskModal';
import Button from '../../components/Button';

const ProjectWorkspacePage = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchProject = useCallback(async () => {
        try {
            const response = await getProjectDetails(id);
            setProject(response.data);
        } catch (error) {
            console.error("Failed to fetch project details", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const handleCreateTask = async (taskData) => {
        await createTask(id, taskData);
        fetchProject(); // Refetch to show the new task
    };

    const handleUpdateTask = async (taskId, updateData) => {
        await updateTask(taskId, updateData);
        fetchProject(); // Refetch to show updated task
    };

    const handleDeleteTask = async (taskId) => {
        await deleteTask(taskId);
        fetchProject(); // Refetch to remove deleted task
    };

    if (loading) return <p className="text-center">Loading project workspace...</p>;
    if (!project) return <p className="text-center text-red-500">Could not load project.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-textPrimary">{project.title}</h1>
                    <p className="text-textSecondary mt-1">{project.description}</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>+ New Task</Button>
            </div>
            
            <div className="mb-8">
                <h3 className="text-sm font-semibold mb-2">Project Members</h3>
                <div className="flex items-center space-x-2">
                    {project.members.map(member => (
                        <img key={member._id} src={member.avatar || `https://ui-avatars.com/api/?name=${member.fullName}`} alt={member.fullName} title={member.fullName} className="w-10 h-10 rounded-full" />
                    ))}
                </div>
            </div>

            <KanbanBoard tasks={project.tasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateTask}
                members={project.members}
                projectId={project._id}
            />
        </div>
    );
};

export default ProjectWorkspacePage;