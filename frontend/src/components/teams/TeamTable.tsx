import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { TeamWithRelations } from "@/types/team";

interface TeamTableProps {
  teams: TeamWithRelations[];
  onEditTeam: (team: TeamWithRelations) => void;
  onDeleteTeam: (team: TeamWithRelations) => void;
  loading?: boolean;
}

const TeamTable: React.FC<TeamTableProps> = ({
  teams,
  onEditTeam,
  onDeleteTeam,
  loading,
}) => {
  const handleEdit = (team: TeamWithRelations) => {
    onEditTeam(team);
  };

  const handleDelete = (team: TeamWithRelations) => {
    onDeleteTeam(team);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อทีม</TableHead>
              <TableHead>ประเภททีม</TableHead>
              <TableHead>ชื่อนักเรียน</TableHead>
              <TableHead>ห้อง</TableHead>
              <TableHead>ระดับชั้น</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>ยอดขาย (ปอนด์)</TableHead>
              <TableHead>ยอดขาย (บาท)</TableHead>
              <TableHead className="text-right">การดำเนินการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  กำลังโหลดข้อมูล...
                </TableCell>
              </TableRow>
            ) : teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  ไม่พบทีม
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        team.team_type === "team"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {team.team_type === "team" ? "ทีม" : "บุคคล"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {(team.student_member_name ?? []).length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {(team.student_member_name as string[]).map(
                          (name, index) => (
                            <li key={index}>{name}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell>
                    {(team.classrooms ?? []).length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {(team.classrooms ?? []).map((cls) => (
                          <li key={cls.id}>{cls.name}</li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {(team.gradeLevels ?? []).length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {(team.gradeLevels ?? []).map((gl) => (
                          <li key={gl.id}>
                            {`${gl.level === "VOCATIONAL" ? "ปวช" : "ปวส"} ${
                              gl.year
                            }`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {(team.departments ?? []).length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {(team.departments ?? []).map((dept) => (
                          <li key={dept.id}>{dept.name}</li>
                        ))}
                      </ul>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell>
                    {team.total_sales_pounds?.toLocaleString() || "0"}
                  </TableCell>
                  <TableCell>
                    {team.total_sales_baht?.toLocaleString() || "0"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(team)}
                      className="mr-2 hover:bg-purple-50 text-purple-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(team)}
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamTable;