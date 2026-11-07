import { useMemo } from "react";
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
  // Check if user is a teacher based on Role. Fallback to teacher_id check.
  const isTeacher = user?.role === "USER" || !!user?.teacher_id;
  const myClassrooms = useMemo(() => user?.teacher?.classroom || [], [user?.teacher?.classroom]);

  // Filter departments based on user role
  const departmentOptions = useMemo(() => {
    let filteredDepts = departments || [];
    if (isTeacher && myClassrooms.length > 0) {
      const myDeptIds = new Set(myClassrooms.map((c) => c.department_id));
      filteredDepts = filteredDepts.filter((d) => myDeptIds.has(d.id));
    }
    return filteredDepts.map((department) => ({
      value: department.id,
      label: department.name,
    }));
  }, [departments, isTeacher, myClassrooms]);

  // Filter years based on department AND teacher assignments (derived via useMemo)
  const filteredYears = useMemo(() => {
    if (!formData.department_id) return [];
    let departmentYears = (years || []).filter((year) =>
      year.classrooms?.some((classroom) => classroom.department_id === formData.department_id)
    );

    if (isTeacher && myClassrooms.length > 0) {
      const myYearIds = new Set(
        myClassrooms
          .filter((c) => c.department_id === formData.department_id)
          .map((c) => c.grade_level_id)
      );
      departmentYears = departmentYears.filter((y) => myYearIds.has(y.id));
    }

    return departmentYears;
  }, [formData.department_id, years, isTeacher, myClassrooms]);

  // Filter classrooms based on year, department AND teacher assignments (derived via useMemo)
  const filteredClassrooms = useMemo(() => {
    if (!formData.year_id) return [];
    const selectedYear = (years || []).find((year) => year.id === formData.year_id);
    let filtered =
      selectedYear?.classrooms?.filter(
        (classroom) => classroom.department_id === formData.department_id
      ) ?? [];

    if (isTeacher && myClassrooms.length > 0) {
      const myClassroomIds = new Set(myClassrooms.map((c) => c.id));
      filtered = filtered.filter((c) => myClassroomIds.has(c.id));
    }

    return filtered;
  }, [formData.year_id, formData.department_id, years, isTeacher, myClassrooms]);

  // Filter teams based on competitionType only (derived via useMemo)
  const filteredTeams = useMemo(() => {
    const list = teams || [];
    if (formData.competitionType === "person") {
      return list.filter((team) => team.team_type === "person");
    } else if (formData.competitionType === "team") {
      return list.filter((team) => team.team_type === "team");
    }
    return list;
  }, [formData.competitionType, teams]);

  const classroomOptions = useMemo(
    () =>
      (filteredClassrooms || []).map((classroom) => ({
        value: classroom.id,
        label: classroom.name,
      })),
    [filteredClassrooms]
  );

  const classLevelOptions = useMemo(
    () =>
      (filteredYears || []).map((year) => ({
        value: year.id,
        label: `${year.level === "VOCATIONAL" ? "ปวช" : "ปวส"} ${year.year}`,
      })),
    [filteredYears]
  );

  const teamOptions = useMemo(
    () =>
      filteredTeams.map((team) => ({
        value: team.id,
        label:
          team.team_type === "person" && team.student_member_name
            ? `${team.name} (${team.student_member_name})`
            : team.name,
      })),
    [filteredTeams]
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
