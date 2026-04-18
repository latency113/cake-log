import { api } from "../api";
import type { Team, CreateTeamDto, UpdateTeamDto, TeamWithRelations } from "../../types/team";

export const getTeams = async (
  page: number = 1,
  itemsPerPage: number = 10,
  search?: string,
  team_type?: "team" | "person"
): Promise<{ data: TeamWithRelations[]; meta_data: any }> => {
  try {
    const response = await api.get("/teams", {
      params: {
        page,
        itemsPerPage,
        ...(search && { search }),
        ...(team_type && { team_type }),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
};

export const getTeamById = async (id: string): Promise<TeamWithRelations> => {
  try {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team ${id}:`, error);
    throw error;
  }
};

export const createTeam = async (teamData: CreateTeamDto): Promise<Team> => {
  try {
    const response = await api.post("/teams", teamData);
    return response.data.newTeam;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

export const updateTeam = async (id: string, teamData: UpdateTeamDto): Promise<Team> => {
  try {
    const response = await api.patch(`/teams/${id}`, teamData);
    return response.data.updatedTeam;
  } catch (error) {
    console.error(`Error updating team ${id}:`, error);
    throw error;
  }
};

export const deleteTeam = async (id: string): Promise<void> => {
  try {
    await api.delete(`/teams/${id}`);
  } catch (error) {
    console.error(`Error deleting team ${id}:`, error);
    throw error;
  }
};
