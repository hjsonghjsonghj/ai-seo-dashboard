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
        toast.info('Export functionality coming soon')
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-md bg-surface-default border-surface-hover overflow-y-auto">
                    {/* Share icon button — positioned next to the built-in X close button */}
                    <button
                        type="button"
                        onClick={handleShare}
                        className="absolute top-4 right-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 text-brand-faint hover:text-foreground-strong"
                        aria-label="Share link"
                    >
                        <Share2 className="size-4" />
                    </button>
                    <SheetHeader className="px-6 pt-6">
                        <SheetTitle className="text-[16px] font-semibold tracking-normal text-foreground-strong">
                            {selectedCitation.source}
                        </SheetTitle>
                        <SheetDescription className="text-[14px] font-medium tracking-normal text-foreground-muted">
                            {selectedCitation.page}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="px-6 py-6 space-y-8">
                        {/* Optimization Checklist */}
                        <div className="space-y-4">
                            <h3 className="text-[14px] font-semibold tracking-normal text-foreground-strong">
                                Optimization Checklist
                            </h3>
                            <div className="space-y-3">
                                {checklist.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2
                                            className={cn(
                                                "h-5 w-5 mt-0.5 shrink-0",
                                                item.done ? "text-positive-default" : "text-border-primary"
                                            )}
                                        />
                                        <span className={cn(
                                            "text-[14px] font-medium tracking-normal",
                                            item.done ? "text-foreground-tertiary" : "text-border-primary"
                                        )}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Context */}
                        <div className="space-y-4">
                            <h3 className="text-[14px] font-semibold tracking-normal text-foreground-strong">
                                AI Context
                            </h3>
                            <p className="text-[14px] font-medium tracking-normal text-foreground-muted leading-relaxed">
                                {selectedCitation.aiContext}
                            </p>
                        </div>

                        {/* Current Stats */}
                        <div className="space-y-4">
                            <h3 className="text-[14px] font-semibold tracking-normal text-foreground-strong">
                                Current Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border border-border-secondary/50 bg-surface-hover/50 p-4">
                                    <p className="text-[12px] font-medium uppercase tracking-wide text-border-primary" style={{ letterSpacing: '0.01em' }}>
                                        Mentions
                                    </p>
                                    <p className="text-[16px] font-semibold tabular-nums text-foreground-strong mt-1">
                                        {selectedCitation.mentions.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border-secondary/50 bg-surface-hover/50 p-4">
                                    <p className="text-[12px] font-medium uppercase tracking-wide text-border-primary" style={{ letterSpacing: '0.01em' }}>
                                        Optimization
                                    </p>
                                    <p className={cn(
                                        "text-[16px] font-semibold tabular-nums mt-1",
                                        selectedCitation.optimizationProgress >= 75 ? "text-positive-default" :
                                            selectedCitation.optimizationProgress >= 40 ? "text-caution-default" : "text-danger-soft"
                                    )}>
                                        {selectedCitation.optimizationProgress}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="px-6 pb-6 flex-col gap-3 sm:flex-col">
                        <Button
                            className="w-full gap-2 bg-brand-deep hover:bg-brand-deep/80 text-foreground-strong text-[14px] font-semibold"
                            onClick={handlePrint}
                        >
                            <Download className="h-4 w-4" />
                            Export to Report
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-border-secondary bg-surface-hover/50 text-foreground-tertiary hover:bg-surface-hover hover:text-foreground-primary text-[14px] font-semibold"
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