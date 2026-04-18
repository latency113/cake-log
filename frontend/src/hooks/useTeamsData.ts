
import { useState, useEffect, useCallback } from 'react';
import { getTeams, createTeam, updateTeam } from '@/utils/api/teams';
import { getClassrooms } from '@/utils/api/data';
import { getDepartments } from '@/utils/api/departments';
import type { TeamWithRelations, CreateTeamDto, UpdateTeamDto } from '@/types/team';
import type { Classroom, Department } from '@/types';

export const useTeamsData = (page: number = 1, itemsPerPage: number = 10, search?: string, team_type?: "team" | "person") => {
  const [teams, setTeams] = useState<TeamWithRelations[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const [teamsResponse, classroomsResponse, departmentsResponse] = await Promise.all([
        getTeams(page, itemsPerPage, search, team_type),
        getClassrooms(1, 9999),
        getDepartments(1, 9999),
      ]);
      setTeams(teamsResponse.data);
      setTotalCount(teamsResponse.meta_data.total);
      setClassrooms(classroomsResponse);
      setDepartments(departmentsResponse.data);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setTeams([]); // Clear teams on error to show empty state
      setTotalCount(0);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, search, team_type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTeam = async (teamData: CreateTeamDto) => {
    try {
      const newTeam = await createTeam(teamData);
      setTeams((prevTeams) => [...prevTeams, { ...newTeam, classrooms: [], department: null }]);
      fetchData(); // Refetch to get the full data with relations
      return true;
    } catch (error) {
      console.error('Error creating team:', error);
      return false;
    }
  };

  const handleUpdateTeam = async (id: string, teamData: UpdateTeamDto) => {
    try {
      const updatedTeam = await updateTeam(id, teamData);
      setTeams((prevTeams) =>
        prevTeams.map((team) => (team.id === id ? { ...team, ...updatedTeam } : team))
      );
      fetchData(); // Refetch to get the full data with relations
      return true;
    } catch (error) {
      console.error(`Error updating team ${id}:`, error);
      return false;
    }
  };

  return {
    teams,
    totalCount,
    classrooms,
    departments,
    loading,
    error,
    handleCreateTeam,
    handleUpdateTeam,
    refetch: fetchData,
  };
};
