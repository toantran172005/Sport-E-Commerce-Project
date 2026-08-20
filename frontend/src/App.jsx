export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Sport E-commerce Frontend
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          React + Tailwind CSS + Axios đã sẵn sàng để bạn tự do code UI.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Tailwind CSS & React hoạt động bình thường
        </div>
      </div>
    </div>
  );
}
