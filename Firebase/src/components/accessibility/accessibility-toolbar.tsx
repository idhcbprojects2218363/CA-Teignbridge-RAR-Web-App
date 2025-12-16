
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { useAccessibility } from "./accessibility-provider"
import { Contrast, ZoomIn, ZoomOut, ChevronsLeft, ChevronsRight, GripVertical, Info } from "lucide-react"
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const ToolbarButton = ({
  onClick,
  disabled,
  ariaLabel,
  showLabel,
  label,
  children,
  onMouseDown
}: {
  onClick?: () => void,
  disabled?: boolean,
  ariaLabel: string,
  showLabel: boolean,
  label: string,
  children: React.ReactNode,
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel}
          className="h-8 w-8 rounded-full"
          onMouseDown={onMouseDown}
      >
          {children}
      </Button>
      {showLabel && <span className="text-sm pr-2">{label}</span>}
    </div>
  )
}

export default function AccessibilityToolbar() {
    const { 
        isHighContrast, 
        toggleHighContrast, 
        increaseFontSize, 
        decreaseFontSize, 
        fontSize,
        toolbarPosition,
        setToolbarPosition,
        toggleToolbarSide,
        showLabels,
        toggleShowLabels
    } = useAccessibility();

    const [isDragging, setIsDragging] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef(0);
    const dragStartTop = useRef(0);
    const [isInTopHalf, setIsInTopHalf] = useState(true);

    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setIsDragging(true);
        dragStartPos.current = e.clientY;
        dragStartTop.current = toolbarPosition.top;
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const deltaY = e.clientY - dragStartPos.current;
        const newTop = dragStartTop.current + deltaY;

        const toolbarHeight = toolbarRef.current?.offsetHeight || 0;
        const top = Math.max(16, Math.min(newTop, window.innerHeight - toolbarHeight - 16));

        setToolbarPosition(prev => ({ ...prev, top }));
    }, [isDragging, setToolbarPosition]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (toolbarRef.current) {
            const newIsInTopHalf = toolbarPosition.top < window.innerHeight / 2;
            if (newIsInTopHalf !== isInTopHalf) {
                setIsInTopHalf(newIsInTopHalf);
            }
        }
    }, [toolbarPosition.top, isInTopHalf]);

    const ToolbarTitle = () => (
      <div className="text-center py-1">
        <h2 className="font-bold text-sm select-none text-muted-foreground">Tools</h2>
      </div>
    );

    const DragHandle = () => (
      <div 
        className={cn(
          "flex items-center justify-center p-1 cursor-grab active:cursor-grabbing",
        )}
        onMouseDown={handleMouseDown}
        aria-label="Drag to move toolbar"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
    );

    const Controls = () => (
       <div className={cn("flex flex-col gap-1 p-1", showLabels && "items-start")}>
          <div className="flex flex-col gap-1">
            <ToolbarButton
              onClick={toggleHighContrast}
              ariaLabel={`Toggle high contrast mode. Currently ${isHighContrast ? 'on' : 'off'}`}
              showLabel={showLabels}
              label="High Contrast"
            >
                <Contrast className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
                onClick={decreaseFontSize}
                disabled={fontSize === 'sm'}
                ariaLabel="Decrease font size"
                showLabel={showLabels}
                label="Smaller Text"
            >
                <ZoomOut className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={increaseFontSize}
                disabled={fontSize === 'xl'}
                ariaLabel="Increase font size"
                showLabel={showLabels}
                label="Larger Text"
            >
                <ZoomIn className="h-4 w-4" />
            </ToolbarButton>
          </div>
          <Separator className="my-1" />
          <div className="flex flex-col gap-1">
            <ToolbarButton
                onClick={toggleToolbarSide}
                ariaLabel={`Move toolbar to the ${toolbarPosition.side === 'left' ? 'right' : 'left'}`}
                showLabel={showLabels}
                label="Switch Side"
            >
                {toolbarPosition.side === 'left' ? (
                    <ChevronsRight className="h-4 w-4" />
                ) : (
                    <ChevronsLeft className="h-4 w-4" />
                )}
            </ToolbarButton>
            <ToolbarButton
                onClick={toggleShowLabels}
                ariaLabel={showLabels ? "Hide labels" : "Show labels"}
                showLabel={showLabels}
                label={showLabels ? "Hide Labels" : "Show Labels"}
            >
                <Info className="h-4 w-4" />
            </ToolbarButton>
          </div>
      </div>
    );


    return (
        <div
            ref={toolbarRef}
            className={cn(
                "fixed z-50 flex flex-col items-stretch gap-1 rounded-lg border bg-background/80 p-1 shadow-lg backdrop-blur-sm transition-all",
                 toolbarPosition.side === 'right' ? "right-4" : "left-4",
                 isDragging && "cursor-grabbing shadow-2xl"
            )}
            style={{ top: `${toolbarPosition.top}px` }}
            aria-label="Accessibility Toolbar"
        >
          <div className={cn("flex flex-col", isInTopHalf ? 'order-1' : 'order-3')}>
            {isInTopHalf && <ToolbarTitle />}
            {isInTopHalf && <Separator />}
          </div>
          
          <div className={cn("flex items-stretch", 
            showLabels && 'items-start', 
            isInTopHalf ? 'order-2' : 'order-1',
            toolbarPosition.side === 'right' && 'flex-row-reverse'
          )}>
            <DragHandle />
            <Separator orientation="vertical" className="h-auto" />
            <Controls />
          </div>

          <div className={cn("flex flex-col", isInTopHalf ? 'order-3' : 'order-1')}>
             {!isInTopHalf && <Separator />}
             {!isInTopHalf && <ToolbarTitle />}
          </div>
        </div>
    )
}
