"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, BookOpen, Download } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".final-title", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".final-button", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "top 40%",
          scrub: 1,
        },
        opacity: 0,
        y: 60,
        stagger: 0.15,
        ease: "power3.out",
      });
    });

    return () => ctx.revert();
  }, []);

  // Animated Wave Canvas Background
  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, "rgba(14,165,233,0.15)");
      gradient.addColorStop(0.5, "rgba(99,102,241,0.15)");
      gradient.addColorStop(1, "rgba(6,182,212,0.15)");

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const y =
            Math.sin((x * 0.01 + time + i * 2) * 0.6) * (25 + i * 15) +
            h / 2 +
            i * 15;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5 - i * 0.3;
        ctx.stroke();
      }

      time += 0.02;
      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-24 px-6 md:px-12 flex items-center justify-center overflow-hidden"
    >
      {/* Background animated waves */}
      <canvas
        ref={waveRef}
        className="absolute inset-0 w-full h-full opacity-40"
      />

      {/* Dark gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
        {/* Title */}
        <div className="final-title space-y-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Build <span className="text-primary glow-primary">fast</span>.
            <br />
            Commit{" "}
            <span className="text-secondary glow-secondary">effortlessly</span>.
          </h2>

          <p className="text-xl sm:text-2xl text-gray-400 font-light">
            Commitra.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-6">
          {/* Install Button */}
          <a href="#" className="final-button group relative w-full sm:w-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0EA5E9] via-[#6366F1] to-[#06B6D4] rounded-xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity"></div>

            <div className="relative flex items-center justify-center gap-3 px-8 py-5 rounded-xl bg-gradient-to-r from-[#0EA5E9] via-[#6366F1] to-[#06B6D4] font-semibold text-lg hover:scale-105 transition-transform">
              <Download className="w-6 h-6" />
              <span>Install Now</span>
            </div>
          </a>

          {/* GitHub */}
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="final-button w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all group"
          >
            <Github className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span>GitHub</span>
          </a>

          {/* Docs */}
          <a
            href={process.env.NEXT_PUBLIC_NPM_URL}
            className="final-button w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all group"
          >
            <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>Documentation</span>
          </a>
        </div>

        {/* Footer */}
        <div className="pt-10 text-gray-500 text-sm tracking-wide">
          <p>Made with ❤️ for developers who value their flow.</p>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
