import { useSidebar } from "@/context/SidebarContext";
import React from "react";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[45] bg-black/50 transition-opacity duration-300 motion-reduce:transition-none lg:hidden ${isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
