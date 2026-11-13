"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface BankInfo {
  role: string;
  name: string;
  bankName: string;
  accountNumber: string;
  qrImageUrl: string;
}

interface WeddingGiftModalProps {
  buttonImageUrl: string;
  groomBank: BankInfo;
  brideBank: BankInfo;
}

export default function WeddingGiftModal({
  buttonImageUrl,
  groomBank,
  brideBank,
}: WeddingGiftModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(accountNumber);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <>
      {/* Nút bấm dạng hình ảnh (Hộp quà / Phong bì mừng cưới) */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)} // Giữ đúng tên hàm mở modal hiện tại của bạn
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="group relative mx-auto flex w-60 flex-col items-center overflow-hidden rounded-2xl border border-[#C2A26A]/50 bg-[#FBF8F2] px-6 pt-6 pb-5 shadow-[0_10px_30px_rgba(110,14,18,0.08)] transition-colors duration-300 hover:border-[#6e0e12]/60 hover:shadow-[0_15px_35px_rgba(110,14,18,0.16)] cursor-pointer"
      >
        {/* Đường viền mảnh trang trí bên trong */}
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-[#C2A26A]/25" />

        {/* Hiệu ứng vệt sáng lướt nhẹ qua thẻ định kỳ */}
        <motion.div
          aria-hidden="true"
          initial={{ x: "-150%" }}
          animate={{ x: "250%" }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            repeatDelay: 2.6,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#C2A26A]/20 to-transparent"
        />

        {/* Ảnh phong bì lắc nhẹ nhàng liên tục theo nhịp */}
        <motion.div
          animate={{
            rotate: Array(0, -4, 4, -3, 3, 0),
            y: Array(0, -3, 0, -2, 0, 0),
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatDelay: 1.8,
            ease: "easeInOut",
          }}
          className="relative z-10 flex items-center justify-center"
        >
          <img
            src={buttonImageUrl}
            alt="Gửi mừng cưới"
            className="h-28 w-auto object-contain mix-blend-multiply drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          />
        </motion.div>

        {/* Đường kẻ mảnh ngăn cách kèm điểm nhấn hình thoi */}
        <div className="relative z-10 my-3.5 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-[#C2A26A]/50" />
          <span className="h-1 w-1 rotate-45 bg-[#6e0e12]" />
          <span className="h-px w-8 bg-[#C2A26A]/50" />
        </div>

        {/* Tiêu đề đồng bộ font Serif & màu đỏ đô */}
        <span className="si-display relative z-10 text-xl font-medium tracking-wide text-[#6e0e12]">
          Gửi Mừng Cưới
        </span>

        {/* Dòng gợi ý nhỏ có nhịp mờ tỏ nhẹ */}
        <motion.span
          animate={{ opacity: Array(0.6, 1, 0.6) }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-[#6e0e12]/80"
        >
          Chạm để mở thiệp mừng
        </motion.span>
      </motion.button>

      {/* Modal hiển thị mã QR */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          {/* Khung nội dung Modal (ngăn sự kiện click xuyên ra nền đen) */}
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b pb-3 mb-5">
              <h3 className="text-xl font-bold text-rose-700">
                Hộp Mừng Cưới
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Lưới hiển thị 2 mã QR của Chú rể và Cô dâu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[groomBank, brideBank].map((person, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center rounded-xl border border-rose-100 bg-rose-50/40 p-4 text-center"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">
                    {person.role}
                  </span>
                  <h4 className="text-base font-bold text-gray-800 mb-3">
                    {person.name}
                  </h4>

                  {/* Ảnh mã QR */}
                  <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-xs border mb-3">
                    <img
                      src={person.qrImageUrl}
                      alt={`Mã QR ${person.role}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Thông tin ngân hàng & Nút Copy */}
                  <p className="text-sm font-medium text-gray-700">
                    {person.bankName}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {person.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(person.accountNumber)}
                      className="rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      {copiedAccount === person.accountNumber
                        ? "Đã chép"
                        : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
