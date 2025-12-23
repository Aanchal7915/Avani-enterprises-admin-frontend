import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, X, User, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, user } = useAuth();
    const location = useLocation();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={clsx(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1",
                    isActive
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => setIsOpen(false)} // Close on mobile click
            >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
            </Link>
        );
    };

    return (
        <>
            {/* Mobile Trigger */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md md:hidden"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">

                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
                        <img src="/avani-logo.jpg" alt="Avani Logo" className="w-20 h-20 object-contain rounded-full mb-3" />
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">AVANI ENTERPRISES</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Admin Dashboard</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6">
                        <NavItem to="/" icon={LayoutDashboard} label="Leads Dashboard" />
                        <NavItem to="/avani-forms" icon={MessageSquare} label="Contact Submissions" />
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center space-x-3 mb-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user?.name?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.name || "Admin"}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[120px]">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
