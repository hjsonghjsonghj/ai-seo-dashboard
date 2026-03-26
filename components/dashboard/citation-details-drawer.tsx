"use client"

import { useState, useEffect } from "react"
import { Download, CheckCircle2, Share2 } from "lucide-react"
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
import { toast } from "sonner"

// Optimization checklist items based on score
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

function getSeverityLabel(progress: number): string {
    if (progress < 40) return "Critical"
    if (progress < 75) return "Moderate"
    return "Good"
}


interface CitationDetailsDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedCitation: any | null
    onResolve?: (citation: any) => void
}

export function CitationDetailsDrawer({ open, onOpenChange, selectedCitation, onResolve }: CitationDetailsDrawerProps) {
    const [currentUrl, setCurrentUrl] = useState("")

    useEffect(() => {
        setCurrentUrl(window.location.href)
    }, [])

    if (!selectedCitation) return null

    const checklist = getOptimizationChecklist(selectedCitation)
    const severity = getSeverityLabel(selectedCitation.optimizationProgress)

    function handleShare() {
        const url = `${window.location.origin}${window.location.pathname}?id=${selectedCitation.id}&sidebar=true`
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
    }

    function handlePrint() {
        window.print()
    }

    return (
        <>
            {/* Print-only report — hidden in browser, visible only during window.print() */}
            <div className="print-report" style={{
                display: "block",
                position: "relative",
                border: "2px solid red"  // 빨간 테두리로 확인
            }}>
                <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#111", background: "#fff" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", borderBottom: "2px solid #111", paddingBottom: "1rem" }}>
                        <div>
                            <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, fontFamily: "system-ui, sans-serif" }}>AI Diagnostic Report</h1>
                            <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 0", wordBreak: "break-all" }}>{currentUrl}</p>
                        </div>
                        <p style={{ fontSize: "12px", color: "#666", textAlign: "right", whiteSpace: "nowrap", marginLeft: "1rem" }}>
                            {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                    </div>

                    {/* Status Card */}
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                        <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", background: "#f9f9f9" }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", margin: "0 0 0.5rem", fontFamily: "system-ui, sans-serif" }}>Optimization Score</p>
                            <p style={{ fontSize: "36px", fontWeight: "bold", margin: 0, lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>{selectedCitation.optimizationProgress}%</p>
                            <p style={{ fontSize: "16px", fontWeight: 600, margin: "0.5rem 0 0", fontFamily: "system-ui, sans-serif" }}>{severity}: {selectedCitation.optimizationProgress}%</p>
                        </div>
                        <div style={{ flex: 1, border: "1px solid #ddd", borderRadius: "8px", padding: "1.5rem", background: "#f9f9f9" }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", margin: "0 0 0.5rem", fontFamily: "system-ui, sans-serif" }}>Mentions</p>
                            <p style={{ fontSize: "36px", fontWeight: "bold", margin: 0, lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>{selectedCitation.mentions.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Source */}
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", margin: "0 0 0.5rem", fontFamily: "system-ui, sans-serif" }}>Source</h2>
                        <p style={{ fontSize: "16px", fontWeight: 600, margin: 0, fontFamily: "system-ui, sans-serif" }}>{selectedCitation.source}</p>
                        <p style={{ fontSize: "13px", color: "#666", margin: "4px 0 0", fontFamily: "system-ui, sans-serif" }}>{selectedCitation.page}</p>
                    </div>

                    {/* AI Analysis */}
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", margin: "0 0 0.75rem", fontFamily: "system-ui, sans-serif" }}>AI Analysis</h2>
                        <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#333", margin: 0, fontFamily: "Georgia, serif" }}>{selectedCitation.aiContext}</p>
                    </div>

                    {/* Action Checklist */}
                    <div>
                        <h2 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", margin: "0 0 0.75rem", fontFamily: "system-ui, sans-serif" }}>Action Checklist</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {checklist.map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                                    <span style={{ fontSize: "16px", lineHeight: 1, marginTop: "2px", flexShrink: 0 }}>{item.done ? "☑" : "☐"}</span>
                                    <span style={{ fontSize: "14px", color: item.done ? "#333" : "#777", fontFamily: "Georgia, serif" }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-md bg-slate-900 border-slate-800 overflow-y-auto">
                    {/* Share icon button — positioned next to the built-in X close button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className="absolute top-4 right-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 text-v0-violet-300 hover:text-v0-white"
                        aria-label="Share link"
                    >
                        <Share2 className="size-4" />
                    </button>
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
                                {checklist.map((item, index) => (
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
                                {selectedCitation.aiContext}
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
                            onClick={handlePrint}
                        >
                            <Download className="h-4 w-4" />
                            Export to Report
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white text-[14px] font-semibold"
                            onClick={() => onResolve?.(selectedCitation)}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as Resolved
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    )
}
