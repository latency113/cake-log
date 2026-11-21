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

interface StudentRowInfo {
  name: string;
  classroomName: string;
  gradeLevelText: string;
  departmentName: string;
}

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");

const formatGradeLevel = (gl?: { level: string; year: number } | null) =>
  gl ? `${gl.level === "VOCATIONAL" ? "ปวช" : "ปวส"} ${gl.year}` : "-";

const getStudentRows = (team: TeamWithRelations): StudentRowInfo[] => {
  const members = team.student_member_name ?? [];
  const classrooms = [...(team.classrooms ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name, "th", { numeric: true })
  );

  if (members.length === 0) {
    return [
      {
        name: "-",
        classroomName: classrooms.map((c) => c.name).join(", ") || "-",
        gradeLevelText:
          (team.gradeLevels ?? []).map((gl) => formatGradeLevel(gl)).join(", ") || "-",
        departmentName:
          (team.departments ?? []).map((d) => d.name).join(", ") || "-",
      },
    ];
  }

  const gradeLevelById = new Map(
    (team.gradeLevels ?? []).map((gl) => [gl.id, gl])
  );
  const departmentById = new Map(
    (team.departments ?? []).map((dept) => [dept.id, dept])
  );

  const studentRoomMap = new Map<
    string,
    { classroomName: string; gradeLevelText: string; departmentName: string }
  >();

  for (const cls of classrooms) {
    const gradeLevel = cls.grade_level ?? gradeLevelById.get(cls.grade_level_id);
    const department = cls.department ?? departmentById.get(cls.department_id);
    const gradeLevelText = formatGradeLevel(gradeLevel);
    const departmentName = department?.name ?? "-";
    for (const student of cls.students ?? []) {
      if (student?.studentName) {
        studentRoomMap.set(normalizeName(student.studentName), {
          classroomName: cls.name,
          gradeLevelText,
          departmentName,
        });
      }
    }
  }

  const fallbackClassroom =
    classrooms.length === 1
      ? {
          classroomName: classrooms[0].name,
          gradeLevelText: formatGradeLevel(
            classrooms[0].grade_level ?? gradeLevelById.get(classrooms[0].grade_level_id)
          ),
          departmentName:
            (classrooms[0].department ?? departmentById.get(classrooms[0].department_id))
              ?.name ?? "-",
        }
      : {
          classroomName: "-",
          gradeLevelText:
            (team.gradeLevels ?? []).map((gl) => formatGradeLevel(gl)).join(", ") || "-",
          departmentName:
            (team.departments ?? []).map((d) => d.name).join(", ") || "-",
        };

  return members
    .map((rawName) => {
      const matched = studentRoomMap.get(normalizeName(rawName));
      return {
        name: rawName,
        ...(matched ?? fallbackClassroom),
      };
    })
    .sort((a, b) => {
      if (a.classroomName === "-" && b.classroomName !== "-") return 1;
      if (a.classroomName !== "-" && b.classroomName === "-") return -1;
      const roomCmp = a.classroomName.localeCompare(b.classroomName, "th", {
        numeric: true,
      });
      if (roomCmp !== 0) return roomCmp;
      return a.name.localeCompare(b.name, "th");
    });
};

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
      <div className="mb-8 team-leaderboard-section">
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
              {teamList.map((team, index) => {
                const studentRows = getStudentRows(team);
                const rowSpan = studentRows.length;

                return studentRows.map((student, sIdx) => (
                  <TableRow key={`${team.id}-${sIdx}`}>
                    {sIdx === 0 && (
                      <>
                        <TableCell rowSpan={rowSpan} className="align-middle">
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
                        <TableCell rowSpan={rowSpan} className="align-middle leaderboard-col-team">
                          {team.name}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="student-member-cell">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.classroomName}</TableCell>
                    <TableCell>{student.gradeLevelText}</TableCell>
                    <TableCell className="leaderboard-col-dept">
                      {student.departmentName}
                    </TableCell>
                    {sIdx === 0 && (
                      <>
                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {team.total_sales_pounds?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {team.total_sales_baht?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {team.total_sales_pounds?.toLocaleString() || "0"}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ));
              })}
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
