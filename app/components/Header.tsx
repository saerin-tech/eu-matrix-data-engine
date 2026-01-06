import { LogOut, Sparkles, Menu, UserPlus, Users, DatabaseIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import Button from "./shared/Button";

type UserRole = 'Admin' | 'User';

interface HeaderProps {
  userEmail: string;
  userRole: UserRole;
  onLogout: () => void;
  onCreateUser: () => void;
  onManageUsers: () => void;
  onAddDatabase: () => void;
  onManageDatabases: () => void;
  organizationName?: string;
  organizationSubHeading?: string;
}

export default function Header({ 
  userEmail, 
  userRole,
  onLogout, 
  onCreateUser,
  onManageUsers,
  onAddDatabase,
  onManageDatabases,
  organizationName, 
  organizationSubHeading 
}: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDatabaseMenu, setShowDatabaseMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const isAdmin = userRole === 'Admin';
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
  <div onClick={() => {
    setShowDatabaseMenu(false);
    setShowUserMenu(false);
  }}>
    <header className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl mb-4 sm:mb-6 relative z-50">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 animate-pulse"></div>
      
      {/* MODIFIED: Added onClick with stopPropagation to prevent closing when clicking inside header */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          {/* LEFT — TITLE with icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                {organizationName || "Query Craft Engine"}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 hidden lg:block">
                {organizationSubHeading || "Advanced Database Query Builder"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700/50 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userInitial}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">
                  {isAdmin ? 'Admin' : 'User'}
                </span>
                <span className="text-sm font-semibold text-white truncate max-w-[150px]">
                  {userEmail}
                </span>
              </div>
            </div>

            {/* Create User Button (Admin Only) */}
            {isAdmin && (
              <>
              {/* Database Dropdown Menu */}
              <div className="relative">
                <Button
                  onClick={() => {
                    setShowDatabaseMenu(!showDatabaseMenu);
                    setShowUserMenu(false);
                  }}
                  variant="warning"
                  icon={<DatabaseIcon className="w-4 h-4" />}
                >
                  <span className="hidden xl:inline">Database</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>

                    {/* Database Dropdown */}
                    {showDatabaseMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[100]">
                        <button
                          onClick={() => {
                            onAddDatabase();
                            setShowDatabaseMenu(false);
                          }}
                          className="w-full px-4 py-3 cursor-pointer text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-slate-700"
                        >
                          <DatabaseIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">Add Database</span>
                        </button>
                        <button
                          onClick={() => {
                            onManageDatabases();
                            setShowDatabaseMenu(false);
                          }}
                          className="w-full px-4 py-3 cursor-pointer text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
                        >
                          <DatabaseIcon className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium">Manage Databases</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* User Dropdown Menu */}
                  <div className="relative">
                <Button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowDatabaseMenu(false);
                  }}
                  variant="info"
                  icon={<Users className="w-4 h-4" />}
                >
                  <span className="hidden xl:inline">Users</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[100]">
                        <button
                          onClick={() => {
                            onCreateUser();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-3 cursor-pointer text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3 border-b border-slate-700"
                        >
                          <UserPlus className="w-4 h-4 text-green-400" />
                          <span className="text-sm font-medium">Create User</span>
                        </button>
                        <button
                          onClick={() => {
                            onManageUsers();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-3 cursor-pointer text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
                        >
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium">Manage Users</span>
                        </button>
                      </div>
                    )}
                  </div>
              </>
            )}

            {/* Logout Button */}
            <Button
              onClick={onLogout}
              variant="danger"
              icon={<LogOut className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex justify-between items-center">
            {/* Logo & Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                {organizationName || "Query Craft"}
              </h1>
            </div>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              variant="info"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>

          {/* Mobile Dropdown */}
          {showMobileMenu && (
            <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700/50">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {userInitial}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs text-gray-400">
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                  <span className="text-sm font-semibold text-white truncate">
                    {userEmail}
                  </span>
                </div>
              </div>

              {/* Admin Controls (Mobile) */}
              {isAdmin && (
                <>
                  <Button
                    onClick={() => {
                      onAddDatabase();
                      setShowMobileMenu(false);
                    }}
                    variant="warning"
                    fullWidth
                    icon={<DatabaseIcon className="w-4 h-4" />}
                  >
                    Add Database
                  </Button>

                  <Button
                    onClick={() => {
                      onManageUsers();
                      setShowMobileMenu(false);
                    }}
                    variant="info"
                    fullWidth
                    icon={<Users className="w-4 h-4" />}
                  >
                    Manage Users
                  </Button>

                  <Button
                    onClick={() => {
                      onCreateUser();
                      setShowMobileMenu(false);
                    }}
                    variant="success"
                    fullWidth
                    icon={<UserPlus className="w-4 h-4" />}
                  >
                  Create User
                </Button>
                </>
              )}

              {/* Logout Button */}
              <Button
                onClick={onLogout}
                variant="danger"
                fullWidth
                icon={<LogOut className="w-4 h-4" />}
              >
            Sign out
            </Button>
        </div>
        )}
        </div>
      </div>
    </header>
  </div>
  );
}