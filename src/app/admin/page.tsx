import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Users, Swords, GitPullRequest, Settings, LucideIcon } from "lucide-react";

const adminControls: { href: string; icon: LucideIcon; label: string }[] = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/tournaments', icon: Swords, label: 'Tournaments' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/requests', icon: GitPullRequest, label: 'Requests' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminControlCard = ({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) => (
    <Link href={href} className="block">
        <Card className="hover:bg-accent hover:border-primary transition-colors h-full shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-6 gap-4 text-center aspect-square">
                <Icon className="h-10 w-10 text-primary" />
                <span className="font-semibold mt-2">{label}</span>
            </CardContent>
        </Card>
    </Link>
);


export default function AdminPage() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {adminControls.map((control) => (
                <AdminControlCard key={control.href} {...control} />
            ))}
        </div>
    );
}
