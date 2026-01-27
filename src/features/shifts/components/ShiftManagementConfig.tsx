import React from 'react';
import Calendar from './Calendar';

const ShiftManagementConfig: React.FC = () => {
    return (
        <div className="shift-management-config">
            <h1>シフト管理</h1>
            <Calendar />
        </div>
    );
};

export default ShiftManagementConfig;
