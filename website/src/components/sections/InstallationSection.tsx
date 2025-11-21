"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "1",
    title: "Get a free API key from Groq",
    link: "https://console.groq.com",
    linkText: "console.groq.com",
  },
  {
    number: "2",
    title: "Configure your API key",
    command: "commitra config set GROQ_API_KEY=your_key",
  },
  {
    number: "3",
    title: "Use normally with",
    command: "commitra commit",
  },
  {
    number: "4",
    title: "Optional: Install git hook",
    command: "commitra hook install",
    optional: true,
  },
];

export default function InstallationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      steps.forEach((_, index) => {
        const stepSelector = `.install-step-${index}`;
        const checkSelector = `.checkmark-${index}`;

        // Slide-in animation
        gsap.from(stepSelector, {
          scrollTrigger: {
            trigger: stepSelector,
            start: "top 80%",
            end: "top 50%",
            scrub: 1,
          },
          opacity: 0,
          x: -40,
          duration: 1,
          ease: "power3.out",
        });

        // Checkmark pop animation
        ScrollTrigger.create({
          trigger: stepSelector,
          start: "top 75%",
          onEnter: () =>
            gsap.to(checkSelector, {
              scale: 1,
              opacity: 1,
              duration: 0.6,
              ease: "back.out(1.8)",
            }),
          onLeaveBack: () =>
            gsap.to(checkSelector, {
              scale: 0,
              opacity: 0,
              duration: 0.3,
            }),
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const getStepColor = (i: number) => ["#0EA5E9", "#6366F1", "#06B6D4"][i % 3];

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-12 w-full">
      <div className="max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="text-center space-y-4 mb-20 px-2">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            Start using Commitra in{" "}
            <span className="text-primary glow-primary">10 seconds</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Zero setup friction. Maximum flow state.
          </p>
        </div>

        {/* Steps list */}
        <div className="space-y-10">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`install-step-${i} flex gap-5 md:gap-6 items-start`}
            >
              {/* Checkmark */}
              <div className="relative flex-shrink-0 mt-1">
                <div
                  className={`checkmark-${i} w-8 h-8 rounded-full flex items-center justify-center border-2 scale-0 opacity-0 relative z-10`}
                  style={{
                    borderColor: getStepColor(i),
                    backgroundColor: `${getStepColor(i)}20`,
                  }}
                >
                  <Check
                    className="w-5 h-5"
                    style={{ color: getStepColor(i) }}
                  />
                </div>

                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-40"
                  style={{
                    background: getStepColor(i),
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 md:p-6 hover:border-[#0EA5E9] transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span
                      className="text-2xl md:text-3xl font-bold opacity-30"
                      style={{ color: getStepColor(i) }}
                    >
                      {step.number}
                    </span>

                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {step.title}{" "}
                        {step.optional && (
                          <span className="text-sm text-gray-500">
                            (optional)
                          </span>
                        )}
                      </h3>

                      {/* Link */}
                      {step.link && (
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#0EA5E9] hover:text-[#0EA5E9]/80 transition-colors text-sm md:text-base"
                        >
                          {step.linkText}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}

                      {/* Command */}
                      {step.command && (
                        <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-3 mt-3 terminal-font text-sm md:text-base break-all">
                          <code className="text-gray-300">
                            $ <span className="text-white">{step.command}</span>
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
