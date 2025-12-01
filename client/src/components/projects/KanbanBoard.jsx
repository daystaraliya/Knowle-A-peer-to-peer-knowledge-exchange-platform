import React from 'react';
import TaskCard from './TaskCard';

const KanbanColumn = ({ title, tasks, status, onUpdateTask, onDeleteTask }) => {
    return (
        <div className="bg-gray-100 rounded-lg p-4 w-full md:w-1/3">
            <h3 className="font-bold text-lg text-textPrimary mb-4">{title} ({tasks.length})</h3>
            <div className="space-y-4">
                {tasks.map(task => (
                    <TaskCard 
                        key={task._id} 
                        task={task} 
                        currentStatus={status}
                        onUpdateTask={onUpdateTask}
                        onDeleteTask={onDeleteTask}
                    />
                ))}
            </div>
        </div>
    );
};

const KanbanBoard = ({ tasks, onUpdateTask, onDeleteTask }) => {
    const todoTasks = tasks.filter(t => t.status === 'To Do');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const doneTasks = tasks.filter(t => t.status === 'Done');

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <KanbanColumn title="To Do" tasks={todoTasks} status="To Do" onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask}/>
            <KanbanColumn title="In Progress" tasks={inProgressTasks} status="In Progress" onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask}/>
            <KanbanColumn title="Done" tasks={doneTasks} status="Done" onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask}/>
        </div>
    );
};

export default KanbanBoard;