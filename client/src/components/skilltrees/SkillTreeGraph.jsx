import React from 'react';
import SkillTreeNode from './SkillTreeNode';

const SkillTreeGraph = ({ nodes, completedNodeIds }) => {
    // This component renders the root nodes of the tree.
    // The SkillTreeNode component will handle rendering its own children recursively.
    return (
        <div className="flex flex-col items-start space-y-8">
            {nodes.map(node => (
                <SkillTreeNode 
                    key={node._id} 
                    node={node} 
                    completedNodeIds={completedNodeIds} 
                />
            ))}
        </div>
    );
};

export default SkillTreeGraph;
