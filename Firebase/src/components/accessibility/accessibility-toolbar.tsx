
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button"
import { useAccessibility } from "./accessibility-provider"
import { Contrast, ZoomIn, ZoomOut, ChevronsLeft, ChevronsRight, GripVertical, Info } from "lucide-react"
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';


// SVG components for solid triangles
const TriangleUp = () => <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 4L11.5 10L3.5 10L7.5 4Z" fill="currentColor"></path></svg>;
const TriangleDown = () => <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 11L3.5 5H11.5L7.5 11Z" fill="currentColor"></path></svg>;


const ToolbarButton = ({
  onClick,
  disabled,
  ariaLabel,
  showLabel,
  label,
  children,
  onMouseDown,
  side,
}: {
  onClick?: () => void,
  disabled?: boolean,
  ariaLabel: string,
  showLabel: boolean,
  label: string,
  children: React.ReactNode,
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void,
  side: 'left' | 'right',
}) => {
  return (
    <div className={cn(
      "flex items-center gap-2",
      side === 'right' && "flex-row-reverse"
    )}>
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
        toggleShowLabels,
        isToolbarCollapsed,
        toggleToolbarCollapsed
    } = useAccessibility();

    const [isDragging, setIsDragging] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef(0);
    const dragStartTop = useRef(0);
    const [isInTopHalf, setIsInTopHalf] = useState(true);
    const preExpansionTop = useRef<number | null>(null);

    const handleToggleCollapse = () => {
        if (!isToolbarCollapsed) {
            // Collapsing now: save current position before potential bump
            preExpansionTop.current = toolbarPosition.top;
        }
        toggleToolbarCollapsed();
    };

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
        
        preExpansionTop.current = null; // Reset on drag
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
            const newIsInTopHalf = toolbarPosition.top + (toolbarRef.current.offsetHeight / 2) < (window.innerHeight / 2);
            if (newIsInTopHalf !== isInTopHalf) {
                setIsInTopHalf(newIsInTopHalf);
            }
        }
    }, [toolbarPosition.top, isInTopHalf, isToolbarCollapsed]); // Depend on isToolbarCollapsed to re-evaluate

    useEffect(() => {
        const toolbarNode = toolbarRef.current;
        if (!toolbarNode) return;

        const observer = new ResizeObserver(() => {
            let newTop = toolbarPosition.top;
            const toolbarHeight = toolbarNode.offsetHeight;
            
            // If toolbar is now too low, bump it up
            if (newTop + toolbarHeight > window.innerHeight - 16) {
                newTop = window.innerHeight - toolbarHeight - 16;
            }
            
            // Logic for snapping back after collapse
            if (isToolbarCollapsed && preExpansionTop.current !== null) {
                 const newTopCandidate = preExpansionTop.current;
                 if(newTopCandidate > newTop) {
                    newTop = newTopCandidate;
                 }
                 preExpansionTop.current = null;
            }

            if (newTop !== toolbarPosition.top) {
                setToolbarPosition(prev => ({ ...prev, top: newTop }));
            }
        });

        observer.observe(toolbarNode);

        return () => {
            observer.disconnect();
        };
    }, [setToolbarPosition, isToolbarCollapsed, toolbarPosition.top]);


    const ToolbarTitle = () => (
      <div className="text-center py-1">
        <h2 className="font-bold text-sm select-none text-muted-foreground">Tools</h2>
      </div>
    );
    
    const ToggleCollapseButton = () => (
       <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          aria-label={isToolbarCollapsed ? "Expand toolbar" : "Collapse toolbar"}
          className="h-8 w-8 rounded-full"
        >
          {isToolbarCollapsed ? 
             (isInTopHalf ? <TriangleDown /> : <TriangleUp />) :
             (isInTopHalf ? <TriangleUp /> : <TriangleDown />)
          }
        </Button>
    )

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

    const SwitchSideButton = () => (
      <Button
          variant="ghost"
          size="icon"
          onClick={toggleToolbarSide}
          aria-label={`Move toolbar to the ${toolbarPosition.side === 'left' ? 'right' : 'left'}`}
          className="h-8 w-8 rounded-full"
      >
          {toolbarPosition.side === 'left' ? (
              <ChevronsRight className="h-4 w-4" />
          ) : (
              <ChevronsLeft className="h-4 w-4" />
          )}
      </Button>
    );

    const Controls = () => {
      const topHalfControls = (
        <>
          <div className="flex flex-col gap-1">
            <ToolbarButton
              onClick={toggleHighContrast}
              ariaLabel={`Toggle high contrast mode. Currently ${isHighContrast ? 'on' : 'off'}`}
              showLabel={showLabels}
              label="High Contrast"
              side={toolbarPosition.side}
            >
                <Contrast className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={decreaseFontSize}
                disabled={fontSize === 'sm'}
                ariaLabel="Decrease font size"
                showLabel={showLabels}
                label="Smaller Text"
                side={toolbarPosition.side}
            >
                <ZoomOut className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={increaseFontSize}
                disabled={fontSize === 'xl'}
                ariaLabel="Increase font size"
                showLabel={showLabels}
                label="Larger Text"
                side={toolbarPosition.side}
            >
                <ZoomIn className="h-4 w-4" />
            </ToolbarButton>
          </div>
          <Separator className="my-1" />
          <div className="flex flex-col gap-1">
            <ToolbarButton
                onClick={toggleShowLabels}
                ariaLabel={showLabels ? "Hide labels" : "Show labels"}
                showLabel={showLabels}
                label={showLabels ? "Hide Labels" : "Show Labels"}
                side={toolbarPosition.side}
            >
                <Info className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </>
      );

      const bottomHalfControls = (
        <>
          <div className="flex flex-col gap-1">
            <ToolbarButton
                onClick={toggleShowLabels}
                ariaLabel={showLabels ? "Hide labels" : "Show labels"}
                showLabel={showLabels}
                label={showLabels ? "Hide Labels" : "Show Labels"}
                side={toolbarPosition.side}
            >
                <Info className="h-4 w-4" />
            </ToolbarButton>
          </div>
          <Separator className="my-1" />
          <div className="flex flex-col gap-1">
            <ToolbarButton
                onClick={increaseFontSize}
                disabled={fontSize === 'xl'}
                ariaLabel="Increase font size"
                showLabel={showLabels}
                label="Larger Text"
                side={toolbarPosition.side}
            >
                <ZoomIn className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={decreaseFontSize}
                disabled={fontSize === 'sm'}
                ariaLabel="Decrease font size"
                showLabel={showLabels}
                label="Smaller Text"
                side={toolbarPosition.side}
            >
                <ZoomOut className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={toggleHighContrast}
              ariaLabel={`Toggle high contrast mode. Currently ${isHighContrast ? 'on' : 'off'}`}
              showLabel={showLabels}
              label="High Contrast"
              side={toolbarPosition.side}
            >
                <Contrast className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </>
      );

      return (
        <div className={cn("flex flex-col gap-1 p-1", showLabels && "items-start")}>
          {isInTopHalf ? topHalfControls : bottomHalfControls}
        </div>
      );
    };

    const HandleControls = () => {
      if (isInTopHalf) {
        return (
          <>
            <ToolbarTitle />
            <Separator orientation='horizontal' className='w-full' />
            <DragHandle />
            <Separator orientation='horizontal' className='w-full' />
            <SwitchSideButton />
            <Separator orientation='horizontal' className='w-full' />
            <ToggleCollapseButton />
          </>
        )
      }
      return (
        <>
          <ToggleCollapseButton />
          <Separator orientation='horizontal' className='w-full' />
          <SwitchSideButton />
          <Separator orientation='horizontal' className='w-full' />
          <DragHandle />
          <Separator orientation='horizontal' className='w-full' />
          <ToolbarTitle />
        </>
      )
    }

    return (
        <div
            ref={toolbarRef}
            className={cn(
                "fixed z-50 flex",
                toolbarPosition.side === 'right' ? "right-0 flex-row-reverse" : "left-0 flex-row",
                isDragging && "cursor-grabbing",
                isInTopHalf ? "items-start" : "items-end"
            )}
            style={{ 
                top: `${toolbarPosition.top}px`,
            }}
            aria-label="Accessibility Toolbar"
        >
            <div className={cn(
              "flex flex-col items-center justify-center rounded-lg border bg-background/80 backdrop-blur-sm",
            )}>
                <HandleControls />
            </div>
            
            {!isToolbarCollapsed && (
               <div className={cn(
                  "flex flex-col items-stretch rounded-lg border bg-background/80 p-1 shadow-lg backdrop-blur-sm",
               )}>
                  <div className={cn("flex", 
                      showLabels && !isToolbarCollapsed && 'items-start'
                  )}>
                      <Controls />
                  </div>
               </div>
            )}
        </div>
    )
}
