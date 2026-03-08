import ExecutiveDashboard from "../../components/executive/ExecutiveDashboard";

function ExecutivePage() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            รายงานสรุปผู้บริหาร
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            ภาพรวมการดำเนินงานและสถิติยอดขายปอนด์เค้กทั้งหมด
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">อัปเดตล่าสุด: </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {new Date().toLocaleDateString("th-TH", {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      <ExecutiveDashboard />
    </div>
  );
}

export default ExecutivePage;
