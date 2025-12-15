
'use client';

import { Button } from "@/components/ui/button"
import { useAccessibility } from "./accessibility-provider"
import { Contrast, ZoomIn, ZoomOut } from "lucide-react"

export default function AccessibilityToolbar() {
    const { isHighContrast, toggleHighContrast, increaseFontSize, decreaseFontSize, fontSize } = useAccessibility();

    return (
        <div
            className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border bg-background/80 p-1 shadow-lg backdrop-blur-sm"
            aria-label="Accessibility Toolbar"
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleHighContrast}
                className="h-8 w-8 rounded-full"
                aria-label={`Toggle high contrast mode. Currently ${isHighContrast ? 'on' : 'off'}`}
            >
                <Contrast className="h-4 w-4" />
            </Button>
            
            <Button
                variant="ghost"
                size="icon"
                onClick={decreaseFontSize}
                disabled={fontSize === 'sm'}
                aria-label="Decrease font size"
                className="h-8 w-8 rounded-full"
            >
                <ZoomOut className="h-4 w-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={increaseFontSize}
                disabled={fontSize === 'xl'}
                aria-label="Increase font size"
                className="h-8 w-8 rounded-full"
            >
                <ZoomIn className="h-4 w-4" />
            </Button>
        </div>
    )
}

    