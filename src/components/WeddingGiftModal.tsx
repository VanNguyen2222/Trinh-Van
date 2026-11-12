"use client";

import React, { useState } from "react";

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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex flex-col items-center focus:outline-none cursor-pointer"
        aria-label="Mở hộp mừng cưới"
      >
        <div className="overflow-hidden rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
          <img
            src={buttonImageUrl}
            alt="Hộp mừng cưới"
            className="w-36 h-36 object-cover"
          />
        </div>
        <span className="mt-2 text-sm font-medium text-rose-700 group-hover:text-rose-800">
          Gửi mừng cưới
        </span>
      </button>

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
