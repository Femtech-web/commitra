"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, FileCode, Cpu, CheckCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    icon: Search,
    title: "Scan your staged changes",
    description: "Commitra analyzes all files you've staged for commit.",
  },
  {
    icon: FileCode,
    title: "Build structured diff context",
    description: "Creates a clean representation of what changed and why.",
  },
  {
    icon: Cpu,
    title: "Send to AI provider",
    description: "Groq by default — or OpenAI, Anthropic, Local models.",
  },
  {
    icon: CheckCircle,
    title: "Generate & apply message",
    description:
      "Writes a perfect commit message and applies it automatically.",
  },
];

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".how-step", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          end: "bottom 60%",
          scrub: 1,
        },
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      gsap.from(".how-connector", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom top",
          scrub: 1,
        },
        scaleY: 0,
        transformOrigin: "top",
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
      });
    });

    return () => ctx.revert();
  }, []);

  const getColor = (i: number) => ["#0EA5E9", "#6366F1", "#06B6D4"][i % 3];

  return (
    <section className="py-24 px-6 md:px-12 relative">
      <div className="max-w-4xl mx-auto" ref={containerRef}>
        {/* Section Title */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-6xl font-bold">
            How it <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Four simple steps from code → perfect commits
          </p>
        </div>

        <div className="relative border-l border-white/10 ml-8 md:ml-12">
          {steps.map((s, i) => (
            <div key={i} className="mb-16 last:mb-0 how-step relative">
              {/* Connector Line */}
              {i < steps.length - 1 && (
                <div
                  className={`how-connector absolute left-[-1px] top-[4.5rem] h-full w-[2px]`}
                  style={{
                    background: `linear-gradient(${getColor(i)}, ${getColor(i + 1)})`,
                  }}
                />
              )}

              {/* Dot */}
              <div
                className="absolute w-5 h-5 rounded-full left-[-11px] top-4 border-2"
                style={{
                  borderColor: getColor(i),
                  background: `${getColor(i)}40`,
                  boxShadow: `0 0 12px ${getColor(i)}60`,
                }}
              />

              {/* Card */}
              <div className="ml-10 md:ml-16 bg-[#0A0A0A] border border-white/10 rounded-xl p-6 md:p-8 group hover:border-[#0EA5E9] transition-all duration-300">
                {/* Icon */}
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform"
                  style={{
                    border: `1px solid ${getColor(i)}40`,
                    background: `${getColor(i)}15`,
                  }}
                >
                  <s.icon
                    className="w-8 h-8 md:w-10 md:h-10"
                    style={{ color: getColor(i) }}
                  />
                </div>

                {/* Title + Description */}
                <h3 className="text-2xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400 text-base md:text-lg">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
