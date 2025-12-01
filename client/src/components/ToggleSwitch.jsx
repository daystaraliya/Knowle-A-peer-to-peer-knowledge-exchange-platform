import React from "react";

const ToggleSwitch = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-gray-50">
        <span className="text-textPrimary font-medium">{label}</span>
        <div className="relative">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={onChange}
            />
            <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </div>
    </label>
);

export default ToggleSwitch;
