"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  opacity: number;
  waveOffset: number;
}

export default function ParticleCloud() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const scrollProgress = useRef(0);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#0EA5E9", "#6366F1", "#06B6D4"];
    const particleCount = Math.min(
      150,
      Math.floor((canvas.width * canvas.height) / 16000)
    );

    // Generate particles
    particlesRef.current = Array.from({ length: particleCount }).map((_, i) => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;

      return {
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 2 + 1,
        color: colors[i % colors.length],
        opacity: Math.random() * 0.5 + 0.3,
        waveOffset: Math.random() * Math.PI * 2,
      };
    });

    // Mouse interaction
    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    // Scroll morph into circle
    ScrollTrigger.create({
      trigger: canvas,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() * 0.001;

      particlesRef.current.forEach((p, i) => {
        // Base floating motion (waves)
        p.x = p.baseX + Math.sin(t + p.waveOffset) * 8;
        p.y = p.baseY + Math.cos(t * 0.6 + p.waveOffset) * 8;

        // Add low-frequency jitter like izum.study
        p.x += Math.sin(t * 0.7 + i) * 0.3;
        p.y += Math.cos(t * 0.5 + i) * 0.3;

        // Scroll morph (pull into circle)
        if (scrollProgress.current > 0) {
          const radius = 180 * (1 - scrollProgress.current);
          const angle = (i / particlesRef.current.length) * Math.PI * 2;
          const targetX = canvas.width / 2 + Math.cos(angle) * radius;
          const targetY = canvas.height / 2 + Math.sin(angle) * radius;

          p.x += (targetX - p.x) * 0.035;
          p.y += (targetY - p.y) * 0.035;
        }

        // Mouse repel
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 6;
          p.y += (dy / dist) * force * 6;
        }

        // Draw particle
        ctx.beginPath();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Particle link lines
        particlesRef.current.slice(i + 1).forEach((o) => {
          const dx = o.x - p.x;
          const dy = o.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < 120) {
            ctx.beginPath();
            ctx.globalAlpha = (1 - d / 120) * 0.2;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(o.x, o.y);
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current!);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
