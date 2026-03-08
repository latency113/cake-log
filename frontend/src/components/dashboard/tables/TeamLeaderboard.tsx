import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeamWithRelations } from "@/types/team";
import { Trophy } from "lucide-react";
import clsx from "clsx";

interface TeamLeaderboardProps {
  teams: TeamWithRelations[];
}

const TeamLeaderboard: React.FC<TeamLeaderboardProps> = ({ teams }) => {
  const teamTypeTeams = teams.filter((t) => t.team_type === "team");
  const individualTypeTeams = teams.filter((t) => t.team_type !== "team");

  teamTypeTeams.sort(
    (a, b) => (b.total_sales_pounds || 0) - (a.total_sales_pounds || 0)
  );
  individualTypeTeams.sort(
    (a, b) => (b.total_sales_pounds || 0) - (a.total_sales_pounds || 0)
  );

  const renderTable = (teamList: TeamWithRelations[], title: string) => {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>อันดับ</TableHead>
                <TableHead>ชื่อทีม/บุคคล</TableHead>
                <TableHead>ชื่อนักเรียน</TableHead>
                <TableHead>ห้อง</TableHead>
                <TableHead>ระดับชั้น</TableHead>
                <TableHead>แผนก</TableHead>
                <TableHead>ยอดขาย (ปอนด์)</TableHead>
                <TableHead>ยอดขาย (บาท)</TableHead>
                <TableHead>ยอดจำหน่ายรวม (ปอนด์)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamList.map((team, index) => (
                <TableRow key={team.id}>
                  <TableCell>
                    {index < 3 ? (
                      <Trophy
                        className={clsx(
                          "inline-block w-5 h-5 mr-1 align-middle transition-transform duration-300",
                          index === 0 && "text-yellow-400 animate-bounce",
                          index === 1 && "text-gray-400 animate-pulse",
                          index === 2 && "text-amber-600 animate-bounce-slow"
                        )}
                      />
                    ) : null}
                    <span>ที่ {index + 1}</span>
                  </TableCell>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>
                    {(team.student_member_name ?? []).length > 0
                      ? (team.student_member_name ?? []).map((name, index) => (
                          <React.Fragment key={index}>
                            {name}
                            {index <
                              (team.student_member_name ?? []).length - 1 && (
                              <br />
                            )}
                          </React.Fragment>
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {(team.classrooms ?? []).length > 0
                      ? (team.classrooms ?? []).map((cls, index) => (
                          <React.Fragment key={cls.id}>
                            {cls.name}
                            {index < (team.classrooms ?? []).length - 1 && <br />}
                          </React.Fragment>
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {(team.gradeLevels ?? []).length > 0
                      ? (team.gradeLevels ?? []).map((gl, index) => (
                          <React.Fragment key={gl.id}>
                            {`${gl.level === "VOCATIONAL" ? "ปวช" : "ปวส"} ${
                              gl.year
                            }`}
                            {index < (team.gradeLevels ?? []).length - 1 && (
                              <br />
                            )}
                          </React.Fragment>
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {(team.departments ?? []).length > 0
                      ? (team.departments ?? []).map((dept, index) => (
                          <React.Fragment key={dept.id}>
                            {dept.name}
                            {index < (team.departments ?? []).length - 1 && (
                              <br />
                            )}
                          </React.Fragment>
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>{team.total_sales_pounds?.toLocaleString() || "0"}</TableCell>
                  <TableCell>{team.total_sales_baht?.toLocaleString() || "0"}</TableCell>
                  <TableCell>{team.total_sales_pounds?.toLocaleString() || "0"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  return (
    <div>
      {renderTable(teamTypeTeams, "ประเภท: ทีม")}
      {renderTable(individualTypeTeams, "ประเภท: บุคคล")}
    </div>
  );
};

export default TeamLeaderboard;
