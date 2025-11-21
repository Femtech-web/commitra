// 'use client';

// import { useEffect, useRef } from 'react';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// const diffCode = `@@ -12,7 +12,10 @@ export function validateLogin(email, password) {
// -  if (!email) return false;
// +  if (!email || !email.includes('@')) {
// +    throw new Error('Invalid email format');
// +  }

// -  if (password.length < 6) return false;
// +  if (password.length < 8) {
// +    throw new Error('Password must be at least 8 characters');
// +  }`;

// const commitMessage = `feat: improve login validation and fix error codes

// - Add email format validation with '@' check
// - Increase minimum password length from 6 to 8 characters
// - Replace boolean returns with descriptive error messages
// - Improve error handling for better user feedback`;

// export default function DiffShowcase() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const leftPanelRef = useRef<HTMLDivElement>(null);
//   const rightPanelRef = useRef<HTMLDivElement>(null);
//   const glowRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       const timeline = gsap.timeline({
//         scrollTrigger: {
//           trigger: sectionRef.current,
//           start: 'top 60%',
//           end: 'top 20%',
//           scrub: 1,
//         },
//       });

//       // Left panel slides out
//       timeline.from(leftPanelRef.current, {
//         x: -100,
//         opacity: 0,
//         duration: 1,
//       });

//       // Right panel slides in
//       timeline.from(
//         rightPanelRef.current,
//         {
//           x: 100,
//           opacity: 0,
//           duration: 1,
//         },
//         '-=0.5'
//       );

//       // Glow reveal from left to right
//       timeline.from(
//         glowRef.current,
//         {
//           scaleX: 0,
//           transformOrigin: 'left',
//           duration: 1,
//         },
//         '-=0.8'
//       );
//     });

//     return () => ctx.revert();
//   }, []);

//   return (
//     <section ref={sectionRef} className="min-h-screen py-20 px-6 md:px-12 flex items-center">
//       <div className="max-w-7xl mx-auto w-full">
//         <div className="text-center space-y-4 mb-20">
//           <h2 className="text-4xl md:text-6xl font-bold">
//             From <span className="text-red-400">Diff</span> to{' '}
//             <span className="gradient-text">Commit Message</span>
//           </h2>
//           <p className="text-xl text-gray-400">
//             Watch Commitra transform code changes into clear, conventional commits
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
//           {/* Glow line between panels */}
//           <div
//             ref={glowRef}
//             className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4 bg-gradient-to-b from-[#0EA5E9] via-[#6366F1] to-[#06B6D4] opacity-50 blur-sm"
//           />

//           {/* Left Panel - Diff Viewer */}
//           <div ref={leftPanelRef} className="space-y-4">
//             <div className="flex items-center gap-2 text-gray-400">
//               <div className="w-3 h-3 rounded-full bg-red-500" />
//               <span className="text-sm font-semibold">Before</span>
//             </div>

//             <div className="bg-[#0A0A0A] border border-red-500/30 rounded-xl overflow-hidden">
//               <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/30">
//                 <span className="terminal-font text-sm text-red-400">
//                   src/auth/validate.js
//                 </span>
//               </div>
//               <div className="p-6 terminal-font text-sm overflow-x-auto">
//                 <pre className="text-gray-300 leading-relaxed">
//                   {diffCode.split('\n').map((line, i) => (
//                     <div
//                       key={i}
//                       className={`${
//                         line.startsWith('-')
//                           ? 'bg-red-500/20 text-red-300'
//                           : line.startsWith('+')
//                           ? 'bg-green-500/20 text-green-300'
//                           : 'text-gray-400'
//                       } px-2 -mx-2`}
//                     >
//                       {line}
//                     </div>
//                   ))}
//                 </pre>
//               </div>
//             </div>
//           </div>

//           {/* Right Panel - Generated Commit Message */}
//           <div ref={rightPanelRef} className="space-y-4">
//             <div className="flex items-center gap-2 text-gray-400">
//               <div className="w-3 h-3 rounded-full bg-green-500" />
//               <span className="text-sm font-semibold">Generated Commit</span>
//             </div>

//             <div className="bg-[#0A0A0A] border border-[#0EA5E9] rounded-xl overflow-hidden glow-box-primary">
//               <div className="bg-[#0EA5E9]/10 px-4 py-2 border-b border-[#0EA5E9]/30">
//                 <span className="terminal-font text-sm text-[#0EA5E9]">
//                   Commitra Output
//                 </span>
//               </div>
//               <div className="p-6 space-y-4">
//                 {/* Commit type and title */}
//                 <div className="terminal-font">
//                   <span className="text-[#6366F1] font-semibold">feat:</span>
//                   <span className="text-white ml-2">
//                     improve login validation and fix error codes
//                   </span>
//                 </div>

//                 {/* Separator */}
//                 <div className="h-px bg-gradient-to-r from-[#0EA5E9] via-[#6366F1] to-[#06B6D4] opacity-30" />

//                 {/* Commit body */}
//                 <div className="space-y-2 text-gray-300 leading-relaxed">
//                   {commitMessage
//                     .split('\n')
//                     .slice(2)
//                     .map((line, i) => (
//                       <div key={i} className="flex items-start gap-2">
//                         {line.startsWith('-') && (
//                           <>
//                             <span className="text-[#0EA5E9] mt-1">•</span>
//                             <span>{line.substring(2)}</span>
//                           </>
//                         )}
//                         {!line.startsWith('-') && line && (
//                           <span className="text-gray-400">{line}</span>
//                         )}
//                       </div>
//                     ))}
//                 </div>

//                 {/* Success indicator */}
//                 <div className="flex items-center gap-2 pt-4 border-t border-white/10">
//                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
//                   <span className="text-green-400 text-sm">
//                     ✓ Commit message generated successfully
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- Diff + Commit Demo Content ---
const diffCode = `@@ -12,7 +12,10 @@ export function validateLogin(email, password) {
-  if (!email) return false;
+  if (!email || !email.includes('@')) {
+    throw new Error('Invalid email format');
+  }
   
-  if (password.length < 6) return false;
+  if (password.length < 8) {
+    throw new Error('Password must be at least 8 characters');
+  }`;

const commitMessage = `feat: improve login validation and fix error codes

- Add email format validation with '@' check
- Increase minimum password length from 6 to 8 characters
- Replace boolean returns with descriptive error messages
- Improve error handling for better user feedback`;

export default function DiffShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "top 30%",
          scrub: 1,
        },
      });

      // Left → slide in
      tl.from(leftRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Right → slide in
      tl.from(
        rightRef.current,
        {
          x: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        },
        "-=0.6"
      );

      // Middle glow reveal
      tl.from(
        glowRef.current,
        {
          scaleY: 0,
          opacity: 0,
          transformOrigin: "top",
          duration: 1,
          ease: "power2.out",
        },
        "-=0.9"
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6 md:px-12 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-20 px-2">
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            From <span className="text-red-400">Diff</span> to{" "}
            <span className="gradient-text">Commit Message</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400">
            Watch Commitra transform changes into clean, conventional commits
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 relative">
          {/* Glow divider (desktop only) */}
          <div
            ref={glowRef}
            className="hidden lg:block absolute left-1/2 top-0 h-full w-[2px] 
                       bg-gradient-to-b from-[#0EA5E9] via-[#6366F1] to-[#06B6D4]
                       opacity-50 blur-sm -translate-x-1/2"
          />

          {/* Left Panel — Diff */}
          <div ref={leftRef} className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-semibold text-sm">Before</span>
            </div>

            <div className="bg-[#0A0A0A] border border-red-500/30 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/30">
                <span className="terminal-font text-sm text-red-300">
                  src/auth/validate.js
                </span>
              </div>

              {/* Diff content */}
              <div className="p-4 sm:p-6 terminal-font text-sm overflow-x-auto max-h-[350px]">
                <pre className="leading-relaxed">
                  {diffCode.split("\n").map((line, i) => (
                    <div
                      key={i}
                      className={`px-2 -mx-2 ${
                        line.startsWith("-")
                          ? "bg-red-500/20 text-red-300"
                          : line.startsWith("+")
                            ? "bg-green-500/20 text-green-300"
                            : "text-gray-400"
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>

          {/* Right Panel — Commit Message */}
          <div ref={rightRef} className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-semibold text-sm">Generated Commit</span>
            </div>

            <div className="bg-[#0A0A0A] border border-[#0EA5E9] rounded-xl overflow-hidden glow-box-primary">
              {/* Header */}
              <div className="bg-[#0EA5E9]/10 px-4 py-2 border-b border-[#0EA5E9]/30">
                <span className="terminal-font text-sm text-[#0EA5E9]">
                  Commitra Output
                </span>
              </div>

              {/* Commit Body */}
              <div className="p-4 sm:p-6 space-y-5">
                {/* Title */}
                <div className="terminal-font leading-relaxed">
                  <span className="text-[#6366F1] font-semibold">feat:</span>
                  <span className="text-white ml-2">
                    improve login validation and fix error codes
                  </span>
                </div>

                {/* Separator */}
                <div className="h-px bg-gradient-to-r from-[#0EA5E9] via-[#6366F1] to-[#06B6D4] opacity-40" />

                {/* Bullet list */}
                <div className="space-y-3 text-gray-300 leading-relaxed">
                  {commitMessage
                    .split("\n")
                    .slice(2)
                    .map((line, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        {line.startsWith("-") && (
                          <>
                            <span className="text-[#0EA5E9] mt-1">•</span>
                            <span>{line.substring(2)}</span>
                          </>
                        )}
                      </div>
                    ))}
                </div>

                {/* Success */}
                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 text-sm">
                    ✓ Commit message generated successfully
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
