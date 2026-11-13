'use client';

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { weddingData } from '@/data/weddingData';
import SeoulGlints from '@/components/SeoulGlints';
import MusicPlayer from '@/components/MusicPlayer';
import WeddingGiftModal from '@/components/WeddingGiftModal';
import WeddingCalendar from '@/components/WeddingCalendar';
import { motion, AnimatePresence } from "framer-motion";
import WeddingCountdown from '@/components/WeddingCountdown';

interface HeartItem {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  sway: number;
}

function WeddingCardContent() {
  const searchParams = useSearchParams();
  const guestParam = searchParams.get('to');
  const guestName = guestParam ? decodeURIComponent(guestParam) : 'Quý Khách';

  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const [guestbookName, setGuestbookName] = useState('');
  const [wishes, setWishes] = useState('');
  const [guestbook, setGuestbook] = useState<Array<{ name: string; content: string; time: string }>>([
    { name: "Anh Tuấn", content: "Chúc hai bạn trăm năm hạnh phúc, sớm có quý tử nhé!", time: "10:15 - 05/02/2027" }
  ]);
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not_attending' | ''>('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const album = weddingData.album;


  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleOpenCard = () => {
    setIsOpen(true);
    setIsPlaying(true);
    setTimeout(() => {
      mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestbookName.trim() || !wishes.trim()) return;

    // 1. Lưu tạm dữ liệu khách vừa nhập
    const currentName = guestbookName.trim();
    const currentWishes = wishes.trim();
    const currentTime = new Date().toISOString();

    // 2. Hiển thị ngay lập tức lên giao diện + bắn tim (0 giây chờ đợi)
    setGuestbook((prev) => [
      { name: currentName, content: currentWishes, time: currentTime },
      ...prev,
    ]);
    setGuestbookName("");
    setWishes("");
    triggerHearts();

    // 3. Gửi âm thầm lên Google Sheets ở chế độ nền (không dùng await chặn giao diện)
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Bỏ qua bước kiểm tra CORS preflight giúp gửi nhanh hơn
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        type: "guestbook",
        name: currentName,
        content: currentWishes,
      }),
    }).catch((error) => {
      console.error("Lỗi lưu lời chúc ngầm:", error);
    });
  };


  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpStatus || !rsvpName.trim()) return;

    const currentName = rsvpName.trim();
    const currentStatus = rsvpStatus;

    // 1. Chuyển sang màn hình cảm ơn + bắn tim ngay lập tức
    setRsvpSubmitted(true);
    triggerHearts();

    // 2. Gửi dữ liệu âm thầm lên Google Sheets
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        type: "rsvp",
        name: currentName,
        status: currentStatus,
      }),
    }).catch((error) => {
      console.error("Lỗi lưu RSVP ngầm:", error);
    });
  };

  // Chuyển sang ảnh tiếp theo (8/8 -> 1/8)
  const nextPhoto = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || album.length === 0) return null;
      return (prev + 1) % album.length;
    });
  }, [album.length]);

  // Quay lại ảnh trước đó (1/8 -> 8/8)
  const prevPhoto = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || album.length === 0) return null;
      return (prev - 1 + album.length) % album.length;
    });
  }, [album.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, nextPhoto, prevPhoto]);

  const mapUrl = new URL("https://google.com");
  mapUrl.pathname = "/maps/search/";
  mapUrl.searchParams.append("api", "1");
  mapUrl.searchParams.append("query", weddingData.events.groomParty.address);

  // Cấu hình hiệu ứng trượt lên nhẹ nhàng cho toàn trang
  const fadeInUp = {
    hidden: { opacity: 0, y: 28 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  // Cấu hình hiệu ứng xuất hiện lần lượt từng phần tử con (stagger)
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  // State lưu danh sách các trái tim đang bay
  const [hearts, setHearts] = useState<HeartItem[]>([]);

  const triggerHearts = () => {
    const totalHearts = 24; // Số lượng tim rải đều khắp trang
    const newHearts: HeartItem[] = Array.from({ length: totalHearts }).map((_, i) => {
      // Chia đều chiều ngang thành các làn, cộng thêm độ lệch nhỏ cho tự nhiên
      const laneWidth = 92 / totalHearts;
      const left = 4 + i * laneWidth + (Math.random() * laneWidth * 0.6);

      return {
        id: Date.now() + i,
        left,
        size: Math.random() * 14 + 16, // Kích thước 16px - 30px
        delay: Math.random() * 0.8, // Xuất hiện rải rác trong 0.8s đầu
        duration: Math.random() * 1.5 + 2.8, // Bay lên trong 2.8s - 4.3s
        sway: (Math.random() - 0.5) * 60, // Lắc nhẹ sang trái/phải khi bay
      };
    });

    setHearts((prev) => [...prev, ...newHearts]);

    // Tự động dọn dẹp sau 5.2 giây (khi tất cả tim đã bay hết lên trên)
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 5200);
  };

  // 1. Dán đường link Web App URL bạn vừa copy vào đây
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxL-CUuTK8Ld0NBjo5VdJ5pxilOnjay8U6kMPKQNrOUS5A1I-hfJf8CEWJIz8YhjusOrw/exec";

  // 2. Thêm state quản lý trạng thái đang gửi (tránh khách bấm nhiều lần)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName !== 'Quý Khách' ? guestName : '');

  // 3. Tự động tải toàn bộ lời chúc của mọi người khi mở trang
  useEffect(() => {
    fetch(GOOGLE_SCRIPT_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGuestbook(data);
        }
      })
      .catch((err) => console.error("Lỗi tải sổ lưu bút:", err));
  }, []);

  const formatVietnamTime = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    // Nếu dữ liệu đã là chuỗi text bình thường thì giữ nguyên
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const [wishSlideIndex, setWishSlideIndex] = useState(0);
  const [isPausedSlide, setIsPausedSlide] = useState(false);

  // Tự động chuyển sang lời chúc tiếp theo sau mỗi 4.5 giây
  useEffect(() => {
    if (guestbook.length <= 1 || isPausedSlide) return;

    const timer = setInterval(() => {
      setWishSlideIndex((prev) => (prev + 1) % guestbook.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [guestbook.length, isPausedSlide]);

  // Khi có lời chúc mới được gửi lên, tự động nhảy về slide đầu tiên (mới nhất)
  const handlePrevWish = () => {
    setWishSlideIndex((prev) => (prev - 1 + guestbook.length) % guestbook.length);
  };

  const handleNextWish = () => {
    setWishSlideIndex((prev) => (prev + 1) % guestbook.length);
  };

  const INITIAL_PHOTO_COUNT = 6;
  const previewAlbum = album.slice(0, INITIAL_PHOTO_COUNT);

  return (
    <main className="relative min-h-screen w-full bg-[#FBF8F2] overflow-x-hidden">
  
    {/* ================= 1. TRANG BÌA (FIXED FULLSCREEN OVERLAY) ================= */}
      <div
        className={`fixed inset-0 z-50 h-full w-full bg-[#28221E] transition-all duration-1000 ease-in-out ${
          isOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="relative mx-auto h-full w-full overflow-hidden shadow-2xl">
          {/* Ảnh nền phóng nhẹ từ từ (Ken Burns effect) */}
          <motion.img
            initial={{ scale: 1.12 }}
            animate={{ scale: 1.03 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="/images/1Q9A1295.JPG"
            alt="Quốc Trịnh & Thị Vân"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <SeoulGlints />

          {/* Nội dung trang bìa xuất hiện theo nhịp */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative z-10 flex h-full flex-col items-center justify-end px-7 pt-24 pb-14 text-center sm:px-9 sm:pb-16"
          >
            <motion.p variants={fadeInUp} className="si-display mb-6 flex items-center justify-center gap-3 text-[0.7rem] uppercase tracking-[0.34em] text-white/80">
              <span className="h-px w-6 bg-white/50" />
              WE&apos;RE GETTING MARRIED
              <span className="h-px w-6 bg-white/50" />
            </motion.p>
            
            <motion.h1 variants={fadeInUp} className="si-display text-[2.7rem] leading-tight font-medium text-white sm:text-[3.3rem]">
              {weddingData.couple.groom.shortName}
            </motion.h1>
            
            <motion.div variants={fadeInUp} className="my-3 flex items-center justify-center gap-4 text-white/90">
              <span className="h-px w-12 bg-white/50" />
              <span className="si-display text-xl italic sm:text-2xl">&amp;</span>
              <span className="h-px w-12 bg-white/50" />
            </motion.div>
            
            <motion.h2 variants={fadeInUp} className="si-display text-[2.7rem] leading-tight font-medium text-white sm:text-[3.3rem]">
              {weddingData.couple.bride.shortName}
            </motion.h2>

            <motion.div variants={fadeInUp} className="mt-7 text-center">
              <p className="si-display text-[1.55rem] font-medium tracking-[0.13em] text-white sm:text-[1.85rem]">
                12 . 12 . 2026
              </p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-widest text-white/80">
                THỨ 7
              </p>
              <p className="si-display mt-1 text-[0.86rem] italic text-white/90">
                Tức ngày 04 tháng 11 năm Bính Ngọ
              </p>
            </motion.div>

            {/* Nút Mở Thiệp có nhịp đập nhẹ thu hút bấm */}
            <motion.button
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleOpenCard}
              className="group relative mt-9 inline-flex items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white/10 px-10 py-3.5 text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/20 shadow-lg"
            >
              <span className="relative z-10">MỞ THIỆP</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
            </motion.button>
          </motion.div>
        </div>
      </div>

    {/* ================= 2. KHUNG NỘI DUNG CHÍNH ================= */}
      <div className="relative mx-auto bg-[#FBF8F2] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <div ref={mainContentRef} className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* SECTION 01: CÔ DÂU & CHÚ RỂ */}
        <section className="relative overflow-hidden px-5 py-16 sm:px-6 sm:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="mb-14 text-center"
          >
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#6e0e12]/70">
              GROOM &amp; BRIDE
            </p>
            <h2 className="si-display mt-2 text-[2.1rem] font-medium text-[#6e0e12] sm:text-[2.5rem]">
              Chú Rể &amp; Cô Dâu
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-[#6e0e12]/40" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#6e0e12]" />
              <span className="h-px w-12 bg-[#6e0e12]/40" />
            </div>
          </motion.div>

          <div className="mx-auto mt-8 flex flex-col gap-12 sm:gap-16">
            {/* Chú Rể trượt nhẹ từ trái vào */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex items-center gap-6 sm:gap-9"
            >
              <div className="relative w-[43%] max-w-[208px] shrink-0">
                <div className="overflow-hidden rounded-t-full rounded-b-xl border-2 border-[#C2A26A]/40 p-1 bg-[#FBF8F2] shadow-md">
                  <img
                    src={weddingData.couple.groom.photo}
                    alt={weddingData.couple.groom.fullName}
                    className="aspect-[3/4] w-full rounded-t-full rounded-b-lg object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[0.7rem] uppercase tracking-widest text-[#000]">CHÚ RỂ</p>
                <h3 className="si-display text-[1.6rem] font-medium text-[#6e0e12]">
                  {weddingData.couple.groom.fullName}
                </h3>
                <p className="mt-2 text-xs italic text-[#000] leading-relaxed">
                  &quot;Thật may mắn vì trong biển người mênh mông, anh đã tìm thấy em.&quot;
                </p>
              </div>
            </motion.div>

            {/* Cô Dâu trượt nhẹ từ phải vào */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex flex-row-reverse items-center gap-6 sm:gap-9"
            >
              <div className="relative w-[43%] max-w-[208px] shrink-0">
                <div className="overflow-hidden rounded-t-full rounded-b-xl border-2 border-[#C2A26A]/40 p-1 bg-[#FBF8F2] shadow-md">
                  <img
                    src={weddingData.couple.bride.photo}
                    alt={weddingData.couple.bride.fullName}
                    className="aspect-[3/4] w-full rounded-t-full rounded-b-lg object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
              <div className="flex-1 text-right">
                <p className="text-[0.7rem] uppercase tracking-widest text-[#000]">CÔ DÂU</p>
                <h3 className="si-display text-[1.6rem] font-medium text-[#6e0e12]">
                  {weddingData.couple.bride.fullName}
                </h3>
                <p className="mt-2 text-xs italic text-[#000] leading-relaxed">
                  &quot;Cảm ơn anh vì đã luôn yêu thương và trân trọng em mỗi ngày.&quot;
                </p>
              </div>
            </motion.div>
          </div>
        </section>

      {/* SECTION 02: HAI BÊN GIA ĐÌNH */}
        <section className="relative overflow-hidden bg-[#F1EADD] px-5 py-16 sm:px-6 sm:py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#6e0e12]/70">
              OUR FAMILIES
            </p>
            <h2 className="si-display mt-2 text-[2.1rem] font-medium text-[#6e0e12] sm:text-[2.4rem]">
              Hai Bên Gia Đình
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-[#6e0e12]/40" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#6e0e12]" />
              <span className="h-px w-12 bg-[#6e0e12]/40" />
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid grid-cols-2 text-center"
          >
            <motion.div variants={fadeInUp} className="border-r border-[#C9B79C]/50 pr-3">
              <p className="text-[0.64rem] uppercase tracking-[0.26em] text-[#000]">Nhà Trai</p>
              <span className="inline-block h-px w-12 bg-[#6e0e12]/40" />
              <div className="mt-2 space-y-1">
                <p className="si-display text-[1.2rem] font-medium text-[#6e0e12]">{weddingData.families.groom.fatherName}</p>
                <p className="si-display text-[1.2rem] font-medium text-[#6e0e12]">{weddingData.families.groom.motherName}</p>
              </div>
              <p className="mt-4 text-[0.78rem] italic text-[#000]/60">{weddingData.families.groom.address}</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="pl-3">
              <p className="text-[0.64rem] uppercase tracking-[0.26em] text-[#000]">Nhà Gái</p>
              <span className="inline-block h-px w-12 bg-[#6e0e12]/40" />
              <div className="mt-2 space-y-1">
                <p className="si-display text-[1.2rem] font-medium text-[#6e0e12]">{weddingData.families.bride.fatherName}</p>
                <p className="si-display text-[1.2rem] font-medium text-[#6e0e12]">{weddingData.families.bride.motherName}</p>
              </div>
              <p className="mt-4 text-[0.78rem] italic text-[#000]/60">{weddingData.families.bride.address}</p>
            </motion.div>
          </motion.div>
        </section>

          {/* SECTION LỜI MỜI */}
          <section className="relative overflow-hidden bg-[#FBF8F2] px-6 py-16 text-center sm:py-20">
            {/* Họa tiết SVG cành lá */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={staggerContainer}
              >
              {/* Họa tiết SVG cành lá */}
              <motion.div variants={fadeInUp} className="mb-6 flex justify-center text-[#6e0e12]" aria-hidden="true">
                <svg width="120" height="24" viewBox="0 0 120 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M 10 18 Q 40 6, 60 12 Q 80 18, 110 6" />
                  <path d="M 35 12 Q 38 6, 44 6 Q 40 12, 35 12 Z" />
                  <path d="M 55 11 Q 53 17, 47 18 Q 50 12, 55 11 Z" />
                  <path d="M 75 12 Q 78 7, 84 7 Q 80 13, 75 12 Z" />
                </svg>
              </motion.div>

            {/* SECTION LỄ THÀNH HÔN */}
              <motion.div variants={fadeInUp} className="space-y-1">
                <p className="text-[0.88rem] uppercase tracking-[0.22em] text-[#6e0e12] sm:text-[0.74rem]">
                  TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN CỦA CON CHÚNG TÔI
                </p>
              </motion.div>

              {/* Khối Tên Chú Rể & Cô Dâu Calligraphy */}
              <motion.div variants={fadeInUp} className="my-8 space-y-2">
                <h2 className="font-calligraphy text-[3.2rem] font-normal leading-tight text-[#6e0e12] sm:text-[4.2rem]">
                  {weddingData.couple.groom.fullName}
                </h2>

                <div className="flex items-center justify-center gap-3 text-[#6e0e12]">
                  <svg width="32" height="12" viewBox="0 0 32 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                    <path d="M 2 8 Q 12 2, 30 6" />
                    <path d="M 12 6 Q 14 2, 18 2 Q 15 6, 12 6 Z" />
                  </svg>

                  <span className="font-calligraphy text-2xl italic text-[#6e0e12]">&amp;</span>

                  <svg width="32" height="12" viewBox="0 0 32 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="scale-x-[-1]">
                    <path d="M 2 8 Q 12 2, 30 6" />
                    <path d="M 12 6 Q 14 2, 18 2 Q 15 6, 12 6 Z" />
                  </svg>
                </div>

                <h2 className="font-calligraphy text-[3.2rem] font-normal leading-tight text-[#6e0e12] sm:text-[4.2rem]">
                  {weddingData.couple.bride.fullName}
                </h2>
              </motion.div>

              {/* Thông tin Địa điểm */}
              <motion.div variants={fadeInUp} className="mt-4">
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-[#6e0e12] sm:text-[0.72rem]">
                  HÔN LỄ ĐƯỢC CỬ HÀNH TRANG TRỌNG TẠI
                </p>
                <h3 className="si-display mt-3 text-xl font-semibold uppercase tracking-wider text-[#6e0e12] sm:text-2xl">
                  {weddingData.events.ceremony.venue}
                </h3>
                <p className="mt-1 text-sm italic text-[#6e0e12]">{weddingData.events.ceremony.address}</p>
                <p className="mt-3 text-xs font-semibold tracking-wider text-[#6e0e12]">
                  VÀO LÚC {weddingData.events.ceremony.time} · {weddingData.events.ceremony.dayOfWeek}
                </p>
                <p className="si-display mt-1 text-2xl font-semibold text-[#6e0e12]">{weddingData.events.ceremony.date}</p>
                <p className="mt-1 text-xs italic text-[#6e0e12]">({weddingData.events.ceremony.lunar})</p>
              </motion.div>
            </motion.div>
          </section>

          {/* SECTION 04: ALBUM ĐÁM CƯỚI */}
          <section className="relative overflow-hidden bg-[#F1EADD] px-5 py-16 sm:px-6 sm:py-24">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              className="mb-12 text-center"
            >
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#6e0e12]/70">
                GALLERY
              </p>
              <h2 className="si-display mt-2 text-[2.1rem] font-medium text-[#6e0e12] sm:text-[2.4rem]">
                Album Kỷ Niệm
              </h2>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-[#6e0e12]/40" />
                <span className="h-1.5 w-1.5 rotate-45 bg-[#6e0e12]" />
                <span className="h-px w-12 bg-[#6e0e12]/40" />
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5">
              {previewAlbum.map((img, idx) => {
                const isLastSlot = idx === INITIAL_PHOTO_COUNT - 1 && album.length > INITIAL_PHOTO_COUNT;
                const remainingCount = album.length - INITIAL_PHOTO_COUNT;

                return (
                  <motion.div
                    key={img.src || idx}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedIndex(idx)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl shadow-sm"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {isLastSlot ? (
                      /* Lớp phủ thông báo số ảnh còn lại, bấm vào sẽ mở Lightbox tại ảnh này */
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 backdrop-blur-[2px] transition-colors duration-300 group-hover:bg-black/65">
                        <span className="si-display text-3xl font-semibold text-[#FBF8F2] sm:text-4xl">
                          +{remainingCount}
                        </span>
                        <span className="mt-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-[#FBF8F2]/90">
                          Xem tất cả ảnh
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
                    )}
                  </motion.div>
                );
              })}
            </div>



            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-calligraphy mx-auto mt-8 max-w-md rounded-xl text-center text-[#6e0e12] text-2xl"
              >
              Cùng nắm tay nhau bước vào hành trình mới,<br/> nơi tình yêu và những ước mơ cùng nhau đơm hoa kết trái.
            </motion.div>
            {/* Trình xem từng ảnh phóng to (Lightbox) */}
            <AnimatePresence>
              {selectedIndex !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setSelectedIndex(null)}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm touch-none"
                >
                  {/* Nút đóng */}
                  <button
                    onClick={() => setSelectedIndex(null)}
                    aria-label="Đóng"
                    className="absolute top-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#FBF8F2]/15 text-xl text-[#FBF8F2] transition hover:bg-[#6e0e12]"
                  >
                    ✕
                  </button>

                  {/* Nút lùi ảnh (ẩn bớt trên màn hình quá nhỏ để ưu tiên vuốt, hiện từ sm trở lên) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                    }}
                    aria-label="Ảnh trước"
                    className="hidden sm:flex absolute left-8 top-1/2 z-20 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-[#FBF8F2]/15 text-lg text-[#FBF8F2] transition hover:bg-[#6e0e12]"
                  >
                    ❮
                  </button>

                  {/* Khung chứa ảnh hỗ trợ kéo/vuốt ngang (drag="x") */}
                  <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.6}
                    onDragEnd={(_, info) => {
                      const swipeThreshold = 40;
                      // Vuốt sang trái hoặc hất tay nhanh sang trái -> Tiến ảnh (8/8 -> 1/8)
                      if (info.offset.x < -swipeThreshold || info.velocity.x < -300) {
                        nextPhoto();
                      } 
                      // Vuốt sang phải hoặc hất tay nhanh sang phải -> Lùi ảnh (1/8 -> 8/8)
                      else if (info.offset.x > swipeThreshold || info.velocity.x > 300) {
                        prevPhoto();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex max-h-[85vh] max-w-4xl cursor-grab active:cursor-grabbing flex-col items-center select-none"
                  >
                    <div className="relative">
                      <img
                        src={album[selectedIndex].src}
                        alt={album[selectedIndex].alt}
                        draggable={false}
                        className="max-h-[75vh] w-auto rounded-lg object-contain shadow-2xl pointer-events-none"
                      />
                      {album[selectedIndex].alt && (
                        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-4 py-1 si-display text-sm text-[#FBF8F2] backdrop-blur-xs">
                          {album[selectedIndex].alt}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col items-center text-center">
                      <span className="text-xs tracking-[0.2em] text-[#FBF8F2]/70 uppercase">
                        {selectedIndex + 1} / {album.length}
                      </span>
                      <span className="mt-1 text-[0.65rem] text-[#FBF8F2]/40 sm:hidden">
                        Vuốt trái hoặc phải để chuyển ảnh
                      </span>
                    </div>
                  </motion.div>

                  {/* Nút tiến ảnh */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                    }}
                    aria-label="Ảnh tiếp theo"
                    className="hidden sm:flex absolute right-8 top-1/2 z-20 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-[#FBF8F2]/15 text-lg text-[#FBF8F2] transition hover:bg-[#6e0e12]"
                  >
                    ❯
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </section>

          {/* SECTION TIỆC */}
          <section className="relative overflow-hidden bg-[#FBF8F2] px-6 py-16 text-center sm:py-20">
            {/* Họa tiết Mái Vòm */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={staggerContainer}
              >
              {/* Họa tiết Mái Vòm */}
              <motion.div variants={fadeInUp} className="flex justify-center text-[#6e0e12]" aria-hidden="true">
                <svg width="100" height="24" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M 10 22 Q 50 -2, 90 22" />
                  <path d="M 22 22 Q 50 6, 78 22" />
                  <polygon points="50,2 53,6 50,10 47,6" fill="currentColor" />
                </svg>
              </motion.div>

            
              <motion.div variants={fadeInUp} className="mt-4">
                <p className="text-[0.88rem] uppercase tracking-[0.22em] text-[#6e0e12] sm:text-[0.74rem]">
                  TRÂN TRỌNG KÍNH MỜI <span className="font-semibold text-[#6e0e12]">{guestName.toUpperCase()}</span> ĐẾN THAM DỰ:
                </p>
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-[#6e0e12] sm:text-[0.72rem]">
                  TIỆC MỪNG LỄ THÀNH HÔN
                </p>
                <h3 className="si-display mt-3 text-xl font-semibold uppercase tracking-wider text-[#6e0e12] sm:text-2xl">
                  {weddingData.events.groomParty.venue}
                </h3>
                <p className="mt-1 text-sm italic text-[#6e0e12]">{weddingData.events.groomParty.address}</p>
                <p className="mt-3 text-xs font-semibold tracking-wider text-[#6e0e12]">
                  VÀO LÚC {weddingData.events.groomParty.time} · {weddingData.events.groomParty.dayOfWeek}
                </p>
                <p className="si-display mt-1 text-2xl font-semibold text-[#6e0e12]">{weddingData.events.groomParty.date}</p>
                <p className="mt-1 text-xs italic text-[#6e0e12]">({weddingData.events.groomParty.lunar})</p>
                <WeddingCountdown targetDate="2026-12-12T11:00:00+07:00" />
                <WeddingCalendar highlightDay={12} />
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  href={mapUrl.toString()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#F1EADD] border-[#6e0e12] border-2 font-medium rounded-lg hover:bg-white transition-colors mt-4 text-[#6e0e12] text-sm sm:text-base"
                  >
                  {/* Icon bản đồ đơn giản */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Xem bản đồ</span>
                </motion.a>
              </motion.div>
            </motion.div>
          </section>

          {/* SECTION 05: SỔ LƯU BÚT */}
          <section className="relative overflow-hidden bg-[#F1EADD] px-5 py-16 sm:px-6 sm:py-24">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              className="mb-12 text-center"
            >
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#6e0e12]/70">
                WISHES
              </p>
              <h2 className="si-display mt-2 text-[2.1rem] font-medium text-[#6e0e12] sm:text-[2.4rem]">
                Sổ Lưu Bút
              </h2>
              <p className="mt-1 text-sm italic text-[#000]">
                Gửi những lời chúc tốt đẹp nhất dành cho cặp đôi
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-[#6e0e12]/40" />
                <span className="h-1.5 w-1.5 rotate-45 bg-[#6e0e12]" />
                <span className="h-px w-12 bg-[#6e0e12]/40" />
              </div>
            </motion.div>

            <motion.form
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeInUp}
              onSubmit={handleGuestbookSubmit}
              className="mx-auto mt-8 max-w-md space-y-4"
              >
              <input
                type="text"
                placeholder="Tên của bạn"
                value={guestbookName}
                onChange={(e) => setGuestbookName(e.target.value)}
                className="w-full rounded-lg border border-[#B49A7E]/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#6e0e12]"
                required
              />
              <textarea
                placeholder="Lời chúc của bạn..."
                rows={4}
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                className="w-full rounded-lg border border-[#B49A7E]/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#6e0e12]"
                required
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full rounded-full bg-[#6e0e12] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                >
                Gửi Lời Chúc
              </motion.button>
            </motion.form>

            {/* SLIDE HIỂN THỊ LỜI CHÚC */}
            {guestbook.length > 0 && (
              <div
                onMouseEnter={() => setIsPausedSlide(true)}
                onMouseLeave={() => setIsPausedSlide(false)}
                onTouchStart={() => setIsPausedSlide(true)}
                onTouchEnd={() => setIsPausedSlide(false)}
                className="relative mt-10 max-w-md mx-auto"
              >
                {/* Khung thẻ lời chúc chính */}
                <div className="relative overflow-hidden rounded-2xl border border-[#C2A26A]/45 bg-white/95 px-7 py-8 text-center shadow-sm sm:px-10">
                  {/* Họa tiết dấu ngoặc kép lớn làm nền */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-2 left-4 font-serif text-6xl leading-none text-[#6e0e12]/10 select-none"
                  >
                    &ldquo;
                  </span>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={wishSlideIndex}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -40) handleNextWish();
                        else if (info.offset.x > 40) handlePrevWish();
                      }}
                      className="cursor-grab active:cursor-grabbing select-none"
                    >
                      {/* Nội dung lời chúc */}
                      <p className="min-h-[72px] flex items-center justify-center text-sm italic leading-relaxed text-[#28221E]/90 sm:text-base">
                        &quot;{guestbook[wishSlideIndex]?.content}&quot;
                      </p>

                      {/* Đường gạch mảnh trang trí */}
                      <div className="mx-auto my-4 h-px w-12 bg-[#C2A26A]/50" />

                      {/* Tên người gửi & Thời gian */}
                      <p className="si-display text-lg font-semibold text-[#6e0e12]">
                        {guestbook[wishSlideIndex]?.name}
                      </p>
                      <p className="mt-0.5 text-[0.68rem] tracking-wider text-[#28221E]/55">
                        {formatVietnamTime(guestbook[wishSlideIndex]?.time)}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Hai nút điều hướng trái / phải */}
                  {guestbook.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevWish}
                        aria-label="Lời chúc trước"
                        className="absolute top-1/2 left-2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-xs text-[#6e0e12]/60 transition hover:bg-[#F1EADD] hover:text-[#6e0e12]"
                      >
                        ❮
                      </button>
                      <button
                        type="button"
                        onClick={handleNextWish}
                        aria-label="Lời chúc tiếp theo"
                        className="absolute top-1/2 right-2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-xs text-[#6e0e12]/60 transition hover:bg-[#F1EADD] hover:text-[#6e0e12]"
                      >
                        ❯
                      </button>
                    </>
                  )}
                </div>

                {/* Thanh chấm tròn chỉ báo vị trí slide */}
                {guestbook.length > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    {guestbook.slice(0, 10).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWishSlideIndex(idx)}
                        aria-label={`Xem lời chúc ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          wishSlideIndex === idx
                            ? "w-5 bg-[#6e0e12]"
                            : "w-1.5 bg-[#6e0e12]/25 hover:bg-[#6e0e12]/50"
                        }`}
                      />
                    ))}
                    {guestbook.length > 10 && (
                      <span className="ml-1 text-[0.65rem] text-[#6e0e12]/60">
                        +{guestbook.length - 10}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SECTION: HỘP MỪNG CƯỚI */}
          <section className="relative overflow-hidden bg-[#FBF8F2] px-5 py-16 sm:px-6 sm:py-24">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              className="text-center"
              >
              <WeddingGiftModal
                buttonImageUrl="/images/asset-14.png"
                groomBank={{
                  role: (weddingData.gifts[0].title),
                  name: (weddingData.gifts[0].accountName),
                  bankName: (weddingData.gifts[0].bankName),
                  accountNumber: (weddingData.gifts[0].accountNumber),
                  qrImageUrl: "/images/qr-chure.jpg",
                }}
                brideBank={{
                  role: (weddingData.gifts[1].title),
                  name: (weddingData.gifts[1].accountName),
                  bankName: (weddingData.gifts[1].bankName),
                  accountNumber: (weddingData.gifts[1].accountNumber),
                  qrImageUrl: "/images/qr-codau.jpg",
                }}
              />
            </motion.div>
          </section>

          {/* SECTION 07: RSVP */}
          <section className="relative overflow-hidden bg-[#F1EADD] px-5 py-16 sm:px-6 sm:py-24">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
              className="mb-12 text-center"
            >
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#6e0e12]/70">
                R.S.V.P
              </p>
              <h2 className="si-display mt-2 text-[2.1rem] font-medium text-[#6e0e12] sm:text-[2.4rem]">
                Xác Nhận Tham Dự
              </h2>
              <p className="mt-1 text-sm italic text-[#000]">Vui lòng xác nhận sự tham dự của bạn để chúng mình chuẩn bị đón tiếp một cách chu đáo nhất.</p>
              <p className="mt-1 text-sm italic text-[#000]">Trân trọng cảm ơn!</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="h-px w-12 bg-[#6e0e12]/40" />
                <span className="h-1.5 w-1.5 rotate-45 bg-[#6e0e12]" />
                <span className="h-px w-12 bg-[#6e0e12]/40" />
              </div>
            </motion.div>

            {rsvpSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-calligraphy mx-auto mt-8 max-w-md rounded-xl p-6 text-center text-[#6e0e12] text-2xl"
                >
                Cảm ơn bạn đã phản hồi!<br/> Gia đình rất hân hạnh được đón tiếp.
              </motion.div>
            ) : (
              <motion.form
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={fadeInUp}
                onSubmit={handleRsvpSubmit}
                className="mx-auto mt-8 max-w-md space-y-4"
                >
                <input
                  type="text"
                  placeholder="Họ và tên quý khách"
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  className="w-full rounded-lg border border-[#B49A7E]/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#6e0e12]"
                  required
                />
                <div className="flex gap-4">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setRsvpStatus('attending')}
                    className={`flex-1 rounded-lg border py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${ rsvpStatus === 'attending' ? 'border-[#6e0e12] bg-[#6e0e12] text-white' : 'border-[#B49A7E]/40 bg-white text-[#6e0e12]' }`}
                  >
                    Sẽ Tham Dự
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setRsvpStatus('not_attending')}
                    className={`flex-1 rounded-lg border py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${ rsvpStatus === 'not_attending' ? 'border-[#6e0e12] bg-[#6e0e12] text-white' : 'border-[#B49A7E]/40 bg-white text-[#6e0e12]' }`}
                    >
                    Rất Tiếc Không Thể
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!rsvpStatus}
                  className="w-full rounded-full bg-[#6e0e12] py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50"
                  >
                  Xác Nhận
                </motion.button>
              </motion.form>
            )}
          </section>

          {/* Footer */}
          <footer className="bg-[#FBF8F2] py-12 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              >
              <p className="font-calligraphy text-3xl text-[#6e0e12]">
                {weddingData.couple.groom.shortName} &amp; {weddingData.couple.bride.shortName}
              </p>
              <p className="mt-2 text-xs text-[#6e0e12]">Thank you for celebrating with us!</p>
            </motion.div>
          </footer>

        </div>
      </div>

      <MusicPlayer src={weddingData.music.src} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      
      {/* ================= HIỆU ỨNG TIM BAY TỪ DƯỚI LÊN RẢI ĐỀU TRANG ================= */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <AnimatePresence>
          {hearts.map((heart) => (
           <motion.div
            key={heart.id}
            initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }}
            animate={{
              opacity: Array(0, 1, 1, 0),
              y: "-108vh",
              x: Array(0, heart.sway, -heart.sway / 2, heart.sway / 3),
              scale: Array(0.5, 1.15, 1, 0.8),
              rotate: Array(-12, 12, -8, 10),
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              bottom: "-36px",
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
            }}
            className="text-[#6e0e12] drop-shadow-sm select-none"
          >
            ❤
          </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#FBF8F2] text-[#6e0e12]">Đang tải thiệp cưới...</div>}>
      <WeddingCardContent />
    </Suspense>
  );
}
