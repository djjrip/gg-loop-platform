import React, { useState, useEffect } from "react";
import { EmpireNavigation } from "./Empire/EmpireNavigation";
import { EmpireSidebar } from "./Empire/EmpireSidebar";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen(prev => !prev);
    document.addEventListener('toggle-empire-sidebar', handleToggle);
    return () => document.removeEventListener('toggle-empire-sidebar', handleToggle);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <EmpireNavigation />
      </header>
      <EmpireSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
