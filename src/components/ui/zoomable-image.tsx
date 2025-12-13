"use client";

import { useState, useRef, MouseEvent } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface ZoomableImageProps extends ImageProps {
    wrapperClassName?: string;
}

export function ZoomableImage({
    className,
    wrapperClassName,
    ...props
}: ZoomableImageProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const { left, top, width, height } =
            containerRef.current.getBoundingClientRect();

        // Calculate mouse position relative to the image container
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setPosition({ x, y });
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative overflow-hidden w-full h-full cursor-zoom-in",
                wrapperClassName
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <Image
                {...props}
                className={cn(
                    "transition-transform duration-200 ease-out will-change-transform",
                    className
                )}
                style={{
                    transformOrigin: `${position.x}% ${position.y}%`,
                    transform: isHovered ? "scale(2)" : "scale(1)",
                }}
            />
        </div>
    );
}
