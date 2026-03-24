"use client"

import { Download, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// 원본 로직 그대로 복사: Optimization checklist items based on score
function getOptimizationChecklist(citation: any) {
    const items = []
    if (citation.optimizationProgress < 40) {
        items.push(
            { text: "Add structured data markup for better AI comprehension", done: false },
            { text: "Improve content depth with comprehensive examples", done: false },
            { text: "Optimize meta descriptions for AI snippet extraction", done: false },
            { text: "Include FAQ sections addressing common queries", done: false }
        )
    } else if (citation.optimizationProgress < 75) {
        items.push(
            { text: "Add structured data markup for better AI comprehension", done: true },
            { text: "Improve content depth with comprehensive examples", done: false },
            { text: "Optimize meta descriptions for AI snippet extraction", done: false },
            { text: "Include FAQ sections addressing common queries", done: true }
        )
    } else {
        items.push(
            { text: "Add structured data markup for better AI comprehension", done: true },
            { text: "Improve content depth with comprehensive examples", done: true },
            { text: "Optimize meta descriptions for AI snippet extraction", done: true },
            { text: "Include FAQ sections addressing common queries", done: citation.optimizationProgress > 85 }
        )
    }
    return items
}

// 원본 로직 그대로 복사: AI Context explanation based on source
function getAIContext(source: string, page: string) {
    const contexts: Record<string, string> = {
        "ChatGPT": `ChatGPT is citing ${page} because the content provides clear, conversational answers that align with user queries. The structured format and comprehensive coverage make it ideal for AI-generated responses.`,
        "Claude": `Claude references ${page} due to its well-researched content with verifiable sources. The balanced analysis and technical depth match Claude's preference for nuanced, accurate information.`,
        "Perplexity": `Perplexity cites ${page} for its real-time relevance and authoritative source links. The concise summaries and data visualizations support quick information retrieval.`,
        "Google AI": `Google AI surfaces ${page} based on strong E-E-A-T signals and proper Schema.org implementation. The optimized page experience and mobile responsiveness contribute to visibility.`,
        "Copilot": `Copilot references ${page} for its actionable content format with clear code examples. The step-by-step structure and integration guidance align with developer-focused queries.`,
    }
    return contexts[source] || `This AI source is citing ${page} based on content relevance and quality signals.`
}

interface CitationDetailsDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCitation: any | null
}

export function CitationDetailsDrawer({ open, onOpenChange, selectedCitation }: CitationDetailsDrawerProps) {
    if (!selectedCitation) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md bg-slate-900 border-slate-800 overflow-y-auto">
                <SheetHeader className="px-6 pt-6">
                    <SheetTitle className="text-[16px] font-semibold tracking-normal text-white">
                        {selectedCitation.source}
                    </SheetTitle>
                    <SheetDescription className="text-[14px] font-medium tracking-normal text-slate-400">
                        {selectedCitation.page}
                    </SheetDescription>
                </SheetHeader>

                <div className="px-6 py-6 space-y-8">
                    {/* Optimization Checklist */}
                    <div className="space-y-4">
                        <h3 className="text-[14px] font-semibold tracking-normal text-white">
                            Optimization Checklist
                        </h3>
                        <div className="space-y-3">
                            {getOptimizationChecklist(selectedCitation).map((item, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <CheckCircle2
                                        className={cn(
                                            "h-5 w-5 mt-0.5 shrink-0",
                                            item.done ? "text-success" : "text-slate-600"
                                        )}
                                    />
                                    <span className={cn(
                                        "text-[14px] font-medium tracking-normal",
                                        item.done ? "text-slate-300" : "text-slate-500"
                                    )}>
                                        {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Context */}
                    <div className="space-y-4">
                        <h3 className="text-[14px] font-semibold tracking-normal text-white">
                            AI Context
                        </h3>
                        <p className="text-[14px] font-medium tracking-normal text-slate-400 leading-relaxed">
                            {getAIContext(selectedCitation.source, selectedCitation.page)}
                        </p>
                    </div>

                    {/* Current Stats */}
                    <div className="space-y-4">
                        <h3 className="text-[14px] font-semibold tracking-normal text-white">
                            Current Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border border-border/50 bg-slate-800/50 p-4">
                                <p className="text-[12px] font-medium uppercase tracking-wide text-slate-500" style={{ letterSpacing: '0.01em' }}>
                                    Mentions
                                </p>
                                <p className="text-[16px] font-semibold tabular-nums text-white mt-1">
                                    {selectedCitation.mentions.toLocaleString()}
                                </p>
                            </div>
                            <div className="rounded-lg border border-border/50 bg-slate-800/50 p-4">
                                <p className="text-[12px] font-medium uppercase tracking-wide text-slate-500" style={{ letterSpacing: '0.01em' }}>
                                    Optimization
                                </p>
                                <p className={cn(
                                    "text-[16px] font-semibold tabular-nums mt-1",
                                    selectedCitation.optimizationProgress >= 75 ? "text-success" :
                                        selectedCitation.optimizationProgress >= 40 ? "text-warning" : "text-red-400"
                                )}>
                                    {selectedCitation.optimizationProgress}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="px-6 pb-6 flex-col gap-3 sm:flex-col">
                    <Button
                        className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white text-[14px] font-semibold"
                    >
                        <Download className="h-4 w-4" />
                        Export to Report
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white text-[14px] font-semibold"
                        onClick={() => onOpenChange(false)}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark as Resolved
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}