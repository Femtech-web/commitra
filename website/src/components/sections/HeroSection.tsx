"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Copy, Check, Github } from "lucide-react";
import ParticleCloud from "@/components/ParticleCloud";

export default function HeroSection() {
  const [copied, setCopied] = useState(false);
  const [terminalText, setTerminalText] = useState("");

  const asciiArt = `
   ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗████████╗██████╗  █████╗ 
  ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║╚══██╔══╝██╔══██╗██╔══██╗
  ██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║   ██████╔╝███████║
  ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║   ██╔══██╗██╔══██║
  ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║
   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
  `;

  // ASCII typing effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < asciiArt.length) {
        setTerminalText(asciiArt.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 6);
    return () => clearInterval(interval);
  }, []);

  // Fade-in animations
  useEffect(() => {
    gsap.from(".fade-in", {
      opacity: 0,
      y: 20,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      delay: 1,
    });
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("npm install -g commitra");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      {/* Particle Background */}
      <ParticleCloud />

      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* ASCII LOGO */}
        <pre className="terminal-font text-primary text-[7px] sm:text-[9px] md:text-[11px] opacity-70 mb-6 fade-in whitespace-pre leading-tight">
          {terminalText}
        </pre>

        {/* TITLE */}
        <h1 className="fade-in text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          You don’t have to{" "}
          <span className="text-primary glow-primary">think</span> about commit
          messages anymore.
        </h1>

        {/* SUBTITLE */}
        <p className="fade-in mt-6 text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          Commitra writes{" "}
          <span className="text-secondary">clean, accurate</span> commit
          messages using AI — instantly.
        </p>

        {/* CTA */}
        <div className="fade-in mt-10 flex flex-col sm:flex-row items-center gap-5">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-3 px-6 py-4 border border-primary bg-black/40
              rounded-lg hover:bg-primary/10 transition-all duration-300 glow-box-primary"
          >
            <code className="terminal-font text-white">
              npm install -g commitra
            </code>
            {copied ? (
              <Check className="text-green-400 w-4 h-4" />
            ) : (
              <Copy className="text-primary w-4 h-4" />
            )}
          </button>

          <a
            href={process.env.NEXT_PUBLIC_GITHUB_URL}
            target="_blank"
            className="flex items-center gap-3 px-6 py-4 border border-white/20 rounded-lg hover:border-secondary hover:bg-secondary/10 transition-all duration-300"
          >
            <Github className="w-5 h-5" />
            GitHub
          </a>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="fade-in mt-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
