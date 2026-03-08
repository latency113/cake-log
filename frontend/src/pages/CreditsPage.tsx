import React from "react";
import { creditInfo } from "../data/credit";
import { User, GraduationCap, Calendar, BookOpen } from "lucide-react"; // แนะนำให้ลง lucide-react เพิ่มความสวยงาม

const CreditsPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-semibold sm:text-5xl tracking-tight dark:text-gray-50">
            ข้อมูลผู้พัฒนาและโครงงาน
          </h1>
          <div className="mt-4 h-1 w-full bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid gap-8">
          {/* Developers Section */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <User className="text-blue-600 mr-3" size={28} />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">พัฒนาโดย</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creditInfo.developer.map((name, index) => (
                <div key={index} className="bg-blue-50 dark:bg-blue-900 p-4 rounded-xl text-blue-700 dark:text-blue-200 font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                  {name}
                </div>
              ))}
            </div>
          </section>

          {/* Project Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center shadow-sm">
              <BookOpen className="text-purple-500 mr-4" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">วิชา</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{creditInfo.course}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center shadow-sm">
              <Calendar className="text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">ปีการศึกษา</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{creditInfo.academicYear}</p>
              </div>
            </div>
          </section>

          {/* Advisors Section */}
          <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-6">
              <GraduationCap className="text-red-500 mr-3" size={28} />
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">ครูที่ปรึกษาโครงงาน</h2>
            </div>
            <ul className="space-y-3">
              {creditInfo.advisor.map((name, index) => (
                <li key={index} className="flex items-center text-gray-700 dark:text-gray-200 text-lg">
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                  {name}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreditsPage;