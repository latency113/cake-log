import * as XLSX from 'xlsx';

export interface StudentData {
  studentId: string;
  studentName: string;
}

export const parseExcelForStudents = (file: File): Promise<StudentData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // แปลงเป็น array ของ array
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const students: StudentData[] = [];

        for (let i = 10; i < json.length; i++) {
          const row: any = json[i];
          if (!row) continue;

          const studentId = row[2] !== undefined ? String(row[2]) : ''; // คอลัมน์ C
          const studentName = row[3] !== undefined ? String(row[3]) : ''; // คอลัมน์ D

          // ถ้ามีข้อมูลช่องใดช่องหนึ่งให้เพิ่มลง array
          if (studentId || studentName) {
            students.push({ studentId, studentName });
          }
        }

        resolve(students);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
