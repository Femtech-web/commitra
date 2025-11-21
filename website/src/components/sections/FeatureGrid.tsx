"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import {
  Zap,
  Bot,
  BookOpen,
  FolderTree,
  Workflow,
  FileText,
  Settings,
  Sparkles,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Zap,
    title: "AI Commit Messages",
    description: "Never write commit messages again.",
    color: "#0EA5E9",
  },
  {
    icon: BookOpen,
    title: "API Documentation",
    description: "Generate API docs automatically.",
    color: "#6366F1",
  },
  {
    icon: FolderTree,
    title: "Folder Tree Visualization",
    description: "Beautiful tree diagrams.",
    color: "#06B6D4",
  },
  {
    icon: Workflow,
    title: "Mermaid Diagrams",
    description: "Instant architecture diagrams.",
    color: "#0EA5E9",
  },
  {
    icon: FileText,
    title: "README Generator",
    description: "Auto-generate README files.",
    color: "#6366F1",
  },
  {
    icon: Settings,
    title: "Multi-Provider Config",
    description: "OpenAI, Groq, Anthropic, Local.",
    color: "#06B6D4",
  },
  {
    icon: Bot,
    title: "Git Hook Integration",
    description: "Works with native git commit.",
    color: "#0EA5E9",
  },
  {
    icon: Sparkles,
    title: "Clean Output",
    description: "Minimal and noise-free.",
    color: "#6366F1",
  },
];

export default function FeatureGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial invisible state
      gsap.set(cardsRef.current, { opacity: 0, y: 60 });

      // Reveal animation
      gsap.to(cardsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "top 40%",
          once: true, // 🔥 prevents disappearing
        },
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-28 md:py-36 px-6 sm:px-8 md:px-12 relative"
    >
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h2
          className="text-center text-3xl sm:text-4xl md:text-6xl font-bold mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Built for{" "}
          <span className="gradient-text font-extrabold">Developers</span>
        </motion.h2>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              ref={(el: any) => el && (cardsRef.current[i] = el)}
              className="relative group bg-[#0A0A0A] p-6 sm:p-7 rounded-2xl border border-white/10 
              transition-all duration-500 hover:border-[#0EA5E9] overflow-hidden"
            >
              {/* Soft glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 blur-2xl"
                style={{
                  background: `radial-gradient(circle, ${f.color}30, transparent 70%)`,
                }}
              />

              <div className="relative z-10 space-y-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl"
                  style={{
                    background: `${f.color}20`,
                    border: `1px solid ${f.color}40`,
                  }}
                >
                  <f.icon
                    className="w-6 h-6 sm:w-7 sm:h-7"
                    style={{ color: f.color }}
                  />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold">{f.title}</h3>

                {/* Description */}
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {f.description}
                </p>

                {/* Underline */}
                <div
                  className="h-0.5 bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] 
                scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
