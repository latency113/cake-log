import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  FileSpreadsheet,
  Users,
  Trophy,
  Package,
  Book,
  CalendarDays,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface StepItem {
  id: number;
  title: string;
  shortDesc: string;
  fullDesc: string;
  linkText: string;
  path?: string;
  scrollToId?: string;
  icon: React.ElementType;
  badgeColor: string;
  tips: string[];
}

const STEPS: StepItem[] = [
  {
    id: 1,
    title: "1. นำเข้าข้อมูลชั้นเรียนและนักเรียน (Excel)",
    shortDesc: "นำเข้าไฟล์ Excel รายงานนักเรียนเพื่อสร้างห้องเรียนและนักเรียนอัตโนมัติ",
    fullDesc:
      "ไปที่เมนู 'จัดการชั้นเรียน' แล้วกดปุ่ม 'นำเข้า Excel' โดยใช้ไฟล์รายงานรูปแบบมาตรฐาน (Report Format) ของสถานศึกษา ระบบจะสร้างห้องเรียน ผูกแผนกวิชา และนำเข้ารายชื่อนักเรียนทั้งหมดเข้าสู่ระบบให้อัตโนมัติ",
    linkText: "ไปที่จัดการชั้นเรียน",
    path: "/dashboard/classrooms",
    icon: FileSpreadsheet,
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    tips: [
      "ใช้ไฟล์ .xlsx หรือ .xls รูปแบบรายงานตามที่วิทยาลัยกำหนด",
      "ระบบจะสร้างแผนกและห้องเรียนให้โดยอัตโนมัติหากยังไม่มีในระบบ",
    ],
  },
  {
    id: 2,
    title: "2. ตรวจสอบรายชื่อครูที่ปรึกษา",
    shortDesc: "ตรวจสอบความถูกต้องของรายชื่อครูประจำชั้นในแต่ละห้อง",
    fullDesc:
      "ไปที่เมนู 'จัดการรายชื่อครู' เพื่อตรวจสอบว่าครูที่ปรึกษาของแต่ละห้องเรียนมีรายชื่อครบถ้วน ถูกต้องตามปีการศึกษานี้ หากมีครูย้ายเข้าใหม่หรือเปลี่ยนห้องเรียน สามารถเพิ่มหรือแก้ไขข้อมูลได้ทันที",
    linkText: "ไปที่จัดการรายชื่อครู",
    path: "/dashboard/teachers",
    icon: Users,
    badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    tips: [
      "ตรวจสอบชื่อ-สกุลครูให้ตรงกับบัญชีผู้ใช้ในระบบ",
      "ครูที่ปรึกษาจะใช้บัญชีนี้ในการเข้าสู่ระบบเพื่อสรุปยอดเค้กของห้องเรียนตนเอง",
    ],
  },
  {
    id: 3,
    title: "3. เพิ่มข้อมูลทีม (Teams)",
    shortDesc: "สร้างรายชื่อทีมสำหรับจัดกลุ่มการสั่งจองและสรุปอันดับยอดขาย",
    fullDesc:
      "ไปที่เมนู 'จัดการทีม' เพื่อสร้างรายชื่อทีมหรือกลุ่มกิจกรรมสำหรับปีการศึกษานี้ สำหรับใช้จัดกลุ่มการสั่งจองของนักเรียนและใช้ในการแสดงผลบนหน้า Leaderboard",
    linkText: "ไปที่จัดการทีม",
    path: "/dashboard/teams",
    icon: Trophy,
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    tips: [
      "สามารถสร้างได้ทั้งแบบทีมกลุ่มกิจกรรม และแบบบุคคล",
      "ควรกำหนดทีมให้พร้อมก่อนที่นักเรียนหรือผู้สั่งจองจะเริ่มบันทึกออเดอร์",
    ],
  },
  {
    id: 4,
    title: "4. เพิ่มสินค้าและราคาเค้ก (Products)",
    shortDesc: "กำหนดชนิดเค้กและราคาต่อปอนด์สำหรับปีนี้",
    fullDesc:
      "ไปที่เมนู 'จัดการสินค้า' เพื่อตรวจสอบชนิดเค้ก (เช่น เค้กวานิลลา, เค้กกาแฟ, เค้กช็อกโกแลต) และราคาต่อปอนด์สำหรับเทศกาลปีใหม่รอบนี้ หากมีสินค้าชนิดใหม่หรือปรับราคา ให้ตั้งค่าให้เรียบร้อย",
    linkText: "ไปที่จัดการสินค้า",
    path: "/dashboard/products",
    icon: Package,
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    tips: [
      "ต้องมีรายการสินค้าอย่างน้อย 1 รายการ มิฉะนั้นจะไม่สามารถเปิดใบสั่งจองได้",
      "ตรวจสอบราคาต่อปอนด์ให้ถูกต้องก่อนเริ่มเปิดรับออเดอร์",
    ],
  },
  {
    id: 5,
    title: "5. เพิ่มสมุดการบันทึกเค้ก (Order Books)",
    shortDesc: "สร้างสมุดจองเค้กเพื่อแจกจ่ายให้ครูและนักเรียนบันทึกออเดอร์",
    fullDesc:
      "ไปที่เมนู 'จัดการสมุดจอง' เพื่อเตรียมเล่มสมุดบันทึก โดยสามารถกดปุ่ม 'สร้างเล่ม 001-100 อัตโนมัติ' หรือเพิ่มทีละเล่มตามจำนวนสมุดจริงที่พิมพ์แจกจ่ายให้แต่ละห้องเรียน",
    linkText: "ไปที่จัดการสมุดจอง",
    path: "/dashboard/order-books",
    icon: Book,
    badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
    tips: [
      "สามารถกดปุ่ม 'สร้างเล่ม 001-100 อัตโนมัติ' เพื่อสร้างสมุดจอง 100 เล่มแรกได้ทันทีในคลิกเดียว",
      "แต่ละห้องเรียนสามารถเลือกผูกกับสมุดจองที่ตนเองได้รับ",
    ],
  },
  {
    id: 6,
    title: "6. ตั้งค่าระบบและช่วงเวลารับเค้ก (System Settings)",
    shortDesc: "กรอกปีการศึกษา, วันที่-เวลาเริ่มรับเค้ก และชื่อผู้รายงาน",
    fullDesc:
      "เลื่อนลงไปที่ส่วน 'การตั้งค่าระบบ' ด้านล่างของหน้านี้ แล้วกรอกข้อมูลประจำปีให้ครบถ้วน: ปีการศึกษา (เช่น 2568), ปีปัจจุบัน (เช่น 2569), วันเริ่มรับเค้ก - วันสิ้นสุดรับเค้ก, เวลารับเค้ก (เริ่มต้น - สิ้นสุด) และชื่อผู้รายงานสำหรับหัวรายงานเอกสาร",
    linkText: "เลื่อนไปที่ฟอร์มตั้งค่า",
    scrollToId: "cake-settings-section",
    icon: CalendarDays,
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    tips: [
      "วันและเวลาที่ระบุจะนำไปแสดงบนใบเสร็จรับเงินและระบบค้นหาสถานะเค้ก",
      "ชื่อผู้รายงานจะปรากฏในส่วนหัวและท้ายของรายงานผลการสั่งจองทุกฉบับ",
    ],
  },
];

interface NewYearSetupGuideProps {
  currentAcademicYear?: string;
}

export const NewYearSetupGuide: React.FC<NewYearSetupGuideProps> = ({
  currentAcademicYear = "default",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const storageKey = `nvc_setup_checklist_${currentAcademicYear}`;

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCompletedSteps(saved ? JSON.parse(saved) : []);
    } catch {
      setCompletedSteps([]);
    }
  }, [storageKey]);

  const toggleStep = (stepId: number) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save setup checklist state:", err);
      }
      return next;
    });
  };

  const handleResetChecklist = () => {
    setCompletedSteps([]);
    localStorage.removeItem(storageKey);
  };

  const handleScrollToForm = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const progressPercent = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <>
      {/* Main Checklist Card */}
      <div className="bg-card p-6 rounded-xl shadow-md mb-8 border border-border border-l-4 border-l-cyan-500 transition-all">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  ขั้นตอนการตั้งค่าระบบสำหรับปีการศึกษาใหม่
                </h2>
                <Badge
                  variant="outline"
                  className="bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 text-xs"
                >
                  6 ขั้นตอน
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                แนวทางปฏิบัติและลำดับการจัดเตรียมข้อมูลสำหรับแอดมินและผู้ดูแลระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5 text-xs text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/40"
            >
              <BookOpen className="w-4 h-4" />
              <span>อ่านคู่มือฉบับเต็ม</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              title={isCollapsed ? "ขยาย" : "ย่อ"}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Content body */}
        {!isCollapsed && (
          <div className="mt-5 space-y-5">
            {/* Progress Bar & Reset */}
            <div className="bg-muted/40 dark:bg-muted/20 p-3.5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-muted-foreground">ความคืบหน้าการตั้งค่าระบบ:</span>
                  <span className="text-foreground font-semibold">
                    {completedSteps.length} จาก {STEPS.length} ขั้นตอน ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              {completedSteps.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetChecklist}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors self-end sm:self-center"
                >
                  <RotateCcw className="w-3 h-3" />
                  รีเซ็ตรายการ
                </button>
              )}
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {STEPS.map((step) => {
                const IconComponent = step.icon;
                const isChecked = completedSteps.includes(step.id);

                return (
                  <div
                    key={step.id}
                    className={`rounded-lg border p-4 transition-all flex flex-col justify-between ${
                      isChecked
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                        : "bg-background border-border hover:border-cyan-400 dark:hover:border-cyan-700"
                    }`}
                  >
                    <div>
                      {/* Top Row: Icon + Checkbox */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div
                          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${step.badgeColor}`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleStep(step.id)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-colors cursor-pointer ${
                            isChecked
                              ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 ${
                              isChecked
                                ? "text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span>{isChecked ? "เรียบร้อยแล้ว" : "ทำเครื่องหมาย"}</span>
                        </button>
                      </div>

                      {/* Title & Desc */}
                      <h3
                        className={`text-sm font-semibold mb-1 leading-snug ${
                          isChecked
                            ? "text-emerald-900 dark:text-emerald-200 line-through opacity-85"
                            : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {step.shortDesc}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3.5 pt-3 border-t border-border/60">
                      {step.path ? (
                        <Link
                          to={step.path}
                          className="inline-flex items-center justify-center gap-1.5 w-full text-xs font-medium px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                        >
                          <span>{step.linkText}</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </Link>
                      ) : step.scrollToId ? (
                        <button
                          type="button"
                          onClick={() => handleScrollToForm(step.scrollToId!)}
                          className="inline-flex items-center justify-center gap-1.5 w-full text-xs font-medium px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
                        >
                          <span>{step.linkText}</span>
                          <ChevronDown className="w-3 h-3 opacity-70" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Caution/Tips Alert Box */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3.5 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">ข้อควรระวังสำคัญสำหรับผู้ดูแลระบบ:</span>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800 dark:text-amber-300">
                  <li>
                    ควรทำการ <strong>สำรองข้อมูล (Backup)</strong> ของปีการศึกษาก่อนหน้าเก็บไว้ก่อนเริ่มตั้งค่าหรือล้างข้อมูลเสมอ
                  </li>
                  <li>
                    ต้องดำเนินการ <strong>ข้อ 1 (นำเข้าชั้นเรียน)</strong> และ <strong>ข้อ 4 (เพิ่มสินค้า)</strong> ให้เรียบร้อย ก่อนให้นักเรียนหรือครูเริ่มบันทึกใบสั่งจอง
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Guide Dialog / Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-background text-foreground">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
              <BookOpen className="w-5 h-5" />
              <DialogTitle className="text-xl font-bold">
                คู่มือการจัดเตรียมระบบสำหรับปีการศึกษาใหม่
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              คำแนะนำทีละขั้นตอน (Step-by-Step Handover Guide) สำหรับผู้ดูแลระบบ
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Notice Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg p-4 flex gap-3 text-sm text-blue-900 dark:text-blue-200">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">ทำความเข้าใจโครงสร้างระบบ:</p>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  ระบบ NVC Cake Log จัดเก็บข้อมูลแยกตามปีการศึกษา การขึ้นปีการศึกษาใหม่จะเริ่มต้นด้วยฐานข้อมูลเปล่า แต่ยังคงเก็บบัญชีผู้ใช้ (User) เดิมไว้ ดังนั้นผู้ดูแลระบบจำเป็นต้องตั้งค่าข้อมูลเริ่มต้น 6 ขั้นตอนตามลำดับ เพื่อให้ระบบพร้อมสำหรับการสั่งจอง
                </p>
              </div>
            </div>

            {/* Flow Steps Detail */}
            <div className="space-y-4">
              {STEPS.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div
                    key={step.id}
                    className="border border-border rounded-xl p-4.5 bg-card hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${step.badgeColor}`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-foreground">
                            {step.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            ขั้นตอนที่ {step.id}
                          </span>
                        </div>
                      </div>

                      {step.path ? (
                        <Link
                          to={step.path}
                          onClick={() => setIsModalOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <span>{step.linkText}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : step.scrollToId ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsModalOpen(false);
                            setTimeout(() => handleScrollToForm(step.scrollToId!), 150);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          <span>{step.linkText}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      ) : null}
                    </div>

                    <p className="text-sm text-foreground/90 mt-2 mb-3 leading-relaxed">
                      {step.fullDesc}
                    </p>

                    {step.tips && step.tips.length > 0 && (
                      <div className="bg-muted/40 dark:bg-muted/20 rounded-lg p-2.5 text-xs space-y-1">
                        <span className="font-semibold text-muted-foreground">คำแนะนำ:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                          {step.tips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Checklist summary footer */}
            <div className="border-t border-border pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-muted-foreground">
                คู่มือนี้สามารถเปิดอ่านได้ตลอดเวลาจากเมนูตั้งค่าระบบ
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
              >
                เข้าใจแล้ว, ปิดหน้าต่างนี้
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewYearSetupGuide;

