import { useState, useEffect } from "react";
import { Users, PlusCircle } from "lucide-react";
import TeamTable from "@/components/teams/TeamTable";
import { Button } from "@/components/ui/button";
import TeamFormModal from "@/components/teams/TeamFormModal";
import { getClassrooms } from "@/utils/api/data";
import { getDepartments } from "@/utils/api/departments";
import { createTeam, updateTeam, deleteTeam } from "@/utils/api/teams";
import type { CreateTeamDto, UpdateTeamDto, TeamWithRelations, Team } from "@/types/team";
import type { Classroom, Department } from "@/types";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import TeamDeleteConfirmModal from "@/components/teams/TeamDeleteConfirmModal";
import TeamsSkeleton from "../../components/dashboard/skeletons/TeamsSkeleton";

const Teams: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [refetch, setRefetch] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | undefined>(undefined);
  const [teamToDelete, setTeamToDelete] = useState<TeamWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [classroomsResponse, departmentsResponse] = await Promise.all([
          getClassrooms(1, 9999),
          getDepartments(1, 9999),
        ]);
        setClassrooms(Array.isArray(classroomsResponse) ? classroomsResponse : []);
        setDepartments(departmentsResponse.data);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [refetch]);

  if (loading) {
    return <TeamsSkeleton />;
  }


  const handleAddTeam = () => {
    setCurrentTeam(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTeam(undefined);
  };

  const handleEditTeam = (team: TeamWithRelations) => {
    setCurrentTeam(team);
    setIsModalOpen(true);
  };

  const handleDeleteTeam = (team: TeamWithRelations) => {
    setTeamToDelete(team);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (teamToDelete) {
      try {
        await deleteTeam(teamToDelete.id);
        showToastSuccess({
          title: "Success",
          text: "ลบทีมสำเร็จ!",
        });
        setRefetch((prev) => !prev);
      } catch (err) {
        console.error("Failed to delete team:", err);
        showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการลบ" });
      } finally {
        setIsDeleteModalOpen(false);
        setTeamToDelete(null);
      }
    }
  };

  const handleSave = async (teamData: CreateTeamDto | UpdateTeamDto) => {
    try {
      if (teamData && 'id' in teamData && typeof teamData.id === 'string') {
        await updateTeam(teamData.id, teamData as UpdateTeamDto);
        showToastSuccess({
          title: "Success",
          text: "อัพเดทข้อมูลทีมสำเร็จ!",
        });
      } else {
        await createTeam(teamData as CreateTeamDto);
        showToastSuccess({
          title: "Success",
          text: "สร้างทีมสำเร็จ!",
        });
      }
      setRefetch((prev) => !prev);
      handleCloseModal();
      return true;
    } catch (err) {
      console.error("Failed to save team:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการบันทึก" });
      return false;
    }
  };

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-purple-400 to-violet-500 rounded-sm shadow-md p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Users className="w-10 h-10 mr-4 text-white" />
              จัดการรายชื่อทีมทั้งหมด
            </h1>
            <p className="text-white text-lg">รายการทีมทั้งหมด</p>
          </div>
          <Button
            onClick={handleAddTeam}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            เพิ่มทีม
          </Button>
        </div>
      </div>
      <TeamTable
        onEditTeam={handleEditTeam}
        onDeleteTeam={handleDeleteTeam}
        refetchTrigger={refetch}
      />
      <TeamFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        currentTeam={currentTeam}
        classrooms={classrooms}
        departments={departments}
      />
      <TeamDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        teamToDelete={teamToDelete}
      />
    </div>
  );
};

export default Teams;
