import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-pink-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden mt-16 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
}
