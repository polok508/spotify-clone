import { useMusicStore } from "@/stores/useMusicStore";
import { Library, ListMusic, PlayCircle, Users2 } from "lucide-react";
import StatsCard from "./StatsCard";

const DashboardStats = () => {
	const { stats } = useMusicStore();

	const safeValue = (value: unknown): string => {
		if (typeof value === "number" && !isNaN(value)) {
			return value.toLocaleString();
		}
		return "0";
	};

	const statsData = [
		{
			icon: ListMusic,
			label: "Total Songs",
			value: safeValue(stats?.totalSongs),
			bgColor: "bg-emerald-500/10",
			iconColor: "text-emerald-500",
		},
		{
			icon: Library,
			label: "Total Albums",
			value: safeValue(stats?.totalAlbums),
			bgColor: "bg-violet-500/10",
			iconColor: "text-violet-500",
		},
		{
			icon: Users2,
			label: "Total Artists",
			value: safeValue(stats?.totalArtists),
			bgColor: "bg-orange-500/10",
			iconColor: "text-orange-500",
		},
		{
			icon: PlayCircle,
			label: "Total Users",
			value: safeValue(stats?.totalUsers),
			bgColor: "bg-sky-500/10",
			iconColor: "text-sky-500",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
			{statsData.map((stat) => (
				<StatsCard
					key={stat.label}
					icon={stat.icon}
					label={stat.label}
					value={stat.value}
					bgColor={stat.bgColor}
					iconColor={stat.iconColor}
				/>
			))}
		</div>
	);
};

export default DashboardStats;
