// src/components/layout/SidebarInfo.tsx
import React from 'react';

import { departments } from '../../data/department-data';

const SidebarInfo: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">
        ข้อแนะนำและบริการ
      </h2>

      <div>
        <h3 className="font-bold text-foreground mb-2">แผนกทั้งหมด</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          {departments.map((dept, index) => (
            <li key={index}>{dept}</li>
          ))}
        </ul>
        <h3 className="font-bold text-foreground my-2">หลักการพิมพ์ชื่อ - นามสกุล</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
          <li>ให้เว้นวรรคระหว่างชื่อและนามสกุลเช่น ( นายกอบโกย ขายดี )</li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarInfo;