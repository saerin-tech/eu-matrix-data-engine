import { LogOut } from "lucide-react";

interface HeaderProps {
  userEmail: string;
  onLogout: () => void;
  organizationName?: string;
}

export default function Header({ userEmail, onLogout, organizationName }: HeaderProps) {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-xl p-2 shadow-lg mb-6">
      <div className="flex justify-between items-center flex-wrap gap-4">

        {/* LEFT — TITLE */}
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {organizationName || "Query Craft Engine"}
        </h1>

        {/* RIGHT — USER + LOGOUT */}
        <div className="flex items-center gap-3">

          <span className="text-gray-300 text-sm bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            Welcome, <strong className="text-white">{userEmail}</strong>
          </span>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-red-600/20 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

        </div>

      </div>
    </header>
  );
}
