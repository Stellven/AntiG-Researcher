import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Trash2, Download } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { api } from "@/lib/api"

interface ResearchFlowDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type Stage = "INPUT" | "PLANNING" | "PLAN_REVIEW" | "RESEARCHING" | "FINDINGS_REVIEW" | "SUMMARIZING" | "REPORT"

export function ResearchFlowDialog({ open, onOpenChange }: ResearchFlowDialogProps) {
    const [stage, setStage] = useState<Stage>("INPUT")
    const [topic, setTopic] = useState("")
    const [customPrompt, setCustomPrompt] = useState("")
    const [loadingText, setLoadingText] = useState("")
    const [error, setError] = useState<string | null>(null)

    // Data State
    const [subTopics, setSubTopics] = useState<string[]>([])
    const [subTopicInstructions, setSubTopicInstructions] = useState<Record<number, string>>({})
    const [findings, setFindings] = useState<Record<string, string>>({})
    const [sources, setSources] = useState<string[]>([])
    const [report, setReport] = useState("")

    const resetState = () => {
        setStage("INPUT")
        setTopic("")
        setCustomPrompt("")
        setError(null)
        setSubTopics([])
        setSubTopicInstructions({})
        setFindings({})
        setSources([])
        setReport("")
    }

    const handleStartPlanning = async () => {
        if (!topic.trim()) return
        setStage("PLANNING")
        setLoadingText("Analysing topic & generating research plan...")
        setError(null)

        try {
            const data = await api.planResearch({ topic, custom_prompt: customPrompt })
            setSubTopics(data.sub_topics)
            setStage("PLAN_REVIEW")
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            setStage("INPUT")
        }
    }

    const handleStartResearch = async () => {
        setStage("RESEARCHING")
        setLoadingText(`Deploying ${subTopics.length} Agents...`)
        setError(null)

        const requestData = subTopics.map((t, i) => ({
            topic: t,
            instructions: subTopicInstructions[i] || undefined
        }))

        try {
            const data = await api.executeResearch({ sub_topics: requestData })
            setFindings(data.findings)
            setSources(data.sources)
            setStage("FINDINGS_REVIEW")
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during research")
            setStage("PLAN_REVIEW")
        }
    }

    const handleGenerateReport = async () => {
        setStage("SUMMARIZING")
        setLoadingText("Compiling final report...")
        setError(null)

        try {
            const data = await api.generateSummary({
                topic,
                research_findings: findings,
                sources,
                custom_prompt: customPrompt
            })
            setReport(data.report)
            setStage("REPORT")
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred during summarization")
            setStage("FINDINGS_REVIEW")
        }
    }

    const handleDownload = async (format: 'pdf' | 'docx') => {
        try {
            await api.downloadReport(report, format)
        } catch (err) {
            setError("Download failed. Please try again.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) resetState()
            onOpenChange(val)
        }}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>
                        {stage === "INPUT" && "New Research Topic"}
                        {(stage === "PLANNING" || stage === "PLAN_REVIEW") && "Research Plan"}
                        {(stage === "RESEARCHING" || stage === "FINDINGS_REVIEW") && "Research Findings"}
                        {(stage === "SUMMARIZING" || stage === "REPORT") && "Research Report"}
                    </DialogTitle>
                    <DialogDescription>
                        {stage === "INPUT" && "Enter a topic to begin deep research with AI agents."}
                        {stage === "PLAN_REVIEW" && "Review and refine the research plan proposed by the planner agent."}
                        {stage === "FINDINGS_REVIEW" && "Review the gathered information before generating the final report."}
                        {stage === "REPORT" && "Final comprehensive report based on multi-agent research."}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-6">
                    {error && (
                        <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 text-sm font-medium">
                            Error: {error}
                        </div>
                    )}

                    {stage === "INPUT" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="topic">Research Topic</Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g., Future of Quantum Computing"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prompt">Custom Instructions (Optional)</Label>
                                <Textarea
                                    id="prompt"
                                    placeholder="e.g., Focus on economic impact..."
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {(stage === "PLANNING" || stage === "RESEARCHING" || stage === "SUMMARIZING") && (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 min-h-[300px]">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium animate-pulse">{loadingText}</p>
                        </div>
                    )}

                    {stage === "PLAN_REVIEW" && (
                        <div className="space-y-4">
                            {subTopics.map((sub, idx) => (
                                <div key={idx} className="border rounded-lg p-4 space-y-3 bg-card/50">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {idx + 1}
                                        </span>
                                        <Input
                                            value={sub}
                                            onChange={(e) => {
                                                const newSubs = [...subTopics]
                                                newSubs[idx] = e.target.value
                                                setSubTopics(newSubs)
                                            }}
                                            className="font-medium"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            const newSubs = subTopics.filter((_, i) => i !== idx)
                                            setSubTopics(newSubs)
                                        }}>
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Add specific instructions for this sub-topic..."
                                        value={subTopicInstructions[idx] || ""}
                                        onChange={(e) => setSubTopicInstructions({ ...subTopicInstructions, [idx]: e.target.value })}
                                        className="text-sm text-muted-foreground bg-muted/30"
                                    />
                                </div>
                            ))}
                            <Button variant="outline" className="w-full" onClick={() => setSubTopics([...subTopics, "New Sub-topic"])}>
                                <Plus className="h-4 w-4 mr-2" /> Add Sub-topic
                            </Button>
                        </div>
                    )}

                    {stage === "FINDINGS_REVIEW" && (
                        <div className="space-y-6">
                            {Object.entries(findings).map(([key, content], idx) => (
                                <div key={idx} className="space-y-2">
                                    <Label className="text-base font-semibold text-primary">{key}</Label>
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setFindings({ ...findings, [key]: e.target.value })}
                                        className="min-h-[150px] font-mono text-sm leading-relaxed"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {stage === "REPORT" && (
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t bg-muted/10">
                    {stage === "INPUT" && (
                        <Button onClick={handleStartPlanning} disabled={!topic.trim()}>
                            Start Planning
                        </Button>
                    )}
                    {stage === "PLAN_REVIEW" && (
                        <Button onClick={handleStartResearch}>
                            Confirm & Start Research
                        </Button>
                    )}
                    {stage === "FINDINGS_REVIEW" && (
                        <Button onClick={handleGenerateReport}>
                            Generate Final Report
                        </Button>
                    )}
                    {stage === "REPORT" && (
                        <div className="flex w-full justify-between">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => handleDownload('pdf')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Button variant="outline" onClick={() => handleDownload('docx')}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Word
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
