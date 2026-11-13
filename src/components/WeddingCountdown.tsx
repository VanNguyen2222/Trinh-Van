'use client';

import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";

export default function WeddingCountdown({ targetDate = "2026-12-12T11:00:00+07:00" }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Định dạng luôn có 2 chữ số (ví dụ: 07)
  const formatNumber = (num: number) => String(num).padStart(2, "0");

  const items = [
    { label: "NGÀY", value: mounted ? formatNumber(timeLeft.days) : "00" },
    { label: "GIỜ", value: mounted ? formatNumber(timeLeft.hours) : "00" },
    { label: "PHÚT", value: mounted ? formatNumber(timeLeft.minutes) : "00" },
    { label: "GIÂY", value: mounted ? formatNumber(timeLeft.seconds) : "00" },
  ];

  const fadeInUp : Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
      className="mx-auto mt-10 max-w-md"
    >
      {/* Tiêu đề giống ảnh mẫu, đổi sang màu đỏ đô */}
      <h4 className="si-display text-center text-base font-medium uppercase tracking-[0.28em] text-[#6e0e12] sm:text-lg">
        ĐẾM NGƯỢC NGÀY CƯỚI
      </h4>

      {/* Lưới 4 ô vuông bo góc */}
      <div className="mt-5 grid grid-cols-4 gap-2.5 sm:gap-3.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center rounded-xl border border-[#6e0e12]/25 bg-white/85 py-3.5 shadow-2xs sm:py-4"
          >
            <span className="si-display text-2xl font-semibold leading-none text-[#6e0e12] sm:text-3xl">
              {item.value}
            </span>
            <span className="mt-2 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[#6e0e12]/75 sm:text-[0.68rem]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
