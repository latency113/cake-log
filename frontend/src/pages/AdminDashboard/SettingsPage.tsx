import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  DownloadCloud,
  Undo2,
  Sparkles,
  Database,
  Trash2,
  History,
  FileText,
  Download,
  RefreshCcw,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  Save,
  ListChecks,
  Eye,
  EyeOff,
  Lock,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { YearSelector } from "../../components/common/YearSelector";
import Swal from "sweetalert2";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import {
  backupData,
  restoreDataFromBackup,
  getCakeSettings,
  createCakeSettings,
  initYearDatabase,
  deleteYearDatabase,
  getBackups,
  downloadBackup,
  clearData,
} from "../../utils/api/settings";
import type { ICakeSettings } from "../../types/cake";
import NewYearSetupGuide from "@/components/settings/NewYearSetupGuide";

const SETTINGS_TABS = [
  {
    id: "cake",
    label: "รอบการรับเค้ก",
    icon: Calendar,
    color: "text-pink-500",
    activeColor: "text-pink-600 dark:text-pink-400",
  },
  {
    id: "new-year",
    label: "เตรียมระบบปีใหม่",
    icon: ListChecks,
    color: "text-amber-500",
    activeColor: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "backup",
    label: "สำรองและกู้คืน",
    icon: DownloadCloud,
    color: "text-emerald-500",
    activeColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "database",
    label: "จัดการฐานข้อมูล",
    icon: Database,
    color: "text-blue-500",
    activeColor: "text-blue-600 dark:text-blue-400",
  },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hash = window.location.hash.replace("#", "");
    const saved = localStorage.getItem("settings_active_tab");
    const validIds = SETTINGS_TABS.map((t) => t.id);
    if (hash && validIds.includes(hash)) return hash;
    if (saved && validIds.includes(saved)) return saved;
    return "cake";
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem("settings_active_tab", tabId);
    window.location.hash = tabId;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const validIds = SETTINGS_TABS.map((t) => t.id);
      if (hash && validIds.includes(hash)) {
        setActiveTab(hash);
        localStorage.setItem("settings_active_tab", hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);
  const [isLoadingCakeSettings, setIsLoadingCakeSettings] = useState(true);
  const [newYearInput, setNewYearInput] = useState("");
  const [backups, setBackups] = useState<string[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [backupTag, setBackupTag] = useState("");
  const [originalSecurityKey, setOriginalSecurityKey] = useState<string | null>(null);

  // Security Key change states
  const [currentKeyInput, setCurrentKeyInput] = useState("");
  const [newKeyInput, setNewKeyInput] = useState("");
  const [confirmKeyInput, setConfirmKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [showCurrentKey, setShowCurrentKey] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);

  // Form states for editable fields


  const fetchBackups = useCallback(async () => {
    setIsLoadingBackups(true);
    try {
      const result = await getBackups();
      setBackups(result.backups);
    } catch (error) {
      console.error("Failed to fetch backups:", error);
    } finally {
      setIsLoadingBackups(false);
    }
  }, []);

  const fetchCakeSettings = useCallback(async () => {
    try {
      const settings = await getCakeSettings();
      setCurrentKeyInput("");
      setNewKeyInput("");
      setConfirmKeyInput("");
      setKeyError("");
      if (settings) {
        setOriginalSecurityKey(settings.securityKey || null);
        setCakeSettings({
        ...settings,
        academicYear: settings.academicYear || (new Date().getFullYear() + 543).toString(),
        currentYear: settings.currentYear || (new Date().getFullYear() + 543).toString(),
        pickupStartDate: settings.pickupStartDate ? settings.pickupStartDate.split("T")[0] : "",
        pickupEndDate: settings.pickupEndDate ? settings.pickupEndDate.split("T")[0] : "",
        pickupStartTime: settings.pickupStartTime || "",
        pickupEndTime: settings.pickupEndTime || "",
        reporterName: settings.reporterName || "",
        });      } else {
        // If no settings are returned, initialize with defaults
        setCakeSettings({
          id: "",
          academicYear: (new Date().getFullYear() + 543).toString(),
          currentYear: (new Date().getFullYear() + 543).toString(),
          pickupStartDate: "",
          pickupEndDate: "",
          pickupStartTime: "",
          pickupEndTime: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to fetch cake settings:", error);
      showToastError({ title: "Error", text: "Failed to load cake settings." });
      setCakeSettings(null); // Ensure state is null on error
    } finally {
      setIsLoadingCakeSettings(false);
    }
  }, [setCakeSettings, setIsLoadingCakeSettings]);

  useEffect(() => {
    fetchCakeSettings();
    fetchBackups();
  }, [fetchCakeSettings, fetchBackups]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCakeSettings((prevSettings) => {
      if (!prevSettings) return null;
      return {
        ...prevSettings,
        [id]: value,
      };
    });
  };

  const handleBackup = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการสำรองข้อมูล",
      text: "คุณแน่ใจหรือไม่ว่าต้องการสำรองข้อมูลทั้งหมด? การดำเนินการนี้จะสร้างไฟล์สำรองของฐานข้อมูล.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, สำรองข้อมูล!",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กำลังสำรองข้อมูล กรุณารอสักครู่",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const backupResult = await backupData(backupTag);
        setBackupTag("");
        fetchBackups();
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text:
            backupResult.message +
              (backupResult.data ? ` (${backupResult.data})` : "") ||
            "สำรองข้อมูลสำเร็จแล้ว!",
          showConfirmButton: false,
          timer: 1500,
        });
        showToastSuccess({ title: "Success", text: "สำรองข้อมูลสำเร็จแล้ว!" });
      } catch (err: any) {
        console.error("Error during backup:", err);
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด!",
          text: err.response?.data?.error || "เกิดข้อผิดพลาดในการสำรองข้อมูล",
        });
        showToastError({
          title: "Error",
          text: "เกิดข้อผิดพลาดในการสำรองข้อมูล",
        });
      }
    }
  };

  const handleRevertData = async (fileName?: string) => {
    const result = await Swal.fire({
      title: fileName ? `ยืนยันการกู้คืนข้อมูล` : "ยืนยันการย้อนกลับข้อมูล",
      html: `
        <div class="text-left">
          <p class="mb-4">${fileName 
            ? `คุณแน่ใจหรือไม่ว่าต้องการกู้คืนข้อมูลจากไฟล์ <br/><b>${fileName}</b>?<br/><br/>ข้อมูลปัจจุบันจะถูกเขียนทับทั้งหมด.` 
            : "คุณแน่ใจหรือไม่ว่าต้องการย้อนกลับข้อมูลเป็นไฟล์ล่าสุด? ข้อมูลปัจจุบันจะถูกเขียนทับทั้งหมด."
          }</p>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">กรุณากรอก Security Key เพื่อยืนยัน</label>
          </div>
        </div>
      `,
      input: 'password',
      inputPlaceholder: 'กรอก Security Key',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ย้อนกลับข้อมูล!",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      preConfirm: (key) => {
        if (!key) {
          Swal.showValidationMessage('กรุณากรอก Security Key');
          return false;
        }
        return key;
      }
    });

    if (result.isConfirmed) {
      const securityKey = result.value;

      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กำลังย้อนกลับข้อมูล กรุณารอสักครู่",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const revertResult = await restoreDataFromBackup(fileName, securityKey);
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text:
            revertResult.message +
              (revertResult.data ? ` (${revertResult.data})` : "") ||
            "ย้อนกลับข้อมูลสำเร็จแล้ว!",
          showConfirmButton: true, // Changed to true to allow user to see it
        }).then(() => {
          window.location.reload(); // Force reload to see the restored data
        });
        showToastSuccess({
          title: "Success",
          text: "ย้อนกลับข้อมูลสำเร็จแล้ว!",
        });
      } catch (err: any) {
        console.error("Error during data reversion:", err);
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด!",
          text:
            err.response?.data?.error || err.message || "เกิดข้อผิดพลาดในการย้อนกลับข้อมูล",
        });
        showToastError({
          title: "Error",
          text: "เกิดข้อผิดพลาดในการย้อนกลับข้อมูล",
        });
      }
    }
  };

  const handleDownloadBackup = async (fileName: string) => {
    const result = await Swal.fire({
      title: 'ดาวน์โหลดไฟล์สำรอง',
      html: `
        <div class="text-left">
          <p class="mb-4">กรุณากรอก Security Key เพื่อดาวน์โหลดไฟล์ <br/><b>${fileName}</b></p>
        </div>
      `,
      input: 'password',
      inputPlaceholder: 'กรอก Security Key',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "ดาวน์โหลด",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      preConfirm: (key) => {
        if (!key) {
          Swal.showValidationMessage('กรุณากรอก Security Key');
          return false;
        }
        return key;
      }
    });

    if (result.isConfirmed) {
      const securityKey = result.value;

      Swal.fire({
        title: "กำลังเตรียมไฟล์...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const blob = await downloadBackup(fileName, securityKey);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        Swal.close();
        showToastSuccess({
          title: "Success",
          text: "ดาวน์โหลดสำเร็จ",
        });
      } catch (err: any) {
        console.error("Error downloading backup:", err);
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด!",
          text: "Security Key ไม่ถูกต้อง หรือเกิดข้อผิดพลาดในการดาวน์โหลด",
        });
      }
    }
  };

  const handleClearAllData = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการล้างข้อมูลทั้งหมด",
      html: `คุณกำลังจะลบข้อมูลทั้งหมดในระบบของปีนี้ <b>(ยกเว้นข้อมูลผู้ใช้งาน User)</b>!<br/>
             การดำเนินการนี้ไม่สามารถย้อนกลับได้<br/><br/>
             กรุณากรอก Security Key เพื่อยืนยัน`,
      input: 'password',
      inputPlaceholder: 'กรอก Security Key',
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบข้อมูลทั้งหมด!",
      cancelButtonText: "ยกเลิก",
      preConfirm: (key) => {
        if (!key) {
          Swal.showValidationMessage('กรุณากรอก Security Key');
          return false;
        }
        return key;
      }
    });

    if (result.isConfirmed) {
      const securityKey = result.value;
      
      if (originalSecurityKey && securityKey !== originalSecurityKey) {
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'Security Key ไม่ถูกต้อง'
        });
        return;
      }

      Swal.fire({
        title: "กำลังลบข้อมูล...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await clearData();
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: "ล้างข้อมูลทั้งหมดของปีนี้เรียบร้อยแล้ว (เก็บข้อมูลผู้ใช้งาน User ไว้)",
          showConfirmButton: true,
        }).then(() => {
          window.location.reload();
        });
      } catch (err: any) {
        console.error("Error clearing data:", err);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด!",
          text: err.response?.data?.error || "ไม่สามารถลบข้อมูลได้",
        });
      }
    }
  };

  const handleInitYear = async () => {
    if (!newYearInput) {
      showToastError({ title: "Error", text: "กรุณาระบุปีการศึกษา" });
      return;
    }

    const result = await Swal.fire({
      title: "เตรียมระบบสำหรับปีใหม่",
      text: `คุณแน่ใจหรือไม่ว่าต้องการเตรียมระบบสำหรับปี ${newYearInput}? ระบบจะสร้างฐานข้อมูลใหม่และคัดลอกข้อมูลพื้นฐาน (User) ไปยังปีใหม่`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "เริ่มดำเนินการ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กำลังเตรียมฐานข้อมูลใหม่ กรุณารอสักครู่ (ขั้นตอนนี้อาจใช้เวลาสักครู่)",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await initYearDatabase(newYearInput);
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: `เตรียมระบบสำหรับปี ${newYearInput} เรียบร้อยแล้ว!`,
          showConfirmButton: true,
        });
        setNewYearInput("");
        // Reload page or re-fetch years if needed, but the user is likely to just switch year.
        window.location.reload(); 
      } catch (err: any) {
        console.error("Error during year init:", err);
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด!",
          text: err.response?.data?.error || "เกิดข้อผิดพลาดในการเตรียมระบบ",
        });
      }
    }
  };

  const handleDeleteYear = async () => {
    const currentYear = localStorage.getItem("academicYear") || "2569";
    
    const result = await Swal.fire({
      title: `ยืนยันการลบฐานข้อมูลปี ${currentYear}`,
      html: `
        <div class="text-left">
          <p class="mb-2 text-red-600 font-bold">คำเตือน: การกระทำนี้ไม่สามารถย้อนกลับได้!</p>
          <p class="mb-3 text-muted-foreground">คุณกำลังจะลบฐานข้อมูลของปี <b>${currentYear}</b> ทั้งหมด ข้อมูลจะไม่สามารถกู้คืนได้</p>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              กรุณากรอก Security Key เพื่อยืนยันการลบฐานข้อมูล
            </label>
          </div>
        </div>
      `,
      input: 'password',
      inputPlaceholder: 'กรอก Security Key',
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบฐานข้อมูลปีนี้!",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
      preConfirm: (key) => {
        if (!key) {
          Swal.showValidationMessage('กรุณากรอก Security Key');
          return false;
        }
        return key;
      }
    });

    if (result.isConfirmed) {
      const securityKey = result.value;

      if (originalSecurityKey && securityKey !== originalSecurityKey) {
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'Security Key ไม่ถูกต้อง'
        });
        return;
      }

      Swal.fire({
        title: "กำลังลบข้อมูล...",
        text: `กำลังลบฐานข้อมูลของปี ${currentYear} กรุณารอสักครู่`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await deleteYearDatabase(currentYear, securityKey);
        
        // Switch back to a default or reload
        localStorage.removeItem("academicYear");
        
        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ!",
          text: `ฐานข้อมูลของปี ${currentYear} ถูกลบเรียบร้อยแล้ว`,
          showConfirmButton: true,
        }).then(() => {
          window.location.reload();
        });
        
      } catch (err: any) {
        console.error("Error deleting year:", err);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด!",
          text: err.response?.data?.error || err.response?.data?.message || "ไม่สามารถลบข้อมูลได้",
        });
      }
    }
  };

  return (
    <div className="max-w-11/12 mx-auto pb-12">
      {/* Modern Header Banner */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 rounded-xl shadow-md p-6 sm:p-8 mb-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 sm:w-9 sm:h-9" />
              การตั้งค่าระบบ
            </h1>
          </div>
          <p className="text-white/90 text-sm sm:text-base">
            จัดการข้อมูลรอบการจัดกิจกรรม กำหนดเวลารับเค้ก เตรียมระบบสำหรับปีใหม่ และสำรองข้อมูล
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-xs px-4 py-2.5 rounded-lg border border-white/20 self-start md:self-center shrink-0">
          <Calendar className="w-5 h-5 text-white/90" />
          <div className="text-xs">
            <span className="text-white/80 block">ปีการศึกษาปัจจุบัน:</span>
            <span className="font-bold text-base text-white">
              {cakeSettings?.academicYear || localStorage.getItem("academicYear") || "2569"}
            </span>
          </div>
        </div>
      </div>

      {/* Framer Motion Animated Tabs Container */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 p-1.5 bg-muted/80 dark:bg-muted/40 rounded-xl gap-1 border border-border">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer select-none ${
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-settings-tab-pill"
                    className="absolute inset-0 bg-card rounded-lg shadow-xs border border-border/70"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-4 h-4 relative z-10 transition-colors ${
                    isActive ? tab.activeColor : tab.color
                  }`}
                />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* Tab Contents Animated with Framer Motion */}
        {/* ========================================================================= */}
        <AnimatePresence mode="wait">
          {activeTab === "cake" && (
            <motion.div
              key="cake"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-6"
            >
          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-md border border-border border-l-4 border-l-pink-500">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-pink-500" />
                  การตั้งค่ารอบการรับเค้กและเอกสาร
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  กำหนดช่วงวันและเวลาเปิดรับเค้ก ปีเทศกาล และชื่อผู้ลงนามบนเอกสารสรุปยอด
                </p>
              </div>
            </div>

            {isLoadingCakeSettings ? (
              <div className="py-12 text-center text-muted-foreground">
                กำลังโหลดการตั้งค่าระบบ...
              </div>
            ) : cakeSettings ? (
              <form onSubmit={handleSaveCakeSettings} className="space-y-8">
                {/* Section 1: Academic Year and Report Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    ข้อมูลปีเทศกาลและรายงาน
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">ปีการศึกษา (พ.ศ.)</Label>
                      <Input
                        type="text"
                        id="academicYear"
                        placeholder="เช่น 2568"
                        value={cakeSettings.academicYear || ""}
                        onChange={handleSettingsChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        ปีการศึกษาของสถานศึกษา
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentYear">ปีปัจจุบัน / ปีเทศกาลปีใหม่ (พ.ศ.)</Label>
                      <Input
                        type="text"
                        id="currentYear"
                        placeholder="เช่น 2569"
                        value={cakeSettings.currentYear || ""}
                        onChange={handleSettingsChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        ปี พ.ศ. ของเทศกาลเค้กปีใหม่
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reporterName">ชื่อผู้รายงาน (สำหรับหัวรายงาน)</Label>
                      <Input
                        type="text"
                        id="reporterName"
                        placeholder="เช่น นายสมชาย ใจดี"
                        value={cakeSettings.reporterName || ""}
                        onChange={handleSettingsChange}
                      />
                      <p className="text-xs text-muted-foreground">
                        จะปรากฏบนหัวตารางรายงานสรุปยอดเค้ก
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pickup Schedule */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-pink-500" />
                    กำหนดการและเวลารับเค้ก
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="pickupStartDate">วันเริ่มรับเค้ก</Label>
                      <Input
                        type="date"
                        id="pickupStartDate"
                        value={cakeSettings.pickupStartDate || ""}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupEndDate">วันสิ้นสุดรับเค้ก</Label>
                      <Input
                        type="date"
                        id="pickupEndDate"
                        value={cakeSettings.pickupEndDate || ""}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupStartTime">เวลาเริ่มรับเค้ก (HH:mm)</Label>
                      <Input
                        type="text"
                        id="pickupStartTime"
                        placeholder="08:30"
                        pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                        value={cakeSettings.pickupStartTime || ""}
                        onChange={handleSettingsChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupEndTime">เวลาสิ้นสุดรับเค้ก (HH:mm)</Label>
                      <Input
                        type="text"
                        id="pickupEndTime"
                        placeholder="16:30"
                        pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                        value={cakeSettings.pickupEndTime || ""}
                        onChange={handleSettingsChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Security Key */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        ความปลอดภัยระบบ (Security Key)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ใช้สำหรับยืนยันเมื่อทำการสำรองข้อมูล, กู้คืนข้อมูล หรือล้างข้อมูลในระบบ
                      </p>
                    </div>
                    {originalSecurityKey && (
                      <Badge
                        variant="outline"
                        className="w-fit bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-xs py-1 px-2.5"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        ตั้งรหัสผ่านเดิมไว้แล้ว
                      </Badge>
                    )}
                  </div>

                  <div className="bg-muted/30 dark:bg-muted/15 p-5 rounded-xl border border-border space-y-4 max-w-2xl">
                    {originalSecurityKey ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="currentSecurityKey" className="text-sm font-medium flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            รหัสผ่านเดิม (Current Security Key) <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              type={showCurrentKey ? "text" : "password"}
                              id="currentSecurityKey"
                              placeholder="กรอกรหัสผ่านเดิมก่อน เพื่อยืนยันการเปลี่ยนรหัส"
                              value={currentKeyInput}
                              onChange={(e) => {
                                setCurrentKeyInput(e.target.value);
                                setKeyError("");
                              }}
                              className="pr-10 bg-background"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentKey(!showCurrentKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                              title={showCurrentKey ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                            >
                              {showCurrentKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            * ต้องใส่รหัสผ่านเดิมให้ถูกต้องก่อน จึงจะสามารถตั้งรหัสผ่านใหม่ได้
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                          <div className="space-y-2">
                            <Label htmlFor="newSecurityKey" className="text-sm font-medium">
                              รหัสผ่านใหม่ (New Security Key)
                            </Label>
                            <div className="relative">
                              <Input
                                type={showNewKey ? "text" : "password"}
                                id="newSecurityKey"
                                placeholder="ระบุรหัสผ่านใหม่"
                                value={newKeyInput}
                                onChange={(e) => {
                                  setNewKeyInput(e.target.value);
                                  setKeyError("");
                                }}
                                className="pr-10 bg-background"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewKey(!showNewKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                title={showNewKey ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                              >
                                {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmSecurityKey" className="text-sm font-medium">
                              ยืนยันรหัสผ่านใหม่ (Confirm New Key)
                            </Label>
                            <Input
                              type={showNewKey ? "text" : "password"}
                              id="confirmSecurityKey"
                              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                              value={confirmKeyInput}
                              onChange={(e) => {
                                setConfirmKeyInput(e.target.value);
                                setKeyError("");
                              }}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      /* If no key was ever set (first time) */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newSecurityKey" className="text-sm font-medium">
                            กำหนดรหัสผ่านใหม่ (Security Key)
                          </Label>
                          <Input
                            type="password"
                            id="newSecurityKey"
                            placeholder="กำหนดรหัสความปลอดภัยของระบบ"
                            value={newKeyInput}
                            onChange={(e) => {
                              setNewKeyInput(e.target.value);
                              setKeyError("");
                            }}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmSecurityKey" className="text-sm font-medium">
                            ยืนยันรหัสผ่านใหม่ (Confirm)
                          </Label>
                          <Input
                            type="password"
                            id="confirmSecurityKey"
                            placeholder="กรอกรหัสใหม่อีกครั้ง"
                            value={confirmKeyInput}
                            onChange={(e) => {
                              setConfirmKeyInput(e.target.value);
                              setKeyError("");
                            }}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    )}

                    {keyError && (
                      <p className="text-xs text-destructive font-medium flex items-center gap-1.5 bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {keyError}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground italic">
                      * หากไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นว่างช่องรหัสผ่านใหม่ไว้ (ระบบจะใช้รหัสเดิมโดยอัตโนมัติ)
                    </p>
                  </div>
                </div>

                {/* Section 4: Maintenance Mode */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-amber-500" />
                        โหมดปิดปรับปรุงระบบ (Maintenance Mode)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        เมื่อเปิดโหมดนี้ ผู้ใช้ทั่วไป (ครู, นักเรียน, เจ้าหน้าที่) จะไม่สามารถเข้าใช้งานได้ ยกเว้นแอดมิน
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`w-fit text-xs py-1 px-2.5 font-medium ${
                        cakeSettings.isMaintenanceMode
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-700"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                      }`}
                    >
                      {cakeSettings.isMaintenanceMode ? "⚠️ กำลังเปิดโหมดปิดปรับปรุง" : "✓ ระบบเปิดให้บริการปกติ"}
                    </Badge>
                  </div>

                  <div className="bg-muted/30 dark:bg-muted/15 p-5 rounded-xl border border-border space-y-4 max-w-2xl">
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <label
                          htmlFor="maintenance-mode-toggle"
                          className="text-sm font-semibold text-foreground cursor-pointer"
                        >
                          เปิดใช้งานโหมดปิดปรับปรุงระบบ
                        </label>
                        <p className="text-xs text-muted-foreground">
                          เมื่อเปิดใช้งาน ผู้ใช้ทั่วไปจะถูกนำทางไปยังหน้าประกาศปิดปรับปรุงชั่วคราว
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          id="maintenance-mode-toggle"
                          checked={Boolean(cakeSettings.isMaintenanceMode)}
                          onChange={(e) => {
                            setCakeSettings({
                              ...cakeSettings,
                              isMaintenanceMode: e.target.checked,
                            });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {/* Message input */}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <Label htmlFor="maintenanceMessage" className="text-sm font-medium">
                        ข้อความแจ้งเตือนผู้ใช้งาน (Maintenance Message)
                      </Label>
                      <Input
                        type="text"
                        id="maintenanceMessage"
                        placeholder="เช่น ระบบปิดรับการสั่งจองชั่วคราวเพื่อสรุปยอดฝ่ายผลิต สอบถามเพิ่มเติมติดต่อห้องแผนงาน"
                        value={cakeSettings.maintenanceMessage || ""}
                        onChange={handleSettingsChange}
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground">
                        ข้อความนี้จะแสดงบนหน้าจอของผู้ใช้งานเมื่อเปิดโหมดปิดปรับปรุง
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    type="submit"
                    className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700 transition-colors flex items-center gap-2 px-6 font-semibold shadow-sm cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    บันทึกการตั้งค่าทั้งหมด
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-destructive">ไม่สามารถโหลดข้อมูลการตั้งค่าเค้กได้ กรุณาลองใหม่อีกครั้ง</p>
            )}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NEW YEAR ONBOARDING & SETUP GUIDE */}
      {/* ========================================================================= */}
      {activeTab === "new-year" && (
        <motion.div
          key="new-year"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Initialize Database Card */}
          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-md border border-border border-l-4 border-l-amber-500">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              เตรียมฐานข้อมูลสำหรับปีการศึกษาใหม่
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              ใช้สำหรับสร้างฐานข้อมูลเปล่าชุดใหม่เมื่อขึ้นปีการศึกษาใหม่ โดยระบบจะคัดลอกบัญชีผู้ใช้งาน (User) จากปีก่อนหน้าไปให้อัตโนมัติ เพื่อให้ผู้ใช้เดิมยังคงล็อกอินได้
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 rounded-lg bg-muted/40 border border-border max-w-xl">
              <div className="space-y-2 w-full sm:w-auto sm:flex-1">
                <Label htmlFor="newYear">ระบุปีการศึกษาใหม่ (พ.ศ.)</Label>
                <Input
                  type="text"
                  id="newYear"
                  placeholder="เช่น 2570"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  className="bg-background"
                />
              </div>
              <Button
                onClick={handleInitYear}
                className="w-full sm:w-auto bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700 transition-colors flex items-center gap-2 cursor-pointer font-semibold shadow-sm shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                เริ่มระบบปีใหม่
              </Button>
            </div>
          </div>

          {/* 6-Step Setup Guide Checklist */}
          <NewYearSetupGuide currentAcademicYear={cakeSettings?.academicYear} />
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BACKUP & RESTORE */}
      {/* ========================================================================= */}
      {activeTab === "backup" && (
        <motion.div
          key="backup"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-md border border-border border-l-4 border-l-emerald-500">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground flex items-center gap-2">
              <DownloadCloud className="w-6 h-6 text-emerald-500" />
              สำรองและกู้คืนข้อมูล (Backup & Restore)
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              สร้างจุดสำรองข้อมูลเพื่อป้องกันข้อมูลสูญหาย หรือกู้คืนฐานข้อมูลกลับไปยังจุดที่ต้องการ
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Create Backup & Revert */}
              <div className="space-y-6">
                <div className="p-5 rounded-lg border border-border bg-background space-y-4">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    สร้างจุดสำรองข้อมูลใหม่
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="backupTag">ป้ายกำกับ (Tag - สำหรับระบุเพื่อจำง่าย)</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="backupTag"
                        placeholder="เช่น ก่อนเลื่อนชั้นปี, ก่อนสรุปยอด"
                        value={backupTag}
                        onChange={(e) => setBackupTag(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleBackup}
                        className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 transition-colors shrink-0 font-medium"
                      >
                        สำรองข้อมูล
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-lg border border-border bg-muted/40 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Undo2 className="w-4 h-4 text-amber-500" />
                    กู้คืนข้อมูลเป็นไฟล์ล่าสุดทันที
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    ระบบจะนำข้อมูลจากจุดสำรองล่าสุดมาเขียนทับข้อมูลปัจจุบัน (ต้องใช้ Security Key ในการยืนยัน)
                  </p>
                  <Button
                    onClick={() => handleRevertData()}
                    variant="outline"
                    className="w-full border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  >
                    กู้คืนจากไฟล์ล่าสุด
                  </Button>
                </div>
              </div>

              {/* Right Column: Backup History List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-500" />
                    ประวัติไฟล์สำรองข้อมูล ({backups.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchBackups}
                    className="text-xs text-muted-foreground hover:text-foreground h-8"
                  >
                    รีเฟรช
                  </Button>
                </div>

                <div className="max-h-[340px] overflow-y-auto border border-border rounded-lg divide-y divide-border bg-background">
                  {isLoadingBackups ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      กำลังโหลดประวัติไฟล์สำรอง...
                    </div>
                  ) : backups.length > 0 ? (
                    backups.map((file) => (
                      <div
                        key={file}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-xs font-mono text-foreground break-all">
                          {file}
                        </span>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            onClick={() => handleDownloadBackup(file)}
                          >
                            <Download className="w-3.5 h-3.5 mr-1" />
                            ดาวน์โหลด
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            onClick={() => handleRevertData(file)}
                          >
                            กู้คืน
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      ยังไม่มีไฟล์สำรองข้อมูล
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DATABASE & DANGER ZONE */}
      {/* ========================================================================= */}
      {activeTab === "database" && (
        <motion.div
          key="database"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Active Academic Year Switcher */}
          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-md border border-border border-l-4 border-l-blue-500">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-500" />
              สลับเรียกดูข้อมูลปีการศึกษา
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              เลือกปีการศึกษาที่ต้องการเรียกดูหรือจัดการข้อมูลในระบบ ระบบจะสลับบริบทฐานข้อมูลไปยังปีที่เลือกโดยอัตโนมัติ
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-muted/40 border border-border max-w-xl">
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-medium text-muted-foreground">เลือกปีการศึกษา:</span>
                <YearSelector />
              </div>
              <p className="text-xs text-muted-foreground sm:max-w-xs italic">
                * การสลับปีจะมีผลกับข้อมูลตาราง รายงาน และยอดจองทั้งหมดที่แสดงในระบบทันที
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card p-6 sm:p-8 rounded-xl shadow-md border border-destructive/30 border-l-4 border-l-destructive">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <h2 className="text-xl sm:text-2xl font-semibold text-destructive">
                พื้นที่อันตราย (Danger Zone)
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              การดำเนินการในส่วนนี้จะมีผลกระทบถาวรต่อข้อมูลในฐานข้อมูล กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
            </p>

            <div className="space-y-4">
              {/* Action 1: Clear data */}
              <div className="p-4 sm:p-5 rounded-lg border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    ล้างข้อมูลทั้งหมดของปีนี้ (ยกเว้นผู้ใช้)
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    ลบข้อมูลคำสั่งซื้อ, ชั้นเรียน, นักเรียน และสมุดจองของปีการศึกษานี้ทิ้งทั้งหมด แต่จะเก็บบัญชีผู้ใช้ (User) ไว้
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleClearAllData}
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0 gap-1.5"
                >
                  <RefreshCcw className="w-4 h-4" />
                  ล้างข้อมูลปีนี้
                </Button>
              </div>

              {/* Action 2: Delete year */}
              <div className="p-4 sm:p-5 rounded-lg border border-destructive/20 bg-destructive/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-destructive">
                    ลบฐานข้อมูลปีการศึกษานี้ทั้งหมด
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    ลบฐานข้อมูลของปีการศึกษานี้ทิ้งทั้งหมดอย่างถาวร ข้อมูลจะไม่สามารถกู้คืนได้
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteYear}
                  className="shrink-0 gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบฐานข้อมูลปีนี้
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</div>
  );

  async function handleSaveCakeSettings(e: React.FormEvent) {
    e.preventDefault();

    if (!cakeSettings) {
      showToastError({ title: "Error", text: "Cake settings not loaded." });
      return;
    }

    // Validate Security Key if changing
    let keyToSave = originalSecurityKey;

    if (newKeyInput || currentKeyInput || confirmKeyInput) {
      if (originalSecurityKey) {
        if (!currentKeyInput) {
          setKeyError("กรุณากรอกรหัสผ่านเดิมเพื่อยืนยันการเปลี่ยนรหัส");
          showToastError({ title: "ข้อผิดพลาด", text: "กรุณากรอกรหัสผ่านเดิม" });
          return;
        }
        if (currentKeyInput !== originalSecurityKey) {
          setKeyError("รหัสผ่านเดิมไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
          showToastError({ title: "ข้อผิดพลาด", text: "รหัสผ่านเดิมไม่ถูกต้อง" });
          return;
        }
      }

      if (!newKeyInput) {
        setKeyError("กรุณาระบุรหัสผ่านใหม่");
        showToastError({ title: "ข้อผิดพลาด", text: "กรุณาระบุรหัสผ่านใหม่" });
        return;
      }

      if (newKeyInput !== confirmKeyInput) {
        setKeyError("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
        showToastError({ title: "ข้อผิดพลาด", text: "รหัสผ่านใหม่ไม่ตรงกัน" });
        return;
      }

      keyToSave = newKeyInput;
    }

    setKeyError("");

    Swal.fire({
      title: "กำลังบันทึก...",
      text: "กำลังบันทึกการตั้งค่าเค้ก กรุณารอสักครู่",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const settingsData: Partial<ICakeSettings> = {
      ...cakeSettings,
      securityKey: keyToSave || undefined,
      isMaintenanceMode: Boolean(cakeSettings.isMaintenanceMode),
      maintenanceMessage: cakeSettings.maintenanceMessage || "",
      // Ensure dates are sent in ISO format if they are provided
      pickupStartDate: cakeSettings.pickupStartDate
        ? new Date(cakeSettings.pickupStartDate).toISOString()
        : undefined,
      pickupEndDate: cakeSettings.pickupEndDate
        ? new Date(cakeSettings.pickupEndDate).toISOString()
        : undefined,
      reporterName: cakeSettings.reporterName || "", // Ensure string, never null
    };

    try {
      // createCakeSettings is used for both creating and updating in the backend
      const savedSettings = await createCakeSettings(settingsData);
      console.log("Frontend: Saved settings received:", savedSettings.data); // Log actual data

      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: savedSettings.message || "บันทึกการตั้งค่าเค้กสำเร็จแล้ว!",
        showConfirmButton: false,
        timer: 1500,
      });
      showToastSuccess({
        title: "Success",
        text: savedSettings.message || "บันทึกการตั้งค่าเค้กสำเร็จแล้ว!",
      });

      // Directly update the local state with the returned settings for immediate UI reflection
      setOriginalSecurityKey(savedSettings.data.securityKey || keyToSave || null);
      setCurrentKeyInput("");
      setNewKeyInput("");
      setConfirmKeyInput("");
      setCakeSettings({
        ...savedSettings.data,
        pickupStartDate: savedSettings.data.pickupStartDate
          ? savedSettings.data.pickupStartDate.split("T")[0]
          : "",
        pickupEndDate: savedSettings.data.pickupEndDate
          ? savedSettings.data.pickupEndDate.split("T")[0]
          : "",
      });

      // No need to re-fetch settings, as we've updated the state directly
      // fetchCakeSettings();
    fetchBackups();
    } catch (err: any) {
      console.error("Error saving cake settings:", err);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด!",
        text:
          err.response?.data?.error ||
          "เกิดข้อผิดพลาดในการบันทึกการตั้งค่าเค้ก",
      });
      showToastError({
        title: "Error",
        text: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่าเค้ก",
      });
    }
  }
};

export default SettingsPage;
