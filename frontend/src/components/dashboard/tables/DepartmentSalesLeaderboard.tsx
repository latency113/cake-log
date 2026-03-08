import React from "react";
import { Building2 } from "lucide-react";

interface DepartmentSalesLeaderboardProps {
  departmentPounds: { id: string; name: string; totalPounds: number; }[];
}

const DepartmentSalesLeaderboard: React.FC<DepartmentSalesLeaderboardProps> = ({
  departmentPounds,
}) => {
  const totalPoundsSum = departmentPounds.reduce((sum, department) => sum + department.totalPounds, 0);

  const colors = [
    "bg-blue-500",
    "bg-orange-400",
    "bg-gray-400",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-green-500",
    "bg-blue-600",
    "bg-amber-700",
    "bg-indigo-600",
    "bg-yellow-700",
    "bg-sky-400",
    "bg-blue-700",
    "bg-teal-400",
    "bg-orange-500",
  ];

  return (
    <>
      <h2 className="text-xl font-semibold mb-6 text-foreground flex items-center">
        <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
        จำนวนปอนด์รวมแต่ละแผนก
      </h2>
      {departmentPounds.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                {departmentPounds.map((department) => (
                  <th key={department.id} className="text-center text-sm text-gray-700 bg-gray-50 truncate">
                    {department.name}
                  </th>
                ))}
                <th className="text-center text-sm text-gray-700 bg-gray-50">
                  รวม
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {departmentPounds.map((department, index) => (
                  <td key={department.id} className="px-4 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 ${colors[index % colors.length]} text-white font-bold text-md shadow-sm`}>
                        {department.totalPounds.toLocaleString()}
                      </div>
                    </div>
                  </td>
                ))}
                <td className="px-4 py-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-20 bg-gray-700 text-white font-bold text-md shadow-sm">
                      {totalPoundsSum.toLocaleString()}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">ไม่มีข้อมูลจำนวนปอนด์แผนก</p>
        </div>
      )}
    </>
  );
};

export default DepartmentSalesLeaderboard;