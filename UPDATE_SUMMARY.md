# สรุปรายการอัปเดตระบบ NVC Cake Project

เอกสารนี้สรุปรายการเปลี่ยนแปลงและฟีเจอร์ที่ได้รับการอัปเดตทั้งหมดในระบบ ทั้งฝั่ง **Backend** และ **Frontend**

---

## 1. ระบบเตรียมฐานข้อมูลสำหรับปีการศึกษาใหม่ (New Academic Year Initialization)

### 1.1 ปรับการคัดลอกข้อมูลให้ดึงเฉพาะตาราง `User`
* **เหตุผล**: สำหรับปีการศึกษาใหม่ ระบบต้องการเริ่มต้นข้อมูลวิชาการ/การจัดการใหม่ทั้งหมด แต่คงบัญชีผู้ใช้งานไว้
* **สิ่งที่เปลี่ยนแปลง**:
  * ยกเลิกการคัดลอกข้อมูลตาราง `Department`, `Teacher`, `Product`, และ `GradeLevel` ไปยังปีใหม่
  * ดึงและคัดลอกเฉพาะข้อมูลในตาราง `User` เท่านั้น
  * กำหนดค่า `teacher_id = null` สำหรับบัญชีผู้ใช้ที่คัดลอกไปยังปีใหม่ เพื่อป้องกันข้อผิดพลาด Foreign Key Constraint ใน PostgreSQL เนื่องจากตาราง `Teacher` ในปีใหม่ยังไม่มีข้อมูล
  * คัดลอกการตั้งค่าเริ่มต้นของ `CakeSettings` พร้อมระบุ `academicYear` และ `currentYear` ให้ตรงกับปีใหม่ที่สร้าง

### 1.2 ปรับข้อความยืนยันในหน้าการตั้งค่า (Frontend)
* ปรับข้อความแจ้งเตือน SweetAlert2 เมื่อคลิกเตรียมระบบปีใหม่:
  > *"คุณแน่ใจหรือไม่ว่าต้องการเตรียมระบบสำหรับปี {ปีการศึกษา}? ระบบจะสร้างฐานข้อมูลใหม่และคัดลอกข้อมูลพื้นฐาน (User) ไปยังปีใหม่"*
* ปรับคำอธิบายใต้หัวข้อ "เตรียมระบบสำหรับปีการศึกษาใหม่" ในหน้า Settings ให้สอดคล้องกัน

---

## 2. ระบบจัดการผู้ใช้งาน (`/dashboard/users`)

เพิ่มความสามารถให้ผู้ดูแลระบบ (Admin) สามารถเพิ่มและจัดการผู้ใช้งานได้ 2 ประเภท พร้อมระบบ Sync ข้ามปีการศึกษา:
1. **ผู้ใช้งานทั่วไป (General User)**
2. **ครูที่ต้องกรอกข้อมูลเค้ก (Teacher / Cake Order Entry)**

### 2.1 ฟอร์มเพิ่ม/แก้ไขผู้ใช้งาน (`UserFormModal.tsx`)
* **ตัวเลือกประเภทบัญชีผู้ใช้ (Account Type Switcher)**:
  * 👤 **ผู้ใช้งานทั่วไป**: สำหรับเจ้าหน้าที่ (Officer 1/2), ผู้บริหาร (Admin), หรือผู้ดูแลระบบ (Superadmin) สามารถกำหนดบทบาทได้อิสระ และไม่ผูกกับข้อมูลครู (`teacher_id: null`)
  * 🎓 **ครูที่ต้องกรอกข้อมูลเค้ก**: สำหรับครูประจำชั้น/ที่ปรึกษาที่ต้องเข้าสู่ระบบเพื่อสั่งจองเค้กและจัดการสมุดเค้กประจำห้อง
* **การจัดการข้อมูลครู (เมื่อเลือกประเภท "ครูที่ต้องกรอกข้อมูลเค้ก")**:
  * **เลือกจากรายชื่อครูในระบบ (Existing Teacher)**:
    * ดึงรายชื่อครูทั้งหมดพร้อมแผนกวิชามาให้เลือก
    * เมื่อเลือกครู ระบบจะดึงชื่อและนามสกุลมาเติมในฟอร์มอัตโนมัติ (สามารถปรับแก้ได้)
    * ผูก `teacher_id` เข้ากับบัญชีผู้ใช้
  * **+ เพิ่มครูใหม่ในระบบ (New Teacher)**:
    * แก้ปัญหาปีการศึกษาใหม่ที่เพิ่งเปิดและยังไม่มีข้อมูลครูในระบบ แอดมินสามารถพิมพ์ชื่อ-นามสกุลครู และเลือกแผนกวิชาเพื่อสร้างข้อมูลครูลงฐานข้อมูล และผูกบัญชีได้ทันทีในขั้นตอนเดียว
  * **กำหนดบทบาทอัตโนมัติ**: บัญชีครูจะถูกล็อกบทบาทเป็น `USER (ผู้ใช้งาน)` เพื่อให้สอดคล้องกับสิทธิ์การเข้าหน้าสั่งจองเค้กของห้องเรียน

### 2.2 ตารางแสดงข้อมูลผู้ใช้งาน (`UsersTable.tsx`)
* เพิ่ม Badge และสัญลักษณ์ระบุชัดเจน:
  * บัญชีครู: แสดง Badge `ครูที่ต้องกรอกข้อมูลเค้ก` พร้อมแท็กสัญลักษณ์ `ครูสั่งเค้ก` และแสดงชื่อครูพร้อมแผนกวิชาใต้ชื่อผู้ใช้
  * บัญชีทั่วไป: แสดง Badge บทบาทตามปกติ (ผู้ใช้งานทั่วไป, เจ้าหน้าที่จ่ายเค้ก, เจ้าหน้าที่จัดเค้ก, ผู้บริหาร, ผู้ดูแลระบบ)
* รองรับการเปิดแก้ไข (Edit) เพื่อสลับประเภทบัญชี หรือเปลี่ยนครูที่ผูกไว้ได้

### 2.3 แถบตัวกรองในหน้ารายการผู้ใช้งาน (`Users.tsx`)
* เพิ่ม Filter Pills ด้านบนตารางเพื่อความสะดวกรวดเร็วในการค้นหา:
  * **ทั้งหมด** (แสดงจำนวนผู้ใช้ทั้งหมด)
  * **ครูที่ต้องกรอกข้อมูลเค้ก** (กรองเฉพาะผู้ใช้ที่มีการผูกกับข้อมูลครู)
  * **ผู้ใช้งานทั่วไป** (กรองเฉพาะ Role USER ที่ไม่ได้ผูกกับครู)
  * **เจ้าหน้าที่ / ผู้บริหาร** (กรองเฉพาะ Role Officer1, Officer2, Admin, Superadmin)

---

## 3. ระบบซิงค์ข้อมูลผู้ใช้งานข้ามปีการศึกษาอัตโนมัติ (Cross-Database User Synchronization)

เมื่อมีการเปลี่ยนแปลงข้อมูลผู้ใช้ในหน้า `/dashboard/users` ไม่ว่าจะอยู่ในปีการศึกษาใด ระบบจะอัปเดตไปยังฐานข้อมูลของทุกปีการศึกษา (`nvccake`, `nvccake_2568`, `nvccake_2569`, ฯลฯ) ให้ตรงกันทันที:
* **การสร้างผู้ใช้ใหม่ (Create)**:
  * สร้างผู้ใช้ในทุกปีการศึกษาด้วย `id`, `username`, `password` (hashed), `role`, `firstname`, `lastname`, และ `email` เดียวกัน
  * หากมีผู้ใช้อยู่แล้วในฐานข้อมูลปีนั้น จะอัปเดตข้อมูลให้ตรงกัน
  * ตรวจสอบความถูกต้องของ `teacher_id` ในแต่ละฐานข้อมูลปีนั้นๆ เพื่อป้องกัน foreign key error
* **การแก้ไขข้อมูลผู้ใช้ (Update)**:
  * ซิงค์ทั้ง **ชื่อ-นามสกุล, ชื่อผู้ใช้ (Username), อีเมล, รหัสผ่านใหม่, และบทบาท (Role)** ไปยังทุกฐานข้อมูล
  * ค้นหาผู้ใช้จากทั้ง `userId` และ `username` เดิม ทำให้เปลี่ยน username ได้อย่างปลอดภัย
  * หากพบว่าผู้ใช้ยังไม่มีอยู่ในฐานข้อมูลของบางปี ระบบจะสร้างผู้ใช้คนนั้นขึ้นให้อัตโนมัติ เพื่อให้รายชื่อผู้ใช้ทุกปีตรงกันเสมอ
* **การลบผู้ใช้ (Delete)**:
  * ซิงค์การลบผู้ใช้และ Token ไปยังทุกปีการศึกษา
  * มีระบบตรวจสอบประวัติการสั่งซื้อ (Orders) หากปีใดมีประวัติการสั่งซื้อที่เกี่ยวข้องกับผู้ใช้นั้น จะข้ามการลบในฐานข้อมูลปีนั้นเพื่อป้องกันข้อมูลประวัติเสียหาย

---

## 4. ระบบซิงค์ Security Key ข้ามทุกปีการศึกษา (`/dashboard/settings`)

* **การทำงาน**:
  * เมื่อแอดมินแก้ไข **Security Key** ในหน้า `/dashboard/settings` และกดยืนยันบันทึก ระบบจะซิงค์ Security Key ใหม่นี้ไปยังฐานข้อมูลของ **ทุกปีการศึกษา** และฐานข้อมูลหลัก (`nvccake`) ทันที
  * ทำให้การใส่ Security Key เพื่อดาวน์โหลดไฟล์สำรอง (Backup), กู้คืนข้อมูล (Restore), หรือล้างข้อมูล มีค่าตรงกันและใช้งานได้เหมือนกันในทุกปีการศึกษา ไม่ว่าจะกำลังเปิดใช้งานปีใดอยู่ก็ตาม
* **หน้า Frontend (`SettingsPage.tsx`)**:
  * เพิ่มข้อความระบุชัดเจนใต้ช่องกรอก Security Key: *"เมื่อบันทึกการเปลี่ยน Security Key ระบบจะอัปเดตไปยังฐานข้อมูลทุกปีการศึกษาโดยอัตโนมัติ"*
  * ปรับข้อความยืนยัน SweetAlert2 เมื่อเปลี่ยนรหัสผ่าน ให้แจ้งเตือนว่าการเปลี่ยนแปลงนี้จะมีผลกับทุกปีการศึกษา

---

## 5. การแก้ไขปัญหาหัวกระดาษพิมพ์ยอดการสั่งจองเค้ก (`/dashboard/sales-records`)

* **ปัญหาเดิม**:
  * เมื่อกดปุ่ม "พิมพ์ยอดการสั่งจอง" ในปีการศึกษาที่เลือก (เช่น ปี 2568) แต่ในหัวรายงานพิมพ์แสดงเป็นปีปัจจุบัน (ปีใหม่ 2570 ดำเนินการประจำปี 2569)
  * สาเหตุเกิดจาก component ตารางที่ render ในหน้าต่างพิมพ์ (iframe) ทำการโหลด `getCakeSettings()` แบบ asynchronous และในจังหวะเริ่มต้นก่อนโหลดเสร็จ ระบบใช้ค่า Fallback จากวันที่ปัจจุบันของเครื่อง `new Date().getFullYear() + 543` ทำให้แสดงเป็นปีปัจจุบันแทนปีที่เลือก
* **การแก้ไข**:
  * ส่งค่า `academicYear` และ `newYear` จากปีที่เลือกอยู่ในขณะนั้น (`localStorage.getItem("academicYear")` หรือการตั้งค่าของปีนั้น) ส่งต่อเป็น Props ตรงไปยัง `PrintableSalesRecordsContent` และ `SalesRecordsTable`
  * ทำให้การพิมพ์ใน iframe ได้รับปีการศึกษาที่ถูกต้องทันทีแบบ synchronous โดยไม่ต้องรอโหลดและไม่ตกหล่นไปเป็นปีปัจจุบัน
  * แก้ไขคำผิดในหัวกระดาษจาก "วิทยาลัยอาชีวศึกษาครปฐม" เป็น "วิทยาลัยอาชีวศึกษานครปฐม"

---

## 6. การซ่อนแถบหัวระบบและแถบแจ้งเตือนโหมดย้อนหลังเมื่อสั่งพิมพ์ (`/dashboard/leaderboard`)

* **ปัญหาเดิม**:
  * เมื่อคลิกปุ่ม "พิมพ์หน้านี้" ในหน้า Leaderboard (`/dashboard/leaderboard`) แถบหัวระบบด้านบน (`แผงควบคุมระบบ (Admin) / ปีปัจจุบัน...`) และแถบแจ้งเตือนสีส้ม (`⚠️ โหมดดูข้อมูลย้อนหลัง: คุณกำลังดูข้อมูลของปีการศึกษา 2568...`) ติดเข้าไปอยู่ในหน้าพิมพ์ (Print Preview) ด้านบนสุดของหน้า 1
* **การแก้ไข**:
  * เพิ่มคลาส `print:hidden` ให้กับแท็ก `<header>` (แถบด้านบนของ Dashboard) และแถบแจ้งเตือนโหมดดูข้อมูลย้อนหลังใน [`DashboardLayout.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/layout/DashboardLayout.tsx)
  * ปรับ `<main>` ให้มี `print:p-0` เพื่อไม่ให้มี Padding ส่วนเกินเมื่อพิมพ์
  * เพิ่มกฎ CSS ซ่อน `header`, `[class*="print:hidden"]`, และ `.print\:hidden` ใน [`print.css`](file:///Users/macos/Desktop/nvccake_project/frontend/src/styles/print.css) และในสไตล์ `@media print` ภายใน [`LeaderboardPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/LeaderboardPage.tsx)
  * ปรับ Fallback ของ `displayAcademicYear` ใน [`LeaderboardPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/LeaderboardPage.tsx) ให้ดึงจากปีที่เลือกใน `localStorage` เป็นอันดับแรก เพื่อความแม่นยำของหัวตารางพิมพ์

---

## 7. ปรับปรุงการพิมพ์รายงานรายชื่อนักเรียนในห้องเรียนเป็นแนวตั้งและจัด Layout อัตโนมัติ (`/dashboard/classrooms/:id`)

* **สิ่งที่เปลี่ยนแปลง**:
  * **ปรับปุ่ม "รายชื่อนักเรียน"**:
    * เปลี่ยนจากการเรียก `window.print()` แบบเดิม มาใช้ `printSection` แยกพิมพ์เฉพาะส่วนรายงานรายชื่อนักเรียน (`#printable-classroom-students-section`)
    * กำหนดการตั้งค่าหน้าพิมพ์อัตโนมัติเป็น **แนวตั้ง (Portrait)** กระดาษ **A4** พร้อมสเกลและ Margin ขอบกระดาษที่เหมาะสม (`12mm 15mm 15mm 15mm`)
  * **จัดระเบียบ Layout รายงานรายชื่อนักเรียน ([`ClassroomStudentPrintReport.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/dashboard/reports/ClassroomStudentPrintReport.tsx))**:
    * **ปรับความกระชับ (Compact Header)**: รวมหัวเรื่องและปีการศึกษาให้อยู่ในบล็อกที่กะทัดรัด ลดระยะห่างแนวตั้ง (Margin / Padding) ของส่วนหัวลง เพื่อประหยัดพื้นที่กระดาษ
    * **การ์ดข้อมูลห้องเรียน**: ปรับขนาด Padding และระยะห่างของแถวให้กระชับ เพื่อให้ตารางรายชื่อนักเรียนขยับขึ้นมา
    * **ตารางรายชื่อนักเรียน**: ปรับระยะ Padding ในแถว (`py-[3px]`) และขนาดตัวอักษรให้พอดี เพื่อรองรับนักเรียนทั้งห้อง (33-40 คน) ให้สามารถจัดพิมพ์รวมอยู่ในหน้าเดียว (Single Page A4) ได้อย่างครบถ้วน
    * **ส่วนลงชื่อผู้รายงาน**: จัดบล็อกลายเซ็นครูประจำชั้น / ครูที่ปรึกษา ให้กระชับพอดีที่ท้ายตารางหน้าแรก

---

## 8. ลบเส้นกรอบ (Border) นอกสุดของรายงานผลการเข้าร่วมกิจกรรม (`/dashboard/classrooms-report`)

* **ปัญหาเดิม**:
  * เมื่อคลิกปุ่ม "พิมพ์รายงาน" (ปุ่มสีน้ำเงิน) จะมีเส้นขอบกรอบสี่เหลี่ยมสีดำ (`.print-table-wrapper`) ล้อมรอบทั้งหัวเอกสาร, ตัวตาราง, และบล็อกลงนามด้านล่าง
* **การแก้ไข**:
  * ลบกรอบนอกสุดใน [`ClassroomTable.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/classrooms/ClassroomTable.tsx) สำหรับโหมดพิมพ์: ปรับเป็น `border-0 print:border-none shadow-none print:shadow-none`
  * อัปเดต [`print.css`](file:///Users/macos/Desktop/nvccake_project/frontend/src/styles/print.css):
    * กำหนดให้ `.print-table-wrapper` มี `border: none !important;` และ `box-shadow: none !important;`
    * กำหนดให้ `.print-table-title` มี `border: none !important;` และ `border-bottom: none !important;` เพื่อให้หัวเรื่องแสดงผลอย่างเป็นธรรมชาติเหนือตารางโดยไม่มีกรอบล้อม
  * ส่ง `customStyles` ตรงในฟังก์ชัน `handlePrintClassroomsReport` ภายใน [`ClassroomsReport.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/ClassroomsReport.tsx) เพื่อให้หน้าต่างพิมพ์ (iframe) ปิดการแสดงกรอบนอกสุดอย่างแน่นอน

---

## 9. พัฒนาระบบตรวจสอบรายชื่อนักเรียนสำหรับครูที่กรอกข้อมูล / ครูที่ปรึกษา (`/classroom`)

* **ความต้องการ**:
  * สร้างหน้า `/classroom` เพื่อให้ครูประจำชั้น/ครูที่ปรึกษาสามารถตรวจสอบรายชื่อนักเรียนและติดตามยอดการสั่งจองเค้กของห้องเรียนตัวเองได้
  * หากครูเป็นที่ปรึกษาหลายห้อง ให้แสดงหน้าเลือกห้องเรียนในรูปแบบ **การ์ด (Card)** ก่อน
* **การพัฒนาและสิ่งที่เปลี่ยนแปลง**:
  * **สร้างหน้าเลือกห้องเรียน ([`TeacherClassroomPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/TeacherClassroomPage.tsx))**:
    * แสดงห้องเรียนในรูปแบบ **การ์ด (Card)** พร้อมข้อมูลระดับชั้น, แผนกวิชา, จำนวนนักเรียน, ยอดเค้กรวม (ปอนด์), และสถิตินักเรียนที่สั่งเค้กแล้ว
    * เมื่อคลิกที่การ์ดห้องเรียน (หรือปุ่มดูรายชื่อนักเรียน) ระบบจะนำทาง (Navigate) ไปยังหน้า **`/my-classroom/:id/students`** โดยตรงทันที
  * **เชื่อมโยงหน้ารายชื่อนักเรียน ([`ClassroomStudentsPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/ClassroomStudentsPage.tsx))**:
    * หน้ารายชื่อนักเรียนแสดงข้อมูลนักเรียน, การเพิ่มนักเรียน, ดูออเดอร์, และปุ่มพิมพ์รายงาน A4 แนวตั้ง
    * ปุ่ม "กลับหน้าห้องเรียน" จะพากลับมาที่หน้า `/classroom` โดยอัตโนมัติ
  * **ลงทะเบียน Route ([`router.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/router.ts))**:
    * เพิ่มเส้นทาง `/classroom` และปลดล็อกให้ `/my-classroom/$classroomId/students` รองรับทั้งผู้ใช้ทั่วไป (`USER`) และผู้ดูแลระบบ (`ADMIN`, `SUPERADMIN`)
  * **เพิ่มเมนูนำทางใน Navbar ([`Navbar.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/layout/Navbar.tsx))**:
    * เพิ่มปุ่ม "รายชื่อนักเรียน" พร้อมไอคอน `GraduationCap` บนแถบ Navbar หลัก เพื่อให้ครูกดเข้าใช้งานได้ทันที

---

## 10. รวมระบบสรุปยอดเค้กและล็อคห้องเรียนไว้ในหน้ารายชื่อนักเรียน (`/my-classroom/:id/students`)

* **ที่มาและความต้องการ**:
  * เดิมครูต้องเข้าหน้า `/classroom-cake-summary` แยกต่างหากเพื่อกดยืนยันสรุปยอดเค้กทั้งหมดของห้อง ทำให้การใช้งานซ้ำซ้อน
  * รวบยอดขั้นตอนการทำงานให้จบในที่เดียว: เมื่อครูเข้าดูรายชื่อนักเรียนและยอดจองในห้องตนเองแล้ว สามารถกดยืนยันสรุปยอดเค้กและล็อคห้องได้ทันที
* **สิ่งที่เปลี่ยนแปลง**:
  * **ปุ่มสรุปยอดเค้ก (ล็อคห้อง) ใน [`ClassroomStudentsPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/ClassroomStudentsPage.tsx)**:
    * เพิ่มปุ่ม **"สรุปยอดเค้ก (ล็อคห้อง)"** ด้านบนตาราง พร้อมระบบยืนยัน (Confirmation Dialog) เตือนว่า *"เมื่อสรุปยอดแล้วจะไม่สามารถแก้ไขหรือเพิ่มนักเรียนได้อีก"*
    * เมื่อกดยืนยัน ระบบจะเรียก API ล็อคห้องเรียน (`PATCH /data/classroom-cake-summary/:classroomId/finalize`) และรีเฟรชข้อมูลอัตโนมัติ
    * เมื่อห้องถูกสรุปยอดแล้ว ปุ่มจะเปลี่ยนสถานะเป็น Badge สีเขียว **"สรุปยอดเค้กแล้ว (ห้องถูกล็อค)"** พร้อมไอคอนกุญแจล็อค
    * ปิดการใช้งาน (Disable) ปุ่มเพิ่มนักเรียน, ปุ่มแก้ไข, และปุ่มลบนักเรียน เมื่อห้องเรียนถูกล็อคแล้ว
  * **จัดระเบียบ Navbar ([`Navbar.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/layout/Navbar.tsx))**:
    * นำปุ่มลิงก์ `/classroom-cake-summary` ออกจากแถบเมนูด้านบน เพื่อลดความสับสน
    * เมนูสำหรับครูจะเหลือเพียง **"ค้นหาออเดอร์"** (`/order-search`) และ **"รายชื่อนักเรียน"** (`/classroom`) ที่เข้าถึงข้อมูลห้องเรียนและสั่งพิมพ์/ล็อคยอดได้ครบวงจร

---

## 11. ปรับโทนสีปุ่มและการแจ้งเตือน (Notifications / Modal Dialogs) ให้เข้ากับธีมเว็บไซต์

* **ความต้องการ**: ปรับสีปุ่มบนหน้าเว็บ และป๊อปอัปแจ้งเตือน (SweetAlert2 Dialog) ให้เป็นโทนสีเดียวกับตัวเว็บไซต์ (Theme Blue `#2563eb`)
* **สิ่งที่เปลี่ยนแปลง**:
  * **ปรับแต่ง SweetAlert2 ทั่วทั้งระบบ ([`frontend/src/styles/index.css`](file:///Users/macos/Desktop/nvccake_project/frontend/src/styles/index.css) & [`frontend/src/utils/alerts.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/utils/alerts.ts))**:
    * **ปุ่มยืนยัน (Confirm Button)**: เปลี่ยนจากสีม่วงเริ่มต้นของ SweetAlert2 เป็นสีน้ำเงินธีมหลัก `linear-gradient(135deg, #2563eb, #1d4ed8)` โค้งมน `rounded-xl` พร้อมเงาสีน้ำเงินและ hover effect
    * **ปุ่มยกเลิก (Cancel Button)**: ปรับเป็นสีเทา Slate `linear-gradient(135deg, #64748b, #475569)` โค้งมนเข้าชุดกัน
    * **กล่องป๊อปอัป (Popup Box)**: โค้งมน `rounded-2xl` (1.25rem), ตัวอักษร `"Noto Sans Thai"`, รองรับทั้ง Light และ Dark mode
    * **ไอคอนยืนยัน (Question Icon)**: ปรับกรอบและสัญลักษณ์คำถามเป็นสีน้ำเงิน `#2563eb` กลมกลืนกับธีม
  * **ปรับปุ่ม "สรุปยอดเค้ก" บนหน้าเว็บ ([`ClassroomStudentsPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/ClassroomStudentsPage.tsx))**:
    * เปลี่ยนจากสีเขียว Emerald เป็นสีน้ำเงิน Gradient `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800` เข้าชุดกับ Navbar และธีมหลักของเว็บไซต์
    * Badge เมื่อสรุปยอดแล้วปรับเป็นโทนสีฟ้าอ่อนและน้ำเงินเข้ม (`text-blue-700 bg-blue-50 border-blue-200`)

---

## 12. แสดงสถานะสรุปยอดในหน้าห้องเรียน (`/classroom`) และเงื่อนไขการพิมพ์รายงาน (`/my-classroom/:id/students`)

* **ความต้องการ**:
  1. ในหน้า `/classroom` ช่วยแสดงให้ชัดเจนว่าห้องเรียนไหนสรุปยอดเค้กแล้ว และห้องไหนยังไม่สรุปยอด
  2. ในหน้า `/my-classroom/:id/students` ต้องสรุปยอดเค้ก (ล็อคห้อง) ให้เรียบร้อยก่อน จึงจะสามารถคลิกสั่งพิมพ์รายงานได้
* **สิ่งที่เปลี่ยนแปลง**:
  * **หน้าพอร์ทัลห้องเรียนสำหรับครูที่ปรึกษา ([`TeacherClassroomPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/TeacherClassroomPage.tsx))**:
    * **ปุ่มตัวกรอง (Filter Pills)**: เพิ่มตัวกรองด้านบน ได้แก่ "ทั้งหมด", "สรุปยอดแล้ว", และ "ยังไม่สรุปยอด" พร้อมแสดงจำนวนห้องที่สรุปยอดแล้วเทียบกับทั้งหมด
    * **Badge ระบุสถานะบนการ์ด**:
      * ห้องที่สรุปยอดแล้ว: แสดง Badge สีเขียว `สรุปยอดแล้ว` พร้อมไอคอน `CheckCircle2` และแถบสีเขียว Emerald ด้านบนการ์ด
      * ห้องที่ยังไม่สรุปยอด: แสดง Badge สีส้ม/เหลือง `ยังไม่สรุปยอด` พร้อมไอคอน `Clock`
    * **สถานะในเนื้อหาการ์ด**: แสดงสถานะออเดอร์ของห้องเรียนชัดเจน (`สรุปยอดแล้ว (ล็อคห้อง)` หรือ `รอการสรุปยอด`)
    * **ปุ่มดูรายชื่อนักเรียน**: ปรับข้อความบนปุ่มของการ์ดให้สื่อความหมายตามสถานะของห้อง
  * **หน้ารายชื่อนักเรียนในห้องเรียน ([`ClassroomStudentsPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/ClassroomStudentsPage.tsx))**:
    * **ล็อกปุ่มพิมพ์**: หากยังไม่ได้กดยืนยันสรุปยอดเค้ก (`!isFinalized`) ปุ่มพิมพ์ "รายชื่อนักเรียน" และ "สรุปยอดเค้ก" จะถูกปิดการใช้งาน (`disabled`) และแสดงข้อความแจ้งเตือนสีส้ม *"ต้องสรุปยอดเค้กก่อนจึงจะพิมพ์รายงานได้"*
    * **ระบบแจ้งเตือนความปลอดภัย (Dialog Guard)**: หากมีการเรียกสั่งพิมพ์ผ่านฟังก์ชันขณะที่ยังไม่สรุปยอด ระบบจะแสดงหน้าต่างแจ้งเตือนทันทีเพื่อแนะนำให้ครูกดสรุปยอดเค้กก่อน

---

## 13. แก้ไขข้อผิดพลาด "Maximum update depth exceeded" เมื่อแอดมินกดแก้ไขคำสั่งซื้อ (`/dashboard/orders`)

* **สาเหตุของปัญหา**:
  1. ใน [`useGeneralInfoData.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/hooks/useGeneralInfoData.ts) มีการประกาศ `myClassrooms = user?.teacher?.classroom || []` ซึ่งสำหรับบัญชี Admin ที่ไม่มีข้อมูล `teacher` จะสร้าง Array ว่าง `[]` (Object reference ใหม่) ในทุกๆ Render Cycle
  2. Array ดังกล่าวถูกส่งเข้าไปใน `useEffect` dependencies ทำให้ `setFilteredYears` และ `setFilteredClassrooms` ถูกเรียกซ้ำอย่างต่อเนื่องแบบ Infinite Loop จน React ตัดการทำงาน
  3. ใน [`GeneralInfoSection.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/form/sections/GeneralInfoSection.tsx) มี `useEffect` ที่เรียก `setStudentOptions` ซ้ำทุกครั้ง และมีจังหวะที่ `classroomsMap` ยังโหลดไม่เสร็จ ทำให้ค่า `advisor` ถูกล้างค่าและเซ็ตกลับไปมา
  4. ใน [`useOrderForm.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/hooks/useOrderForm.ts) มี `setFormData` ใน Effect คำนวณส่วนลดที่ไม่ตรวจสอบค่าเดิม และฟังก์ชัน `handleGeneralInfoChange` ไม่ได้ใช้ `useCallback` ทำให้สร้าง instance ใหม่ทุก Render
* **การแก้ไข**:
  * แปลง `filteredYears`, `filteredClassrooms`, และ `filteredTeams` ใน `useGeneralInfoData.ts` ให้เป็น **`useMemo`** ทั้งหมด เพื่อคำนวณแบบ Synchronous และตัดการเรียก `setState` ภายใน `useEffect` ออกอย่างสิ้นเชิง
  * ปรับ `studentOptions` ใน `GeneralInfoSection.tsx` ให้เป็น `useMemo` ที่ derive จาก `classroomsMap` โดยตรง
  * ปรับให้ `updateAdvisor` ทำงานเฉพาะเมื่อได้ชื่ออาจารย์ที่ปรึกษาที่ถูกต้อง (`advisorName` มีค่าและไม่ตรงกับค่าเดิม)
  * ใช้ `useCallback` ครอบ `handleGeneralInfoChange` ใน `useOrderForm.ts` และป้องกันการล้าง `classroom_id` ขณะที่ข้อมูลแผนกและชั้นปียังโหลดไม่ครบ
  * อัปเดต `selectedMonth` และ `selectedYear` ให้ Sync กับ `formData.pickup_date` ของออเดอร์ที่ถูกโหลดขึ้นมาแก้ไขอย่างถูกต้อง

---

## 14. เปลี่ยนระบบแจ้งเตือน Toast เป็น Sonner Toast Notification

* **ปัญหาเดิม**:
  * ฟังก์ชัน `showToastSuccess`, `showToastError`, ฯลฯ เดิมใช้ SweetAlert2 (`Swal.mixin({ toast: true })`) ซึ่งเรนเดอร์เป็นกรอบขนาดใหญ่ มีปุ่มกากบาท และบดบังปุ่มหรือคอนเทนต์บริเวณมุมบนขวาของหน้าจอ (เช่น บังปุ่ม `+ เพิ่มรายชื่อครู`)
* **สิ่งที่เปลี่ยนแปลง**:
  * ปรับฟังก์ชันใน [`frontend/src/utils/alerts.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/utils/alerts.ts) ให้เรียกใช้ **Sonner Toast (`toast.success`, `toast.error`, `toast.info`, `toast.warning`)** แทน
  * ปรับแต่ง `<Toaster richColors position="top-right" closeButton />` ใน [`frontend/src/main.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/main.tsx) ให้แสดงผลโทนสีสดใส ชัดเจน และมีแอนิเมชันลอยเข้า-ออกที่นุ่มนวล
  * ปรับแต่ง CSS ให้ SweetAlert2 ใช้เฉพาะส่วนของ Modal Dialog สำหรับการยืนยันและการแจ้งเตือนสำคัญเท่านั้น โดยไม่กระทบกับสไตล์ของ Toast

---

## 15. รายการไฟล์ที่ได้รับการแก้ไข (Modified Files)

### ฝั่ง Backend
1. [`backend/src/features/services/User/User.service.ts`](file:///Users/macos/Desktop/nvccake_project/backend/src/features/services/User/User.service.ts) - พัฒนาระบบ `syncCreateAcrossAllDatabases`, `syncUpdateAcrossAllDatabases` (ซิงค์ username, role, password, ฯลฯ ครบทุกฟิลด์), และ `syncDeleteAcrossAllDatabases`
2. [`backend/src/features/services/admin/setting.service.ts`](file:///Users/macos/Desktop/nvccake_project/backend/src/features/services/admin/setting.service.ts) - เพิ่มการซิงค์ `securityKey` ไปยังฐานข้อมูลทุกปีการศึกษาใน `createSettings`
3. [`backend/src/features/services/admin/init-year.service.ts`](file:///Users/macos/Desktop/nvccake_project/backend/src/features/services/admin/init-year.service.ts) - คัดลอกเฉพาะตาราง User สำหรับปีการศึกษาใหม่
4. [`backend/src/features/repository/User/user.repository.ts`](file:///Users/macos/Desktop/nvccake_project/backend/src/features/repository/User/user.repository.ts) - ดึงข้อมูลครูและแผนกวิชาใน `findAll`
5. [`backend/src/features/services/User/User.schema.ts`](file:///Users/macos/Desktop/nvccake_project/backend/src/features/services/User/User.schema.ts) - ปรับ DTO รองรับ `teacher_id` แบบ nullable

### ฝั่ง Frontend
1. [`frontend/src/pages/TeacherClassroomPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/TeacherClassroomPage.tsx) - หน้า `/classroom` สำหรับครูที่ปรึกษา ตรวจสอบรายชื่อนักเรียนและยอดจองเค้ก พร้อม Card Selection
2. [`frontend/src/router.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/router.ts) - เพิ่ม Route `/classroom` เข้าสู่ระบบ Routing
3. [`frontend/src/components/layout/Navbar.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/layout/Navbar.tsx) - เพิ่มปุ่มลิงก์ "รายชื่อนักเรียน" บน Navbar
4. [`frontend/src/pages/AdminDashboard/Classrooms.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/Classrooms.tsx) - ลบ unused variables เพื่อให้ TypeScript build ผ่าน
5. [`frontend/src/components/classrooms/ClassroomTable.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/classrooms/ClassroomTable.tsx) - ปลดกรอบ `border` นอกสุดในโหมดพิมพ์ของตารางรายงานผล
6. [`frontend/src/pages/AdminDashboard/ClassroomsReport.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/ClassroomsReport.tsx) - ส่งสไตล์ลบ border นอกสุดผ่าน `customStyles` ใน `handlePrintClassroomsReport`
7. [`frontend/src/styles/print.css`](file:///Users/macos/Desktop/nvccake_project/frontend/src/styles/print.css) - ปรับ `.print-table-wrapper` และ `.print-table-title` ให้เป็น `border: none !important`
8. [`frontend/src/components/dashboard/reports/ClassroomStudentPrintReport.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/dashboard/reports/ClassroomStudentPrintReport.tsx) - ออกแบบ Layout รายงานรายชื่อนักเรียนและยอดสั่งจองเค้กใหม่ทั้งหมดสำหรับกระดาษ A4 แนวตั้ง
9. [`frontend/src/pages/AdminDashboard/ClassroomStudentsPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/ClassroomStudentsPage.tsx) - เพิ่ม `handlePrintStudents` สั่งพิมพ์ A4 Portrait อัตโนมัติ และส่งข้อมูลครูที่ปรึกษา/ปีการศึกษา
10. [`frontend/src/components/layout/DashboardLayout.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/layout/DashboardLayout.tsx) - เพิ่ม `print:hidden` ซ่อน Header และ Warning Banner ในโหมดพิมพ์
11. [`frontend/src/pages/AdminDashboard/LeaderboardPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/LeaderboardPage.tsx) - เพิ่มกฎซ่อน Header ในการพิมพ์ และปรับ Fallback ปีการศึกษาให้ดึงจาก LocalStorage
12. [`frontend/src/pages/AdminDashboard/SalesRecordsPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/SalesRecordsPage.tsx) - ดึงปีการศึกษาที่เลือกและส่งค่าตรงไปยัง component พิมพ์
13. [`frontend/src/components/dashboard/tables/SalesRecordsTable.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/dashboard/tables/SalesRecordsTable.tsx) - รับ props `academicYear`/`newYear` เพื่อแสดงผลทันที และแก้คำผิด "นครปฐม"
14. [`frontend/src/components/dashboard/tables/PrintableSalesRecordsContent.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/dashboard/tables/PrintableSalesRecordsContent.tsx) - ส่งต่อ props ปีการศึกษาไปยังตารางพิมพ์
15. [`frontend/src/pages/AdminDashboard/SettingsPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/SettingsPage.tsx) - ปรับข้อความยืนยันการเปลี่ยน Security Key ข้ามทุกปี และข้อความเตรียมระบบปีใหม่
16. [`frontend/src/pages/AdminDashboard/Users.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/Users.tsx) - เพิ่ม Filter Pills สำหรับกรองครูสั่งเค้ก, ผู้ใช้ทั่วไป, เจ้าหน้าที่/ผู้บริหาร
17. [`frontend/src/components/users/UserFormModal.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/users/UserFormModal.tsx) - ฟอร์มเลือกประเภทผู้ใช้, ผูกครูเดิม หรือสร้างครูใหม่ในขั้นตอนเดียว
18. [`frontend/src/components/users/UsersTable.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/users/UsersTable.tsx) - แสดง Badge และข้อมูลครูสั่งเค้กแยกชัดเจน
19. [`frontend/src/types/user.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/types/user.ts) - ปรับ Type `User` ให้รองรับ `teacher.department`
20. [`frontend/src/types/teacher.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/types/teacher.ts) - ปรับ Type `Teacher` ให้รองรับ `department`
21. [`frontend/src/utils/api/teachers.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/utils/api/teachers.ts) - ปรับ Type Parameter ของ `createTeacher`
22. [`frontend/src/lib/button-variants.ts`](file:///Users/macos/Desktop/nvccake_project/frontend/src/lib/button-variants.ts) - ปรับ default variant ของ Button จากสีดำเป็นโทนสีน้ำเงินหลัก (`bg-blue-600 hover:bg-blue-700`)
23. [`frontend/src/styles/index.css`](file:///Users/macos/Desktop/nvccake_project/frontend/src/styles/index.css) - ปรับ CSS variable `--primary` เป็น `#2563eb` และ `--primary-foreground: #ffffff`
24. [`frontend/src/pages/AdminDashboard/ClassroomStudentsPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/AdminDashboard/ClassroomStudentsPage.tsx) - เปลี่ยนปุ่ม "เพิ่ม" นักเรียนจาก `bg-slate-900` เป็น `bg-blue-600 hover:bg-blue-700`
25. [`frontend/src/pages/TeacherClassroomPage.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/pages/TeacherClassroomPage.tsx) - เปลี่ยนปุ่มในห้องที่สรุปยอดแล้วจาก `bg-slate-700` เป็นโทนสีน้ำเงิน `bg-blue-700 hover:bg-blue-800`
26. [`frontend/src/components/users/UserFormModal.tsx`](file:///Users/macos/Desktop/nvccake_project/frontend/src/components/users/UserFormModal.tsx) - ปรับปุ่ม Submit ให้ใช้สีน้ำเงิน `bg-blue-600 hover:bg-blue-700` สำหรับผู้ใช้ทั่วไป
