"use client";

import { useEffect, useRef, ReactNode } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll with optimized settings
    const lenis = new Lenis({
      duration: 1,
      easing: (t: any) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.8,
      smoothTouch: false,
      touchMultiplier: 1.5,
      infinite: false,
      syncTouch: true,
      syncTouchLerp: 0.1,
    } as any);

    lenisRef.current = lenis;

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Update ScrollTrigger on window resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}
