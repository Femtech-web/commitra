"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Copy, Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const commands = [
  { text: "$ git add .", delay: 0 },
  { text: "$ commitra commit", delay: 800 },
  { text: "✓ Analysing changes...", delay: 1600, color: "text-green-400" },
  { text: "✓ Writing commit message...", delay: 2400, color: "text-green-400" },
  {
    text: "→ feat: improve login validation and fix incorrect error codes",
    delay: 3200,
    color: "text-[#0EA5E9]",
  },
];

export default function TerminalDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [displayed, setDisplayed] = useState<typeof commands>([]);
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Terminal entrance animation
      gsap.from(terminalRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "power3.out",
      });

      // Command typing sequence
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 60%",
        onEnter: () => {
          setDisplayed([]);
          commands.forEach((cmd) =>
            setTimeout(() => setDisplayed((prev) => [...prev, cmd]), cmd.delay)
          );
        },
        onLeaveBack: () => {
          // reset when scrolling back up
          setDisplayed([]);
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // Copy handlers
  const copyToClipboard = (text: string, setter: any) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 1500);
  };

  return (
    <section
      ref={sectionRef}
      className="min-h-screen py-20 px-6 sm:px-8 md:px-12 flex items-center"
    >
      <div className="max-w-5xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 px-4">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
            See it in{" "}
            <span className="text-secondary glow-secondary">Action</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-xl mx-auto">
            Watch Commitra generate clean commit messages from real code
            changes.
          </p>
        </div>

        {/* Terminal */}
        <div ref={terminalRef} className="relative w-full">
          {/* Terminal top bar */}
          <div className="bg-[#1a1a1a] rounded-t-xl border border-white/10 border-b-0 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 text-center text-sm text-gray-500 terminal-font hidden sm:block">
              terminal — bash
            </div>
          </div>

          {/* Terminal body */}
          <div className="bg-[#0A0A0A] border border-[#0EA5E9] rounded-b-xl p-6 sm:p-8 glow-box-primary min-h-[280px] sm:min-h-[320px] md:min-h-[350px] terminal-font text-sm sm:text-base">
            <div className="space-y-3 leading-relaxed">
              {displayed.map((cmd, i) => (
                <div
                  key={i}
                  className={`${cmd.color || "text-white"} animate-fade-in`}
                >
                  {cmd.text}
                </div>
              ))}
              {displayed.length === commands.length && (
                <div className="animate-pulse text-white">_</div>
              )}
            </div>
          </div>
        </div>

        {/* Copy commands */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Install command */}
          <div className="bg-[#0A0A0A] rounded-lg border border-white/10 p-5 sm:p-6 hover:border-[#0EA5E9] transition-all">
            <div className="flex items-center justify-between">
              <code className="terminal-font text-xs sm:text-sm text-gray-300">
                npm install -g commitra
              </code>
              <button
                onClick={() =>
                  copyToClipboard("npm install -g commitra", setCopied1)
                }
                className="p-2 hover:bg-white/5 rounded-lg transition"
              >
                {copied1 ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Config command */}
          <div className="bg-[#0A0A0A] rounded-lg border border-white/10 p-5 sm:p-6 hover:border-[#6366F1] transition-all">
            <div className="flex items-center justify-between">
              <code className="terminal-font text-xs sm:text-sm text-gray-300">
                commitra config set GROQ_API_KEY=...
              </code>
              <button
                onClick={() =>
                  copyToClipboard(
                    "commitra config set GROQ_API_KEY=your_key",
                    setCopied2
                  )
                }
                className="p-2 hover:bg-white/5 rounded-lg transition"
              >
                {copied2 ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
