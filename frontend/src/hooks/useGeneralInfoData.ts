import { useState, useEffect, useMemo } from "react";
import type { OrderFormState, Department, Year, Classroom, Team, User } from "../types";

interface UseGeneralInfoDataProps {
  formData: OrderFormState;
  departments: Department[];
  years: Year[];
  teams?: Team[];
  user?: User | null;
}

interface UseGeneralInfoDataReturn {
  filteredYears: Year[];
  filteredClassrooms: Classroom[];
  filteredTeams: Team[];
  departmentOptions: { value: string; label: string; }[];
  classroomOptions: { value: string; label: string; }[];
  classLevelOptions: { value: string; label: string; }[];
  teamOptions: { value: string; label: string; }[];
}

const useGeneralInfoData = ({ formData, departments, years, teams, user }: UseGeneralInfoDataProps): UseGeneralInfoDataReturn => {
  const [filteredYears, setFilteredYears] = useState<Year[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);

  // Check if user is a teacher based on Role. Fallback to teacher_id check.
  const isTeacher = user?.role === "USER" || !!user?.teacher_id;
  const myClassrooms = user?.teacher?.classroom || [];

  // Filter departments based on user role
  const departmentOptions = useMemo(() => {
    let filteredDepts = departments || [];
    if (isTeacher) {
      const myDeptIds = new Set(myClassrooms.map(c => c.department_id));
      // console.log("useGeneralInfoData: Filtering departments. Allowed IDs:", Array.from(myDeptIds));
      filteredDepts = filteredDepts.filter(d => myDeptIds.has(d.id));
    }
    return filteredDepts.map((department) => ({
      value: department.id,
      label: department.name,
    }));
  }, [departments, isTeacher, myClassrooms]);

  // Filter years based on department AND teacher assignments
  useEffect(() => {
    if (formData.department_id) {
      let departmentYears = years.filter((year) =>
        year.classrooms?.some((classroom) => classroom.department_id == formData.department_id)
      );

      if (isTeacher) {
        const myYearIds = new Set(myClassrooms.filter(c => c.department_id === formData.department_id).map(c => c.grade_level_id));
        departmentYears = departmentYears.filter(y => myYearIds.has(y.id));
      }

      setFilteredYears(departmentYears);
    } else {
      setFilteredYears([]);
    }
  }, [formData.department_id, years, isTeacher, myClassrooms]);

  // Filter classrooms based on year, department AND teacher assignments
  useEffect(() => {
    if (formData.year_id) {
      const selectedYear = years.find((year) => year.id === formData.year_id);
      let filtered = selectedYear?.classrooms?.filter(
        (classroom) => classroom.department_id == formData.department_id
      ) ?? [];

      if (isTeacher) {
        const myClassroomIds = new Set(myClassrooms.map(c => c.id));
        filtered = filtered.filter(c => myClassroomIds.has(c.id));
      }

      setFilteredClassrooms(filtered);
    } else {
      setFilteredClassrooms([]);
    }
  }, [formData.year_id, formData.department_id, years, isTeacher, myClassrooms]);

  // Filter teams based on competitionType only, allowing selection from any department/classroom
  useEffect(() => {
    let filtered = teams || []; // Start with all teams

    if (formData.competitionType === "person") {
      filtered = filtered.filter(team => team.team_type === "person");
    } else if (formData.competitionType === "team") {
      filtered = filtered.filter(team => team.team_type === "team");
    }

    setFilteredTeams(filtered);
  }, [formData.competitionType, teams]);

  const classroomOptions = (
    (filteredClassrooms || []).map((classroom) => ({
      value: classroom.id,
      label: classroom.name,
    }))
  );

  const classLevelOptions = (
    (filteredYears || []).map((year) => ({
      value: year.id,
      label: `${year.level === "VOCATIONAL" ? "ปวช" : "ปวส"} ${year.year}`,
    }))
  );

  const teamOptions = (
    filteredTeams.map((team) => ({
      value: team.id,
      label: team.team_type === "person" && team.student_member_name
        ? `${team.name} (${team.student_member_name})`
        : team.name,
    }))
  );

  return {
    filteredYears,
    filteredClassrooms,
    filteredTeams,
    departmentOptions,
    classroomOptions,
    classLevelOptions,
    teamOptions,
  };
};

export default useGeneralInfoData;
