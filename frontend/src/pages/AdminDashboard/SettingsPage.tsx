import { useState, useEffect, useCallback } from "react";
import { Settings, DownloadCloud, Undo2, Sparkles, Database, Trash2, History, FileText, Download, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const SettingsPage: React.FC = () => {
  const [cakeSettings, setCakeSettings] = useState<ICakeSettings | null>(null);
  const [isLoadingCakeSettings, setIsLoadingCakeSettings] = useState(true);
  const [newYearInput, setNewYearInput] = useState("");
  const [backups, setBackups] = useState<string[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [backupTag, setBackupTag] = useState("");
  const [originalSecurityKey, setOriginalSecurityKey] = useState<string | null>(null);

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
      title: "ยืนยันการเคลียร์ข้อมูลทั้งหมด",
      html: `คุณกำลังจะลบข้อมูล <b>ห้องเรียน และ ออเดอร์ทั้งหมด</b> ของปีนี้!<br/>
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
          text: "ลบข้อมูลห้องเรียนและออเดอร์ทั้งหมดเรียบร้อยแล้ว",
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
      text: `คุณแน่ใจหรือไม่ว่าต้องการเตรียมระบบสำหรับปี ${newYearInput}? ระบบจะสร้างฐานข้อมูลใหม่และคัดลอกข้อมูลพื้นฐาน (User, Teacher, Product) ไปยังปีใหม่`,
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
        title: `ยืนยันการลบข้อมูลปี ${currentYear}`,
        html: `คุณกำลังจะลบฐานข้อมูลของปี <b>${currentYear}</b> ทั้งหมด!<br/>
               ข้อมูลจะไม่สามารถกู้คืนได้<br/><br/>
               กรุณาพิมพ์ <b>${currentYear}</b> เพื่อยืนยัน`,
        input: 'text',
        inputPlaceholder: `พิมพ์ ${currentYear}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "ลบข้อมูลเดี๋ยวนี้!",
        cancelButtonText: "ยกเลิก",
        preConfirm: (inputValue) => {
            if (inputValue !== currentYear) {
                Swal.showValidationMessage(`กรุณาพิมพ์ ${currentYear} ให้ถูกต้อง`);
            }
        }
      });
  
      if (result.isConfirmed) {
        Swal.fire({
          title: "กำลังลบข้อมูล...",
          text: "กำลังลบฐานข้อมูล กรุณารอสักครู่",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
  
        try {
          await deleteYearDatabase(currentYear);
          
          // Switch back to a default or reload
          localStorage.removeItem("academicYear");
          
          Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ!",
            text: `ข้อมูลปี ${currentYear} ถูกลบเรียบร้อยแล้ว`,
            showConfirmButton: true,
          }).then(() => {
              window.location.reload();
          });
          
        } catch (err: any) {
          console.error("Error deleting year:", err);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด!",
            text: err.response?.data?.error || "ไม่สามารถลบข้อมูลได้",
          });
        }
      }
    };

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-sm shadow-md p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Settings className="w-10 h-10 mr-4 text-white" />
              การตั้งค่าระบบ
            </h1>
            <p className="text-white text-lg">จัดการการตั้งค่าทั่วไปของระบบ</p>
          </div>
        </div>
      </div>

      {/* Switch Academic Year Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-500" />
          เรียกดูข้อมูลปีการศึกษา
        </h2>
        <p className="text-gray-600 mb-6">
          เลือกปีการศึกษาที่ต้องการเรียกดูหรือจัดการข้อมูล ระบบจะสลับไปยังฐานข้อมูลของปีที่เลือกโดยอัตโนมัติ
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-[150px]">
              <YearSelector />
            </div>
            <span className="text-sm text-muted-foreground italic">
              * การเปลี่ยนปีจะมีผลกับข้อมูลทั้งหมดในระบบ
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClearAllData}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <RefreshCcw className="w-4 h-4" />
              ล้างข้อมูลห้อง/ออเดอร์
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteYear}
              className="flex items-center gap-2 text-white"
            >
              <Trash2 className="w-4 h-4" />
              ลบข้อมูลปีนี้
            </Button>
          </div>
        </div>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-green-500">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          <DownloadCloud className="w-6 h-6 mr-2 text-green-500" />
          สำรองและกู้คืนข้อมูล
        </h2>
        <p className="text-gray-600 mb-6">
          คุณสามารถสำรองข้อมูลทั้งหมดของระบบได้ที่นี่ การสำรองข้อมูลเป็นสิ่งสำคัญเพื่อป้องกันข้อมูลสูญหาย
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              สร้างจุดสำรองข้อมูลใหม่
            </h3>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="backupTag">ป้ายกำกับ (Tag - เช่น 2568, Pre-Promotion)</Label>
                <Input
                  id="backupTag"
                  placeholder="ระบุข้อความสั้นๆ เพื่อให้จำง่าย"
                  value={backupTag}
                  onChange={(e) => setBackupTag(e.target.value)}
                />
              </div>
              <Button
                onClick={handleBackup}
                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
              >
                สำรองข้อมูล
              </Button>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-100">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Undo2 className="w-4 h-4" />
                หรือย้อนกลับเป็นไฟล์ล่าสุดทันที:
              </p>
              <Button
                onClick={() => handleRevertData()}
                variant="outline"
                className="mt-2 w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                กู้คืนจากไฟล์ล่าสุด
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              ประวัติการสำรองข้อมูล
            </h3>
            <div className="max-h-[250px] overflow-y-auto border rounded-md divide-y">
              {isLoadingBackups ? (
                <div className="p-4 text-center text-gray-400">กำลังโหลด...</div>
              ) : backups.length > 0 ? (
                backups.map((file) => (
                  <div key={file} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-mono text-gray-700 break-all">{file}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0"
                        onClick={() => handleDownloadBackup(file)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        โหลด
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 shrink-0"
                        onClick={() => handleRevertData(file)}
                      >
                        กู้คืน
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">ไม่พบไฟล์สำรองข้อมูล</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Initialize New Year Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-amber-500">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
          <Sparkles className="w-6 h-6 mr-2 text-amber-500" />
          เตรียมระบบสำหรับปีการศึกษาใหม่
        </h2>
        <p className="text-gray-600 mb-6">
          ใช้สำหรับสร้างฐานข้อมูลใหม่เมื่อเริ่มปีการศึกษาใหม่ ระบบจะคัดลอกข้อมูลพื้นฐานเช่น รายชื่อครู, แผนก, สินค้า และผู้ใช้งาน ไปยังฐานข้อมูลปีใหม่ให้โดยอัตโนมัติ
        </p>
        <div className="flex items-end gap-4">
          <div className="space-y-2 max-w-[200px]">
            <Label htmlFor="newYear">ระบุปีการศึกษา (เช่น 2570)</Label>
            <Input
              type="text"
              id="newYear"
              placeholder="25XX"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
            />
          </div>
          <Button
            onClick={handleInitYear}
            className="bg-amber-600 text-white hover:bg-amber-700 transition-colors duration-200 flex items-center cursor-pointer"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            เริ่มระบบปีใหม่
          </Button>
        </div>
      </div>

      {/* Cake Settings Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-pink-500">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          การตั้งค่าระบบ
        </h2>
        {isLoadingCakeSettings ? (
          <p>Loading cake settings...</p>
        ) : cakeSettings ? (
          <form onSubmit={handleSaveCakeSettings}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="academicYear">ปีการศึกษา</Label>
                <Input
                  type="text"
                  id="academicYear"
                  value={cakeSettings.academicYear || ""}
                  onChange={handleSettingsChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentYear">ปีปัจจุบัน</Label>
                <Input
                  type="text"
                  id="currentYear"
                  value={cakeSettings.currentYear || ""}
                  onChange={handleSettingsChange}
                />
              </div>
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
                <Label htmlFor="pickupStartTime">เวลารับเค้ก (เริ่มต้น) (HH:mm)</Label>
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
                <Label htmlFor="pickupEndTime">เวลารับเค้ก (สิ้นสุด) (HH:mm)</Label>
                <Input
                  type="text"
                  id="pickupEndTime"
                  placeholder="16:30"
                  pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                  value={cakeSettings.pickupEndTime || ""}
                  onChange={handleSettingsChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reporterName">ชื่อผู้รายงาน (สำหรับหัวตารางรายงาน)</Label>
                <Input
                  type="text"
                  id="reporterName"
                  placeholder="เช่น นายสมชาย ใจดี"
                  value={cakeSettings.reporterName || ""}
                  onChange={handleSettingsChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityKey">Security Key (สำหรับสำรอง/กู้คืนข้อมูล)</Label>
                <Input
                  type="password"
                  id="securityKey"
                  placeholder="********"
                  value={cakeSettings.securityKey || ""}
                  onChange={handleSettingsChange}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 flex items-center cursor-pointer"
            >
              บันทึกการตั้งค่า
            </Button>
          </form>
        ) : (
          <p>Failed to load cake settings. Please try again.</p>
        )}
      </div>
    </div>
  );

  async function handleSaveCakeSettings(e: React.FormEvent) {
    e.preventDefault();

    if (!cakeSettings) {
      showToastError({ title: "Error", text: "Cake settings not loaded." });
      return;
    }

    // If security key is being changed, ask for the old one
    const isKeyChanged = cakeSettings.securityKey !== originalSecurityKey;
    if (isKeyChanged) {
      const { value: oldKey } = await Swal.fire({
        title: 'ยืนยันการเปลี่ยน Security Key',
        text: 'กรุณากรอก Security Key เดิมเพื่อยืนยันการเปลี่ยนแปลง',
        input: 'password',
        inputPlaceholder: 'กรอก Security Key เดิม',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        preConfirm: (value) => {
          if (!value) {
            Swal.showValidationMessage('กรุณากรอก Security Key เดิม');
          }
          return value;
        }
      });

      if (!oldKey) return;

      // Simple frontend check if we have it loaded, or we let the backend handle the verification
      // But we don't have a verify endpoint, so we might need one or just pass it to the backend.
      // For now, let's assume we want to verify it against what we loaded.
      if (originalSecurityKey && oldKey !== originalSecurityKey) {
        Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'Security Key เดิมไม่ถูกต้อง'
        });
        return;
      }
    }

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
      setOriginalSecurityKey(savedSettings.data.securityKey || null);
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
