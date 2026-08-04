"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

// Assuming standard shape from Prisma include
type Subcategory = { id: string; name: string };
type Category = { id: string; name: string; slug: string; subcategories: Subcategory[] };

const CATEGORY_SLIDER_IMAGES: Record<string, string> = {
  tops: "/images/slider/tops.webp",
  bottoms: "/images/slider/bottoms.webp",
  outerwear: "/images/slider/outerwear.webp",
  "formal-wear": "/images/slider/formal-wear.webp",
  sportswear: "/images/slider/sportswear.webp",
  accessories: "/images/slider/belts.webp",
};

const MAX_ROTATION_DESKTOP = 8;
const MAX_ROTATION_TABLET = 4;

export function CategoryArcCarousel({ categories }: { categories: Category[] }) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag and Momentum State
  const [isDragging, setIsDragging] = useState(false);
  const [dragThresholdExceeded, setDragThresholdExceeded] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  // To avoid snap fighting momentum, we temporarily disable snap during drag and momentum
  const [isSnapping, setIsSnapping] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const displayCategories = categories.filter((c) => CATEGORY_SLIDER_IMAGES[c.slug]);
  const numCards = displayCategories.length;
  const midIndex = Math.max(1, (numCards - 1) / 2);

  const stopInertia = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragThresholdExceeded(false);
    setIsSnapping(false); // disable snap during interaction
    stopInertia();
    
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    lastXRef.current = e.pageX;
    lastTimeRef.current = Date.now();
    
    // Some browsers apply touch actions that interrupt pointer events
    // We handle this via CSS touch-action: none on the container
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX);
    
    if (Math.abs(walk) > 5) {
      setDragThresholdExceeded(true);
    }
    
    containerRef.current.scrollLeft = scrollLeft - walk;

    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      const dx = e.pageX - lastXRef.current;
      velocityRef.current = dx / dt; 
    }
    lastXRef.current = e.pageX;
    lastTimeRef.current = now;
  };

  const onPointerUpOrLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (!isReducedMotion && containerRef.current) {
      let velocity = velocityRef.current;
      const step = () => {
        if (!containerRef.current) return;
        
        containerRef.current.scrollLeft -= velocity * 16; 
        velocity *= 0.90; 

        if (Math.abs(velocity) > 0.1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          setIsSnapping(true); // Re-enable snap when momentum dies
        }
      };
      
      if (Math.abs(velocity) > 0.1) {
         animationFrameRef.current = requestAnimationFrame(step);
      } else {
         setIsSnapping(true);
      }
    } else {
      setIsSnapping(true);
    }
  };

  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: isReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByAmount(-350);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByAmount(350);
    }
  };

  const snapClass = isSnapping ? "snap-x snap-mandatory" : "";

  return (
    <div className="w-full relative overflow-hidden bg-[var(--color-bg)] py-12 group/carousel">
      <style dangerouslySetInnerHTML={{ __html: `
        .arc-scroll-container::-webkit-scrollbar { display: none; }
        .arc-scroll-container { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
          touch-action: pan-y; /* allow vertical scroll, hijack horizontal via pointer */
        }
        .arc-scroll-container.dragging * {
          user-select: none;
        }
      `}} />

      {/* Arrow Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-8 z-20 pointer-events-none hidden md:block">
        <button 
          onClick={() => scrollByAmount(-350)}
          className="pointer-events-auto h-12 w-12 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          aria-label="Previous categories"
        >
          ←
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-8 z-20 pointer-events-none hidden md:block">
        <button 
          onClick={() => scrollByAmount(350)}
          className="pointer-events-auto h-12 w-12 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-md border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          aria-label="Next categories"
        >
          →
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className={`arc-scroll-container flex overflow-x-auto gap-4 md:gap-6 lg:gap-8 pl-[100px] md:pl-[120px] lg:pl-[160px] pr-6 lg:pr-[120px] py-16 w-full items-center ${snapClass} ${isDragging ? 'dragging cursor-grabbing' : 'cursor-grab'} ${isReducedMotion || isDragging ? 'scroll-auto' : 'scroll-smooth'}`}
        style={{ scrollBehavior: (isReducedMotion || isDragging) ? 'auto' : 'smooth' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUpOrLeave}
        onPointerLeave={onPointerUpOrLeave}
        onKeyDown={onKeyDown}
      >
        {displayCategories.map((cat, index) => {
          const offset = index - midIndex;
          
          const desktopRotation = (offset / midIndex) * MAX_ROTATION_DESKTOP;
          const desktopTranslateY = Math.pow(Math.abs(offset), 2) * 8;

          const tabletRotation = (offset / midIndex) * MAX_ROTATION_TABLET;
          const tabletTranslateY = Math.pow(Math.abs(offset), 2) * 4;

          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              onClick={(e) => {
                if (dragThresholdExceeded) {
                  e.preventDefault(); // prevent navigation if user dragged
                }
              }}
              draggable={false} // prevent ghost image native drag
              className="group snap-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg)] transition-transform duration-300 relative block min-h-[44px]"
              style={{
                '--arc-rotate-lg': isReducedMotion ? '0deg' : `${desktopRotation}deg`,
                '--arc-translate-lg': isReducedMotion ? '0px' : `${desktopTranslateY}px`,
                '--arc-rotate-md': isReducedMotion ? '0deg' : `${tabletRotation}deg`,
                '--arc-translate-md': isReducedMotion ? '0px' : `${tabletTranslateY}px`,
                '--arc-rotate-sm': '0deg',
                '--arc-translate-sm': '0px',
              } as React.CSSProperties}
            >
              <div 
                className="transform transition-transform duration-300 ease-out will-change-transform rotate-[var(--arc-rotate-sm)] translate-y-[var(--arc-translate-sm)] md:rotate-[var(--arc-rotate-md)] md:translate-y-[var(--arc-translate-md)] lg:rotate-[var(--arc-rotate-lg)] lg:translate-y-[var(--arc-translate-lg)]"
              >
                <div className="w-[280px] sm:w-[320px] md:w-[300px] lg:w-[320px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-none relative overflow-hidden group-hover:border-[var(--color-accent)] transition-colors">
                  <div className="aspect-[3/4] w-full relative bg-[var(--color-bg)]">
                    <Image
                      draggable={false}
                      src={CATEGORY_SLIDER_IMAGES[cat.slug]}
                      alt={`${cat.name} category showcase`}
                      fill
                      priority={index < 3}
                      sizes="(max-width: 768px) 320px, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[20%] pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-[var(--color-bg)]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 text-center backdrop-blur-sm z-10 pointer-events-none">
                      <div>
                        <span className="text-sm font-bold tracking-widest uppercase text-[var(--color-text-primary)]">
                          {cat.subcategories.length} SUBCATEGORIES
                        </span>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-100">
                          Explore Collection →
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] group-hover:bg-[var(--color-surface)] transition-colors flex items-center justify-between pointer-events-none">
                    <h3 className="text-base font-bold uppercase tracking-widest text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0 duration-300">
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="text-center mt-6">
        <Link 
          href="/categories" 
          className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1 min-h-[44px] px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <span>View Full Catalog Index</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
