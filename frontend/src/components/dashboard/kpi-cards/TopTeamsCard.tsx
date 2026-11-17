import React, { useState, useMemo } from "react";
import type { TopTeamItem } from "@/types/dashboard";
import { Trophy, Crown, ArrowRight, Users, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface TopTeamsCardProps {
  topTeams: TopTeamItem[];
}

const TopTeamsCard: React.FC<TopTeamsCardProps> = ({ topTeams }) => {
  const [teamType, setTeamType] = useState<"team" | "person">("team");

  const teamsOnly = useMemo(
    () => topTeams.filter((t) => t.team_type === "team").slice(0, 5),
    [topTeams]
  );
  const personsOnly = useMemo(
    () => topTeams.filter((t) => t.team_type === "person").slice(0, 5),
    [topTeams]
  );

  const displayList = teamType === "team" ? teamsOnly : personsOnly;

  const rankStyles = [
    {
      badge: "bg-amber-400 text-amber-950 shadow-sm",
      border: "border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/20",
    },
    {
      badge: "bg-slate-300 text-slate-800",
      border: "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30",
    },
    {
      badge: "bg-amber-600 text-white",
      border: "border-amber-300/40 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10",
    },
    {
      badge: "bg-muted text-muted-foreground",
      border: "border-border bg-card/40",
    },
    {
      badge: "bg-muted text-muted-foreground",
      border: "border-border bg-card/40",
    },
  ];

  return (
    <div className="bg-card rounded-sm shadow-md border border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-3.5 pb-2.5 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            อันดับยอดขายทีม
          </h2>
          <Link
            to="/dashboard/leaderboard"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
          >
            ดูทั้งหมด
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab Switcher: ประเภททีม vs ประเภทเดี่ยว */}
        <div className="grid grid-cols-2 bg-muted p-1 rounded-lg border border-border/60">
          <button
            type="button"
            onClick={() => setTeamType("team")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
              teamType === "team"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            ประเภททีม ({teamsOnly.length})
          </button>
          <button
            type="button"
            onClick={() => setTeamType("person")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
              teamType === "person"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground font-medium"
            }`}
          >
            <User className="w-3.5 h-3.5 text-purple-500" />
            ประเภทเดี่ยว ({personsOnly.length})
          </button>
        </div>
      </div>

      {/* Body: justify-start keeps consistent spacing regardless of 4 or 5 items */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-start gap-2.5">
        {displayList && displayList.length > 0 ? (
          displayList.map((team, index) => {
            const style = rankStyles[index] ?? rankStyles[3];

            return (
              <div
                key={team.id || index}
                className={`relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border transition-colors ${style.border}`}
              >
                {/* Left: Rank & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {index === 0 && (
                      <Crown className="w-3.5 h-3.5 text-amber-400 absolute -top-3 left-1/2 -translate-x-1/2" />
                    )}
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${style.badge}`}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-[220px]">
                      {team.name}
                    </p>
                    {team.student_member_name && team.student_member_name.length > 0 && (
                      <p className="text-[11px] text-muted-foreground truncate max-w-[180px] sm:max-w-[240px]">
                        {team.student_member_name.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Numbers */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">
                    {team.total_sales_pounds.toLocaleString()}{" "}
                    <span className="text-xs font-medium text-muted-foreground">ปอนด์</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    ฿{team.total_sales_baht.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            ยังไม่มีข้อมูลอันดับยอดขาย{teamType === "team" ? "ประเภททีม" : "ประเภทเดี่ยว"}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopTeamsCard;
