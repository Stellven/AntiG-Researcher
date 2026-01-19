import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ResearchCard, CreateTopicCard } from "@/components/research-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ResearchFlowDialog } from "@/components/research-flow-dialog"

const researchTopics = [
  {
    title: "美国AI宏观洞察",
    tag: "宏观洞察",
    isPublic: true,
    reports: 1,
    sources: 107,
    progress: 11,
    maxProgress: 11,
    lastUpdated: "11 小时前",
  },
  {
    title: "美国AI宏观洞察2026",
    tag: "宏观洞察",
    isPublic: true,
    reports: 1,
    sources: 92,
    progress: 10,
    maxProgress: 10,
    lastUpdated: "13 小时前",
  },
]

export default function App() {
  const [researchDialogOpen, setResearchDialogOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Topic Research</h1>
            <p className="text-muted-foreground">Manage your research projects</p>
          </div>
          {/* Header Actions could go here */}
        </header>

        {/* Tabs placeholder from screenshot description */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-6">
            <button className="border-b-2 border-transparent px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Fast Research</button>
            <button className="border-b-2 border-transparent px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Deep Research</button>
            <button className="border-b-2 border-blue-500 px-2 py-2 text-sm font-medium text-blue-600">Topic Research</button>
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search research topics..." className="pl-10 h-10 bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CreateTopicCard onClick={() => setResearchDialogOpen(true)} />
          {researchTopics.map((topic, index) => (
            <ResearchCard key={index} {...topic} />
          ))}
        </div>
      </main>

      <ResearchFlowDialog open={researchDialogOpen} onOpenChange={setResearchDialogOpen} />
    </div>
  )
}
