import React from "react";
import { MarketingNavigation } from "./MarketingNavigation";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <MarketingNavigation />
    </header>
  );
}
