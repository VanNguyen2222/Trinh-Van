'use client';

import { motion } from "framer-motion";

export default function WeddingCalendar({ highlightDay = 12 }: { highlightDay?: number }) {
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  // Tháng 12/2026 bắt đầu vào Thứ 3 nên có 1 ô trống ở Thứ 2, tổng 31 ngày
  const calendarCells = [
    null, 1, 2, 3, 4, 5, 6,
    7, 8, 9, 10, 11, 12, 13,
    14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27,
    28, 29, 30, 31,
  ];

  return (
    <div className="relative mx-auto mt-8 max-w-[330px] rounded-2xl border border-[#6e0e12]/30 bg-white/80 px-5 py-6 shadow-xs">
      {/* Tiêu đề Tháng 12 - 2026 */}
      <h4 className="font-calligraphy text-center text-[2rem] font-normal text-[#6e0e12]">
        Tháng 12 - 2026
      </h4>

      {/* Đường kẻ ngang và thứ trong tuần */}
      <div className="mt-3 border-y border-[#6e0e12]/25 py-2">
        <div className="grid grid-cols-7 text-center text-xs font-bold tracking-wider text-[#28221E]">
          {daysOfWeek.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>

      {/* Lưới các ngày trong tháng */}
      <div className="mt-3 grid grid-cols-7 gap-y-2.5 text-center text-sm text-[#28221E]">
        {calendarCells.map((day, idx) => {
          if (!day) return <span key={idx} />;

          const isSunday = (idx + 1) % 7 === 0;
          const isHighlight = day === highlightDay;

          return (
            <div key={idx} className="relative flex h-8 items-center justify-center">
              {isHighlight && (
                <motion.svg
                  initial={{ scale: 0.7, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                  viewBox="0 0 36 32"
                  className="pointer-events-none absolute inset-0 m-auto h-9 w-9 text-[#6e0e12]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M18 29.5C18 29.5 3 20.2 3 10.5C3 5.8 6.8 2 11.5 2C14.3 2 16.8 3.4 18 5.5C19.2 3.4 21.7 2 24.5 2C29.2 2 33 5.8 33 10.5C33 20.2 18 29.5 18 29.5Z" />
                </motion.svg>
              )}
              <span
                className={`relative z-10 ${
                  isHighlight
                    ? "font-bold text-[#6e0e12]"
                    : isSunday
                    ? "font-semibold text-[#28221E]"
                    : "font-normal text-[#28221E]/85"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Họa tiết hoa góc dưới bên phải */}
      <img
        src="/images/asset-09.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -bottom-4 z-10 w-24 select-none object-contain sm:w-28"
      />
    </div>
  );
}
