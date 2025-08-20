"use client";

import { useEffect } from "react";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSolutionSection from "@/components/sections/ProblemSolutionSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import CTASection from "@/components/sections/CTASection";
import FooterSection from "@/components/sections/FooterSection";

export default function Home() {
  useEffect(() => {
    // 키보드 네비게이션 추가
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const scrollContainer = document.querySelector(".scroll-container");
        const sections = document.querySelectorAll(".section");

        if (!scrollContainer) return;

        const containerRect = scrollContainer.getBoundingClientRect();
        const currentSection = Array.from(sections).findIndex((section) => {
          const rect = section.getBoundingClientRect();
          return (
            rect.top >= containerRect.top - 100 &&
            rect.top <= containerRect.top + 100
          );
        });

        if (e.key === "ArrowDown" && currentSection < sections.length - 1) {
          sections[currentSection + 1].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else if (e.key === "ArrowUp" && currentSection > 0) {
          sections[currentSection - 1].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="scroll-container">
      <HeroSection />
      {/* <ProblemSolutionSection /> */}
      <FeaturesSection />
      <CategoriesSection />
      <HowItWorksSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
