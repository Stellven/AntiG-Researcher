import { cn } from "@/lib/utils"
import { FileText, Link2, Clock, Lock, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface ResearchCardProps {
  title: string
  description?: string
  tag: string
  isPublic: boolean
  reports: number
  sources: number
  progress: number
  maxProgress: number
  lastUpdated: string
}

export function ResearchCard({
  title,
  description,
  tag,
  isPublic,
  reports,
  sources,
  progress,
  maxProgress,
  lastUpdated,
}: ResearchCardProps) {
  const progressPercent = (progress / maxProgress) * 100

  return (
    <Card className="group cursor-pointer transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
          <svg
            className="h-6 w-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>

        {/* Tags */}
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100">
            {tag}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "flex items-center gap-1",
              isPublic
                ? "bg-green-50 text-green-600 hover:bg-green-50"
                : "bg-slate-50 text-slate-500 hover:bg-slate-50"
            )}
          >
            {isPublic ? (
              <>
                <Eye className="h-3 w-3" />
                公开
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                私有
              </>
            )}
          </Badge>
        </div>

        {/* Title and description */}
        <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mb-3 text-sm text-muted-foreground">{description}</p>
        )}

        {/* Stats */}
        <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {reports} 份报告
          </span>
          <span className="flex items-center gap-1">
            <Link2 className="h-4 w-4" />
            {sources} 个来源
          </span>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">维度完成度</span>
            <span className="text-muted-foreground">
              {progress}/{maxProgress}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Last updated */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>上次刷新: {lastUpdated}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export interface CreateTopicCardProps {
  onClick?: () => void
}

export function CreateTopicCard({ onClick }: CreateTopicCardProps) {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer border-dashed border-2 transition-all hover:border-blue-300 hover:bg-blue-50/30"
    >
      <CardContent className="flex h-full min-h-[280px] flex-col items-center justify-center p-5">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 transition-colors group-hover:border-blue-400 group-hover:text-blue-500">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-muted-foreground group-hover:text-blue-600">
          Create Topic
        </span>
      </CardContent>
    </Card>
  )
}
