import AppLayout from "@/components/layout/app-layout";
import LeadsTable from "@/components/database/leads-table";

export default function DatabasePage() {
    return (
        <AppLayout>
            <div className="container py-8">
                <LeadsTable />
            </div>
        </AppLayout>
    );
}
