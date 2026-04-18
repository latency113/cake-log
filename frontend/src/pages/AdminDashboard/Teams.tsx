import { useState, useEffect } from "react";
import { Users, PlusCircle, Search } from "lucide-react";
import TeamTable from "@/components/teams/TeamTable";
import { Button } from "@/components/ui/button";
import TeamFormModal from "@/components/teams/TeamFormModal";
import { createTeam, updateTeam, deleteTeam } from "@/utils/api/teams";
import type { CreateTeamDto, UpdateTeamDto, TeamWithRelations, Team } from "@/types/team";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import TeamDeleteConfirmModal from "@/components/teams/TeamDeleteConfirmModal";
import TeamsSkeleton from "../../components/dashboard/skeletons/TeamsSkeleton";
import { useTeamsData } from "@/hooks/useTeamsData";
import TeamsPagination from "@/components/teams/TeamsPagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Teams: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [teamTypeFilter, setTeamTypeFilter] = useState<"all" | "team" | "person">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | undefined>(undefined);
  const [teamToDelete, setTeamToDelete] = useState<TeamWithRelations | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, teamTypeFilter]);

  const {
    teams,
    totalCount,
    classrooms,
    departments,
    loading,
    error,
    refetch,
  } = useTeamsData(
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    teamTypeFilter === "all" ? undefined : teamTypeFilter
  );

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
        refetch();
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
      refetch();
      handleCloseModal();
      return true;
    } catch (err) {
      console.error("Failed to save team:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการบันทึก" });
      return false;
    }
  };

  if (loading && teams.length === 0) {
    return <TeamsSkeleton />;
  }

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-purple-400 to-violet-500 rounded-sm shadow-md p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Users className="w-10 h-10 mr-4 text-white" />
              จัดการรายชื่อทีมทั้งหมด
            </h1>
            <p className="text-white text-lg">รายการทีมทั้งหมด</p>
          </div>
          <Button
            onClick={handleAddTeam}
            className="bg-white text-purple-600 hover:bg-gray-100 self-start md:self-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            เพิ่มทีม
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาทีม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={teamTypeFilter}
            onValueChange={(value: "all" | "team" | "person") => setTeamTypeFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ประเภททีม" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="team">ทีม</SelectItem>
              <SelectItem value="person">บุคคล</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && teams.length === 0 ? (
        <div className="p-4 text-red-500 text-center bg-white rounded shadow-sm">
          เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
        </div>
      ) : (
        <TeamTable
          teams={teams}
          onEditTeam={handleEditTeam}
          onDeleteTeam={handleDeleteTeam}
          loading={loading}
        />
      )}

      <TeamsPagination
        totalTeams={totalCount}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(items) => {
          setItemsPerPage(items);
          setCurrentPage(1);
        }}
        className="mt-6 rounded-md shadow-sm overflow-hidden border border-border"
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