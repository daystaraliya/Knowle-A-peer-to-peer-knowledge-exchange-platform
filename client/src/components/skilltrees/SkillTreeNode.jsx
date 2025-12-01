import React from 'react';

const SkillTreeNode = ({ node, completedNodeIds }) => {
    const isCompleted = completedNodeIds.has(node._id);
    const hasChildren = node.children && node.children.length > 0;

    const nodeStyle = isCompleted
        ? 'bg-green-500 border-green-600 text-white'
        : 'bg-gray-200 border-gray-300 text-textPrimary';
    
    return (
        <div className="relative pl-8">
            {/* The main node body */}
            <div className={`flex items-center p-3 rounded-lg border-2 shadow-sm min-w-[200px] ${nodeStyle}`}>
                 {isCompleted && (
                    <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                )}
                <span className="font-semibold">{node.topic.name}</span>
            </div>

            {/* Render children nodes if they exist */}
            {hasChildren && (
                <div className="mt-4 pl-12 border-l-2 border-gray-300">
                    <div className="space-y-4">
                        {node.children.map(childNode => (
                            <SkillTreeNode 
                                key={childNode._id} 
                                node={childNode} 
                                completedNodeIds={completedNodeIds} 
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillTreeNode;
