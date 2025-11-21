"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ProblemTwistSection() {
  const problemRef = useRef<HTMLDivElement>(null);
  const twistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // PROBLEM REVEAL
      gsap.from(problemRef.current, {
        scrollTrigger: {
          trigger: problemRef.current,
          start: "top 85%",
          end: "top 45%",
          scrub: 1.1,
        },
        opacity: 0,
        y: 80,
      });

      // Commit cards stagger
      gsap.from(".bad-commit", {
        scrollTrigger: {
          trigger: problemRef.current,
          start: "top 70%",
          end: "bottom 40%",
          scrub: 1,
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
      });

      // TWIST SLIDE IN
      gsap.from(twistRef.current, {
        scrollTrigger: {
          trigger: twistRef.current,
          start: "top 85%",
          end: "top 50%",
          scrub: 1.2,
        },
        opacity: 0,
        y: 80,
      });

      // Terminal typing
      const terminalText = "commitra commit";
      const terminalElement = document.querySelector(".terminal-type");

      ScrollTrigger.create({
        trigger: twistRef.current,
        start: "top 65%",
        onEnter: () => {
          let index = 0;
          const interval = setInterval(() => {
            if (index <= terminalText.length) {
              (terminalElement as HTMLElement).textContent =
                "$ " + terminalText.substring(0, index);
              index++;
            } else {
              clearInterval(interval);
            }
          }, 70);
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-32 px-6 md:px-12 overflow-hidden">
      {/* Soft gradient edges */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/20 to-transparent" />

      <div className="max-w-7xl mx-auto space-y-48">
        {/* PROBLEM BLOCK */}
        <div ref={problemRef} className="space-y-16 text-center">
          <h2 className="text-5xl md:text-7xl font-black">
            The <span className="text-red-500">Problem</span>
          </h2>

          <p className="text-xl md:text-3xl text-gray-300 max-w-3xl mx-auto">
            Writing commit messages{" "}
            <span className="text-white line-through">breaks</span> your flow.
          </p>

          {/* BAD COMMITS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {["fix", "update", "final-changes"].map((msg, i) => (
              <div
                key={i}
                className="bad-commit bg-[#0A0A0A] border border-red-500/30 rounded-xl p-6 font-mono text-red-400 shadow-lg"
              >
                <div className="text-gray-500 text-sm mb-2">
                  $ git commit -m
                </div>
                <div className="text-lg">"{msg}"</div>
                <div className="mt-4 text-xs text-red-500">
                  ❌ Not descriptive
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* THE TWIST */}
        <div ref={twistRef} className="space-y-16 text-center">
          <h2 className="text-5xl md:text-7xl font-black">
            The <span className="text-primary glow-primary">Twist</span>
          </h2>

          <p className="text-xl md:text-3xl text-gray-300 max-w-3xl mx-auto">
            <span className="text-secondary">Commitra</span> fixes it forever.
          </p>

          {/* TERMINAL CARD */}
          <div className="bg-[#0A0A0A] border border-[#0EA5E9]/40 rounded-2xl p-8 md:p-10 max-w-2xl mx-auto shadow-xl glow-box-primary">
            <div className="terminal-font space-y-4">
              <div className="text-gray-500 text-sm flex gap-2 items-center">
                <span className="text-green-400">→</span> Preparing commit...
              </div>

              <div className="text-[#0EA5E9] terminal-type text-2xl">$</div>

              <div className="h-px bg-gradient-to-r from-transparent via-[#0EA5E9] to-transparent my-4" />

              <div className="text-left space-y-2 text-sm">
                <div className="text-green-400">✓ Analyzing changes...</div>
                <div className="text-green-400">
                  ✓ Generating commit message...
                </div>

                <div className="mt-4 text-white text-lg">
                  <span className="text-[#6366F1]">feat:</span> improve login
                  validation and fix error codes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
