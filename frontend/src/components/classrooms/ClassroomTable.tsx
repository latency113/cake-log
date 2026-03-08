import React, { useEffect, useState } from "react";
import type { Classroom } from "../../types/classroom";
import { getTeachers } from "../../utils/api/teachers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Home } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface ClassroomStats {
  totalPounds: number;
  presentStudents: number;
}

interface ClassroomTableProps {
  classrooms: Classroom[];
  statsData: Map<string, ClassroomStats>;
  grandTotalPounds: number;
  loadingStats: boolean;
  onEdit: (classroom: Classroom) => void;
  onDelete: (classroom: Classroom) => void;
  isPrinting?: boolean;
  itemsPerPageForPrint?: number;
  printTitle?: string;
  printFooter?: string;
  displayMode?: "report" | "management";
  reporterName?: string;
}

const ClassroomTable: React.FC<ClassroomTableProps> = ({
  classrooms,
  statsData,
  grandTotalPounds,
  loadingStats,
  onEdit,
  onDelete,
  isPrinting = false, // Destructure with default value
  itemsPerPageForPrint = 20, // Destructure with default value
  printTitle,
  printFooter,
  displayMode = "report", // Default to 'report' mode
  reporterName,
}) => {
  const [teachersMap, setTeachersMap] = useState<Map<string, string>>(new Map());
  const navigate = useNavigate();

  // Define table headers for 'report' mode
  const reportTableHeaders = (
    <TableRow>
      <TableHead>สาขา</TableHead>
      <TableHead>ระดับชั้น</TableHead>
      <TableHead>ห้อง</TableHead>
      <TableHead>ครูที่ปรึกษา</TableHead>
      <TableHead className="text-center">จำนวนนักเรียนสั่งจองเค้ก</TableHead>
      <TableHead className="text-center">จำนวนนักเรียนทั้งหมด</TableHead>
      <TableHead className="text-center">ร้อยละของนักเรียนที่สั่งจอง</TableHead>
      <TableHead className="text-center">ยอดสั่งจอง (ปอนด์)</TableHead>
      <TableHead className="text-center">คิดเป็นร้อยละของจำนวนเค้กที่สั่งจองทั้งหมด</TableHead>
      <TableHead className="text-right print:hidden">การดำเนินการ</TableHead>
    </TableRow>
  );

  // Define table headers for 'management' mode
  const managementTableHeaders = (
    <TableRow>
      <TableHead>แผนก</TableHead>
      <TableHead>ระดับชั้น</TableHead>
      <TableHead>ห้อง</TableHead>
      <TableHead>ครูที่ปรึกษา</TableHead>
      <TableHead className="text-center">จำนวนนักเรียนทั้งหมด</TableHead>
      <TableHead className="text-right print:hidden">การดำเนินการ</TableHead>
    </TableRow>
  );

  // Conditionally select headers based on displayMode
  const currentTableHeaders =
    displayMode === "management" ? managementTableHeaders : reportTableHeaders;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const teachersData = await getTeachers();
        const newTeachersMap = new Map<string, string>();
        teachersData.forEach((teacher) =>
          newTeachersMap.set(teacher.id, teacher.name)
        );
        setTeachersMap(newTeachersMap);
      } catch (error) {
        console.error("Error fetching dropdown data for ClassroomTable:", error);
      }
    };

    fetchTeachers();
  }, []);

  if (classrooms.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg p-12 text-center">
        <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          ไม่พบห้องเรียน
        </h3>
        <p className="text-gray-600">
          ไม่มีห้องเรียนในแผนกนี้ กดปุ่ม "เพิ่มห้องเรียนใหม่" เพื่อสร้างห้องเรียน
        </p>
      </div>
    );
  }

  const handleClassroomClick = (classroomId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role="menu"]')) {
      return;
    }
    const navPath = `/dashboard/classrooms/${classroomId}/students`;
    navigate({ to: navPath });
  };

  // If printing, split classrooms into chunks and render each chunk as its own table
  if (isPrinting && itemsPerPageForPrint) {
    const chunks: Classroom[][] = [];
    for (let i = 0; i < classrooms.length; i += itemsPerPageForPrint) {
      chunks.push(classrooms.slice(i, i + itemsPerPageForPrint));
    }

    return (
      <>
        {chunks.map((chunk, chunkIndex) => (
          <div
            key={chunkIndex}
            className={`rounded-sm border shadow-md print-table-wrapper ${chunkIndex < chunks.length - 1 ? 'print-page-break' : ''}`}
          >
            {typeof printTitle === 'string' && (
              <div className="print-table-title">{printTitle}</div>
            )}
            <Table>
              <TableHeader>{currentTableHeaders}</TableHeader>
              <TableBody>
                {chunk.map((classroom) => {
                  const totalStudents = classroom.students?.length || 0;
                  const classroomStats = statsData.get(classroom.id);
                  const presentStudents = classroomStats ? classroomStats.presentStudents : 0;
                  const totalPounds = classroomStats ? classroomStats.totalPounds : 0;

                  const avgPoundsPerStudent =
                    presentStudents > 0
                      ? ((presentStudents / totalStudents) * 100).toFixed()
                      : "0.00";

                  const percentageOfTotalPounds =
                    grandTotalPounds > 0
                      ? ((totalPounds / grandTotalPounds) * 100).toFixed(2)
                      : "0.00";

                  const commonActionCell = (
                    <TableCell className="text-right print:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => onEdit(classroom)}>แก้ไข</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(classroom)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  );

                  return (
                    <TableRow
                      key={classroom.id}
                      className={`font-medium text-foreground cursor-pointer`}
                      onClick={(e) => handleClassroomClick(classroom.id, e)}
                    >
                      <TableCell>{classroom.department?.name || "ไม่ระบุแผนก"}</TableCell>
                      <TableCell>
                        {classroom.grade_level
                          ? `${
                              classroom.grade_level.level === "VOCATIONAL"
                                ? "ปวช."
                                : classroom.grade_level.level === "HIGHER"
                                ? "ปวส."
                                : classroom.grade_level.level
                            } ${classroom.grade_level.year}`
                          : "ไม่ระบุระดับชั้น"}
                      </TableCell>
                      <TableCell>{classroom.name}</TableCell>
                      <TableCell>{teachersMap.get(classroom.teacher_id) || "ไม่ระบุครู"}</TableCell>
                      {displayMode === "report" ? (
                        <>
                          <TableCell className="text-center">
                            {loadingStats ? '...' : presentStudents}
                          </TableCell>
                          <TableCell className="text-center">{totalStudents}</TableCell>
                          <TableCell className="text-center">
                            {loadingStats ? '...' : avgPoundsPerStudent}%
                          </TableCell>
                          <TableCell className="text-center">
                            {loadingStats ? '...' : totalPounds}
                          </TableCell>
                          <TableCell className="text-center">
                            {loadingStats ? '...' : `${percentageOfTotalPounds}%`}
                          </TableCell>
                        </>
                      ) : (
                        <TableCell className="text-center">
                          {loadingStats ? '...' : presentStudents}
                        </TableCell>
                      )}
                      {commonActionCell}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {printFooter && (
              <div className="print-table-footer">
                <div style={{ textAlign: 'center' }}>
                  <p>ลงชื่อ..................................................</p>
                  <p>({reporterName || "นางนุจสรา โพธิ์เงิน"})</p>
                  <p>ผู้รายงาน</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="rounded-sm border shadow-md">
      <Table>
        <TableHeader>
          {currentTableHeaders}
        </TableHeader>
        <TableBody>
          {classrooms.map((classroom) => {
            const totalStudents = classroom.students?.length || 0;
            const classroomStats = statsData.get(classroom.id);
            const presentStudents = classroomStats ? classroomStats.presentStudents : 0;
            const totalPounds = classroomStats ? classroomStats.totalPounds : 0;

            const avgPoundsPerStudent =
              presentStudents > 0
                ? ((presentStudents / totalStudents) * 100).toFixed()
                : "0.00";

            const percentageOfTotalPounds =
              grandTotalPounds > 0
                ? ((totalPounds / grandTotalPounds) * 100).toFixed(2)
                : "0.00";

            const commonActionCell = (
              <TableCell className="text-right print:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => onEdit(classroom)}>แก้ไข</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(classroom)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      ลบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            );

            return (
              <React.Fragment key={classroom.id}>
                <TableRow
                  className={`font-medium text-foreground cursor-pointer`}
                  onClick={(e) => handleClassroomClick(classroom.id, e)}
                >
                  <TableCell>{classroom.department?.name || "ไม่ระบุแผนก"}</TableCell>
                  <TableCell>
                    {classroom.grade_level
                      ? `${
                          classroom.grade_level.level === "VOCATIONAL"
                            ? "ปวช."
                            : classroom.grade_level.level === "HIGHER"
                            ? "ปวส."
                            : classroom.grade_level.level
                        } ${classroom.grade_level.year}`
                      : "ไม่ระบุระดับชั้น"}
                  </TableCell>
                  <TableCell>{classroom.name}</TableCell>
                  <TableCell>{teachersMap.get(classroom.teacher_id) || "ไม่ระบุครู"}</TableCell>
                  {displayMode === "report" ? (
                    <>
                      <TableCell className="text-center">
                        {loadingStats ? '...' : presentStudents}
                      </TableCell>
                      <TableCell className="text-center">{totalStudents}</TableCell>
                      <TableCell className="text-center">
                        {loadingStats ? '...' : avgPoundsPerStudent}%
                      </TableCell>
                      <TableCell className="text-center">
                        {loadingStats ? '...' : totalPounds}
                      </TableCell>
                      <TableCell className="text-center">
                        {loadingStats ? '...' : `${percentageOfTotalPounds}%`}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-center">
                      {loadingStats ? '...' : totalStudents}
                    </TableCell>
                  )}
                  {commonActionCell}
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClassroomTable;