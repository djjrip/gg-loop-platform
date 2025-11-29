import React from "react";
import Header from "@/components/Header";

export default function AdminDashboardPlaceholder() {
    return (
        <>
            <Header />
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold">Admin Dashboard (Placeholder)</h1>
                <p>System is updating. Please check back in a few minutes.</p>
            </div>
        </>
    );
}
