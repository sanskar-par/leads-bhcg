import AppLayout from "@/components/layout/app-layout";
import LeaderboardTable from "@/components/leaderboard/leaderboard-table";

export default function LeaderboardPage() {
    return (
        <AppLayout>
            <div className="container py-8">
                <LeaderboardTable />
            </div>
        </AppLayout>
    );
}
