// src/app/components/LandingPage.tsx
'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import heroImage from "../../../public/hero-image.png"; // place the image in public/

import styles from "./LandingPage.module.css";

const LandingPage: React.FC = () => {
  const [shadow, setShadow] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      setShadow({
        x: (clientX - centerX) * 0.04,
        y: (clientY - centerY) * 0.04,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={styles.landingPage}>
      <motion.div className={styles.heroSection}>
        <div
          style={{
            filter: `drop-shadow(${-shadow.x}px ${-shadow.y}px 7px rgba(0, 0, 0, 0.9))`,
          }}
        >
          <Image
            src={heroImage}
            alt="Hero"
            width={600}
            height={400}
            className={styles.heroImage}
            priority // preloads image for faster rendering
          />
        </div>
        <p className={styles.heroTagline}>From Grim to Gleam In Minutes</p>
      </motion.div>
    </div>
  );
};

export default LandingPage;
