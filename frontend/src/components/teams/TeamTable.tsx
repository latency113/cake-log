import React, { useState, useEffect } from "react";
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
import { showToastSuccess, showToastError } from "@/utils/alerts";
import {
  getTeams,
  deleteTeam,
  updateTeam,
  createTeam,
} from "@/utils/api/teams";
import type {
  TeamWithRelations,
  CreateTeamDto,
  UpdateTeamDto,
} from "@/types/team"; // Use TeamWithRelations
import TeamFormModal from "./TeamFormModal";
import TeamDeleteConfirmModal from "./TeamDeleteConfirmModal";
import { getDepartments } from "@/utils/api/departments";
import { getClassrooms } from "@/utils/api/classrooms";
import type { Department, Classroom } from "@/types";
import { Input } from "@/components/ui/input";
interface TeamTableProps {
  onEditTeam: (team: TeamWithRelations) => void;
  onDeleteTeam: (team: TeamWithRelations) => void;
  refetchTrigger: boolean;
}

const TeamTable: React.FC<TeamTableProps> = ({
  onEditTeam,
  onDeleteTeam,
  refetchTrigger,
}) => {
  const [teams, setTeams] = useState<TeamWithRelations[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<TeamWithRelations | undefined>(
    undefined
  );
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTeams = async (page: number, search?: string) => {
    setError(null);
    try {
      const response = await getTeams(page, itemsPerPage, search);
      setTeams(response.data);
    } catch (err) {
      setError("Failed to load teams.");
      showToastError({ title: "Error", text: "Failed to load teams." });
    }
  };

  const fetchInitialData = async () => {
    try {
      const [classroomsResponse, departmentsResponse] = await Promise.all([
        getClassrooms(1, 9999),
        getDepartments(1, 9999),
      ]);
      setAllClassrooms(classroomsResponse.data);
      setAllDepartments(departmentsResponse.data);
      await fetchTeams(currentPage, searchQuery);
    } catch (err: any) {
      console.error("Failed to fetch initial data:", err);
      setError("Failed to load initial data.");
      showToastError({ title: "Error", text: "Failed to load initial data." });
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [currentPage, searchQuery, refetchTrigger]); // Add refetchTrigger here

  const handleEdit = (team: TeamWithRelations) => {
    onEditTeam(team);
  };

  const handleDelete = (team: TeamWithRelations) => {
    onDeleteTeam(team);
  };

  const handleSaveTeam = async (
    teamData: CreateTeamDto | UpdateTeamDto
  ): Promise<boolean> => {
    setIsModalOpen(false);
    try {
      if (currentTeam) {
        await updateTeam(currentTeam.id, teamData);
        showToastSuccess({
          title: "Success",
          text: "Team updated successfully!",
        });
      } else {
        await createTeam(teamData as CreateTeamDto);
        showToastSuccess({
          title: "Success",
          text: "Team added successfully!",
        });
      }
      fetchTeams(currentPage, searchQuery);
      return true;
    } catch (err) {
      console.error("Failed to save team:", err);
      showToastError({ title: "Error", text: "Failed to save team." });
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (currentTeam) {
      try {
        await deleteTeam(currentTeam.id);
        showToastSuccess({
          title: "Success",
          text: "Team deleted successfully!",
        });
        fetchTeams(currentPage, searchQuery);
      } catch (err) {
        console.error("Failed to delete team:", err);
        showToastError({ title: "Error", text: "Failed to delete team." });
      } finally {
        setIsDeleteModalOpen(false);
        setCurrentTeam(undefined);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="ค้นหาทีม..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
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
            {teams.length === 0 ? (
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
                    {team.team_type === "team" ? "ทีม" : "บุคคล"}
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
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(team)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>


      <TeamFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTeam}
        currentTeam={currentTeam}
        classrooms={allClassrooms}
        departments={allDepartments}
      />
      <TeamDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        teamToDelete={currentTeam ?? null}
      />
    </div>
  );
};

export default TeamTable;