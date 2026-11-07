import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { getClassrooms, getStudentsCakePounds } from "@/utils/api/classrooms";
import { getClassroomCakeSummaries } from "@/utils/api/data";
import type { Classroom } from "@/types/classroom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  ChevronRight,
  Building2,
  ShoppingBag,
  RotateCcw,
  Cake,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { showToastError } from "@/utils/alerts";

interface ClassroomStats {
  totalStudents: number;
  orderingStudentsCount: number;
  totalPounds: number;
  isFinalized: boolean;
}

const TeacherClassroomPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomStatsMap, setClassroomStatsMap] = useState<
    Map<string, ClassroomStats>
  >(new Map());
  const [filterStatus, setFilterStatus] = useState<"all" | "finalized" | "pending">("all");

  const academicYear =
    localStorage.getItem("academicYear") ||
    (new Date().getFullYear() + 543).toString();

  useEffect(() => {
    const fetchTeacherClassrooms = async () => {
      try {
        setLoading(true);
        const [res, cakeSummaries] = await Promise.all([
          getClassrooms(1, 9999),
          getClassroomCakeSummaries(user?.id).catch(() => []),
        ]);
        const all = res.data || [];

        const summaryMap = new Map<string, boolean>();
        cakeSummaries.forEach((s) => {
          summaryMap.set(s.classroomId, !!s.isOrderFinalized);
        });

        const teacherId = user?.teacher_id || user?.teacher?.id;
        const teacherFullName = user
          ? `${user.firstname || ""} ${user.lastname || ""}`.trim()
          : "";

        let myClassrooms = all.filter((cls) => {
          if (teacherId && cls.teacher_id === teacherId) return true;
          if (teacherId && cls.teacher?.id === teacherId) return true;
          if (teacherFullName && cls.teacher?.name) {
            const tName = cls.teacher.name.replace(/\s+/g, "").trim();
            const uName = teacherFullName.replace(/\s+/g, "").trim();
            if (tName.includes(uName) || uName.includes(tName)) return true;
          }
          return false;
        });

        // If user is admin/superadmin and has no matched classrooms, allow them to view all
        const userRole = user?.role ? String(user.role).toUpperCase() : "";
        const isAdmin = userRole === "SUPERADMIN" || userRole === "ADMIN";
        if (myClassrooms.length === 0 && isAdmin) {
          myClassrooms = all;
        }

        setClassrooms(myClassrooms);

        // Fetch quick stats for each classroom
        const statsMap = new Map<string, ClassroomStats>();
        await Promise.all(
          myClassrooms.map(async (cls) => {
            const isFinalized = !!cls.isOrderFinalized || !!summaryMap.get(cls.id);
            try {
              const cakeData = await getStudentsCakePounds(cls.id);
              const totalPounds = cakeData.totalPoundsForClassroom || 0;
              const orderingStudentsCount =
                cakeData.students?.filter((s) => s.totalPounds > 0).length || 0;
              const totalStudents = cls.students?.length || cakeData.students?.length || 0;
              statsMap.set(cls.id, {
                totalStudents,
                orderingStudentsCount,
                totalPounds,
                isFinalized,
              });
            } catch (err) {
              statsMap.set(cls.id, {
                totalStudents: cls.students?.length || 0,
                orderingStudentsCount: 0,
                totalPounds: 0,
                isFinalized,
              });
            }
          })
        );
        setClassroomStatsMap(statsMap);
      } catch (err) {
        console.error("Failed to fetch teacher classrooms:", err);
        showToastError({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถโหลดข้อมูลห้องเรียนได้",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTeacherClassrooms();
    }
  }, [user]);

  // Navigate directly to /my-classroom/:id/students when clicking card
  const handleSelectClassroom = (classroomId: string) => {
    navigate({ to: `/my-classroom/${classroomId}/students` as any });
  };

  const getGradeText = (cls: Classroom) => {
    if (!cls.grade_level) return "ไม่ระบุระดับชั้น";
    const lvl =
      cls.grade_level.level === "VOCATIONAL"
        ? "ปวช."
        : cls.grade_level.level === "HIGHER"
        ? "ปวส."
        : cls.grade_level.level;
    return `${lvl} ${cls.grade_level.year}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-64 mb-4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-96 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-slate-200 dark:bg-slate-800 rounded-md"
            />
          ))}
        </div>
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-2xl py-16 text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner">
          <GraduationCap className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          ไม่พบข้อมูลห้องเรียนที่คุณเป็นครูที่ปรึกษา
        </h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          ขณะนี้บัญชีผู้ใช้ของคุณ (<strong>{user?.firstname} {user?.lastname}</strong>) ยังไม่ได้ผูกกับข้อมูลห้องเรียนในระบบ
          หากคุณเป็นครูประจำชั้นหรือครูที่ปรึกษา กรุณาติดต่อผู้ดูแลระบบเพื่อเชื่อมโยงห้องเรียน
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" /> รีเฟรชข้อมูล
          </Button>
          <Button
            onClick={() => navigate({ to: "/select-book" })}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ShoppingBag className="w-4 h-4" /> ไปหน้าสั่งจองเค้ก
          </Button>
        </div>
      </div>
    );
  }

  const finalizedCount = classrooms.filter((cls) => {
    const stats = classroomStatsMap.get(cls.id);
    return stats ? stats.isFinalized : !!cls.isOrderFinalized;
  }).length;
  const pendingCount = classrooms.length - finalizedCount;

  const filteredClassrooms = classrooms.filter((cls) => {
    const stats = classroomStatsMap.get(cls.id);
    const isFin = stats ? stats.isFinalized : !!cls.isOrderFinalized;
    if (filterStatus === "finalized") return isFin;
    if (filterStatus === "pending") return !isFin;
    return true;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-1">
          <GraduationCap className="w-5 h-5" />
          <span>ห้องเรียนของฉัน (ครูที่ปรึกษา)</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {classrooms.length > 1
            ? "เลือกห้องเรียนเพื่อดูรายชื่อนักเรียน"
            : "ห้องเรียนที่คุณเป็นครูที่ปรึกษา"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {classrooms.length > 1
            ? `คุณเป็นครูที่ปรึกษา ${classrooms.length} ห้องเรียน ในปีการศึกษา ${academicYear} สามารถตรวจสอบสถานะสรุปยอดและคลิกการ์ดเพื่อดูรายละเอียดได้`
            : `ห้องเรียนในความดูแลของคุณ ประจำปีการศึกษา ${academicYear} คลิกที่การ์ดเพื่อตรวจสอบรายชื่อนักเรียน`}
        </p>
      </div>

      {/* Filter Pills and Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className={`rounded-md text-xs font-medium cursor-pointer ${
              filterStatus === "all"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            ทั้งหมด ({classrooms.length})
          </Button>
          <Button
            variant={filterStatus === "finalized" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("finalized")}
            className={`rounded-md text-xs font-medium gap-1.5 cursor-pointer ${
              filterStatus === "finalized"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                : "text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            สรุปยอดแล้ว ({finalizedCount})
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("pending")}
            className={`rounded-md text-xs font-medium gap-1.5 cursor-pointer ${
              filterStatus === "pending"
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                : "text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            ยังไม่สรุปยอด ({pendingCount})
          </Button>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <span>สรุปยอดแล้ว:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {finalizedCount} / {classrooms.length}
          </span>
          <span>ห้อง</span>
        </div>
      </div>

      {/* Classroom Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClassrooms.map((cls) => {
          const stats = classroomStatsMap.get(cls.id);
          const totalStudents = stats?.totalStudents || cls.students?.length || 0;
          const orderingCount = stats?.orderingStudentsCount || 0;
          const totalPounds = stats?.totalPounds || 0;
          const isFinalized = stats ? stats.isFinalized : !!cls.isOrderFinalized;

          return (
            <Card
              key={cls.id}
              onClick={() => handleSelectClassroom(cls.id)}
              className={`group relative cursor-pointer border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 rounded-md overflow-hidden flex flex-col justify-between bg-card hover:bg-card/90 ${
                isFinalized
                  ? "hover:border-emerald-500 dark:hover:border-emerald-500"
                  : "hover:border-blue-500 dark:hover:border-blue-500"
              }`}
            >
              {/* Card Top Accent Bar */}
              <div
                className={`h-2 w-full transition-all duration-300 group-hover:h-2.5 ${
                  isFinalized
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-gradient-to-r from-blue-400 to-blue-600"
                }`}
              />

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 text-xs font-semibold px-2.5 py-1"
                  >
                    {getGradeText(cls)}
                  </Badge>

                  {/* Status Badge */}
                  {isFinalized ? (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold px-2 py-0.5 flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>สรุปยอดแล้ว</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 text-[11px] font-medium px-2 py-0.5 flex items-center gap-1 shadow-2xs"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>ยังไม่สรุปยอด</span>
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {getGradeText(cls)} ห้อง {cls.name}
                  </CardTitle>
                </div>

                <CardDescription className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cls.department?.name || "ไม่ระบุแผนกวิชา"}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="py-2">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      นักเรียนทั้งหมด
                    </span>
                    <span className="font-bold text-base text-foreground flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {totalStudents} คน
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      ยอดเค้กรวม
                    </span>
                    <span className="font-bold text-base text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                      <Cake className="w-3.5 h-3.5 text-amber-500" />
                      {totalPounds.toLocaleString()} ปอนด์
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span>นักเรียนที่สั่งเค้กแล้ว:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {orderingCount} / {totalStudents} คน
                  </span>
                </div>

              </CardContent>

              <CardFooter className="pt-3 pb-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectClassroom(cls.id);
                  }}
                  className={`w-full text-white rounded-md shadow-md flex items-center justify-between transition-colors ${
                    isFinalized
                      ? "bg-blue-700 hover:bg-blue-800"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 group-hover:shadow-blue-500/25"
                  }`}
                >
                  <span>{isFinalized ? "ดูรายชื่อนักเรียน (สรุปยอดแล้ว)" : "ดูรายชื่อ & สรุปยอดเค้ก"}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {filteredClassrooms.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-8">
            <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">ไม่พบห้องเรียนตามเงื่อนไขที่เลือก</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filterStatus === "finalized"
                ? "ยังไม่มีห้องเรียนใดสรุปยอดเค้ก"
                : "ห้องเรียนทั้งหมดสรุปยอดเค้กเรียบร้อยแล้ว"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterStatus("all")}
              className="mt-4"
            >
              แสดงทั้งหมด
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherClassroomPage;
