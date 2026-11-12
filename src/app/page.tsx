'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { weddingData } from '@/data/weddingData';
import SeoulGlints from '@/components/SeoulGlints';
import MusicPlayer from '@/components/MusicPlayer';
import WeddingGiftModal from '@/components/WeddingGiftModal';

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
    setGuestbook([
      { name: guestbookName, content: wishes, time: new Date().toLocaleString('vi-VN') },
      ...guestbook,
    ]);
    setGuestbookName('');
    setWishes('');
    alert('Cảm ơn bạn đã gửi lời chúc ý nghĩa!');
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpStatus) return;
    setRsvpSubmitted(true);
  };

  const mapUrl = new URL("https://google.com");
  mapUrl.pathname = "/maps/search/";
  mapUrl.searchParams.append("api", "1");
  mapUrl.searchParams.append("query", weddingData.events.groomParty.address);

  return (
    <main className="relative min-h-screen w-full bg-[#FBF8F2] overflow-x-hidden">
      
      {/* ================= 1. TRANG BÌA (FIXED FULLSCREEN OVERLAY - KHÔNG KHOẢNG TRẮNG) ================= */}
      <div
        className={`fixed inset-0 z-50 h-full w-full bg-[#28221E] transition-all duration-1000 ease-in-out ${
          isOpen ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="relative mx-auto h-full w-full overflow-hidden shadow-2xl">
          {/* Ảnh nền */}
          <img
            src="/images/1Q9A1295.JPG"
            alt="Quốc Trịnh & Thị Vân"
            className="absolute inset-0 h-full w-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          
          {/* Overlay tối màu */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Hiệu ứng hạt rơi */}
          <SeoulGlints />

          {/* Nội dung trang bìa */}
          <div className="relative z-10 flex h-full flex-col items-center justify-end px-7 pt-24 pb-14 text-center sm:px-9 sm:pb-16">
            <p className="si-display mb-6 flex items-center justify-center gap-3 text-[0.7rem] uppercase tracking-[0.34em] text-white/80">
              <span className="h-px w-6 bg-white/50" />
              WE'RE GETTING MARRIED
              <span className="h-px w-6 bg-white/50" />
            </p>
            
            <h1 className="si-display text-[2.7rem] leading-tight font-medium text-white sm:text-[3.3rem]">
              {weddingData.couple.groom.shortName}
            </h1>
            
            <div className="my-3 flex items-center justify-center gap-4 text-white/90">
              <span className="h-px w-12 bg-white/50" />
              <span className="si-display text-xl italic sm:text-2xl">&amp;</span>
              <span className="h-px w-12 bg-white/50" />
            </div>
            
            <h2 className="si-display text-[2.7rem] leading-tight font-medium text-white sm:text-[3.3rem]">
              {weddingData.couple.bride.shortName}
            </h2>

            <div className="mt-7 text-center">
              <p className="si-display text-[1.55rem] font-medium tracking-[0.13em] text-white sm:text-[1.85rem]">
                12 . 12 . 2026
              </p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-widest text-white/80">
                THỨ 7
              </p>
              <p className="si-display mt-1 text-[0.86rem] italic text-white/90">
                Tức ngày 04 tháng 11 năm Bính Ngọ
              </p>
            </div>

            {/* Nút Mở Thiệp */}
            <button
              type="button"
              onClick={handleOpenCard}
              className="group relative mt-9 inline-flex items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white/10 px-10 py-3.5 text-[0.84rem] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95 shadow-lg"
            >
              <span className="relative z-10">MỞ THIỆP</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shine" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. KHUNG NỘI DUNG CHÍNH ================= */}
      <div className="relative mx-auto bg-[#FBF8F2] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div ref={mainContentRef} className={`transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* SECTION 01: CÔ DÂU & CHÚ RỂ */}
          <section className="relative overflow-hidden px-5 py-16 sm:px-6 sm:py-24">
            <div className="mb-9 flex items-end gap-4 sm:gap-5">
              <span className="si-display text-[3.2rem] font-medium leading-none text-[#6e0e12]">01</span>
              <div className="pb-1">
                <p className="text-[0.74rem] uppercase tracking-[0.16em] text-[#000]">GROOM &amp; BRIDE</p>
                <h2 className="si-display text-[1.8rem] font-medium text-[#6e0e12]">Chú Rể &amp; Cô Dâu</h2>
              </div>
              <span className="h-px flex-1 bg-[#E2D7C5] mb-2" />
            </div>

            <div className="mx-auto mt-8 flex flex-col gap-12 sm:gap-16">
              {/* Chú Rể */}
              <div className="flex items-center gap-6 sm:gap-9">
                <div className="relative w-[43%] max-w-[208px] shrink-0">
                  <div className="overflow-hidden rounded-t-full rounded-b-xl border-2 border-[#C2A26A]/40 p-1 bg-[#FBF8F2] shadow-md">
                    <img
                      src={weddingData.couple.groom.photo}
                      alt={weddingData.couple.groom.fullName}
                      className="aspect-[3/4] w-full rounded-t-full rounded-b-lg object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[0.7rem] uppercase tracking-widest text-[#000]">CHÚ RỂ</p>
                  <h3 className="si-display text-[1.8rem] font-medium text-[#6e0e12]">
                    {weddingData.couple.groom.fullName}
                  </h3>
                  <p className="mt-2 text-xs italic text-[#000] leading-relaxed">
                    "Thật may mắn vì trong biển người mênh mông, anh đã tìm thấy em."
                  </p>
                </div>
              </div>

              {/* Cô Dâu */}
              <div className="flex flex-row-reverse items-center gap-6 sm:gap-9">
                <div className="relative w-[43%] max-w-[208px] shrink-0">
                  <div className="overflow-hidden rounded-t-full rounded-b-xl border-2 border-[#C2A26A]/40 p-1 bg-[#FBF8F2] shadow-md">
                    <img
                      src={weddingData.couple.bride.photo}
                      alt={weddingData.couple.bride.fullName}
                      className="aspect-[3/4] w-full rounded-t-full rounded-b-lg object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[0.7rem] uppercase tracking-widest text-[#000]">CÔ DÂU</p>
                  <h3 className="si-display text-[1.8rem] font-medium text-[#6e0e12]">
                    {weddingData.couple.bride.fullName}
                  </h3>
                  <p className="mt-2 text-xs italic text-[#000] leading-relaxed">
                    "Cảm ơn anh vì đã luôn yêu thương và trân trọng em mỗi ngày."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 02: HAI BÊN GIA ĐÌNH */}
          <section className="relative overflow-hidden bg-[#F1EADD] px-5 py-16 sm:px-6 sm:py-24">
            <div className="mb-9 flex items-end gap-4 sm:gap-5">
              <span className="si-display text-[3.2rem] font-medium leading-none text-[#6e0e12]">02</span>
              <div className="pb-1">
                <p className="text-[0.74rem] uppercase tracking-[0.16em] text-[#000]">PARENTS</p>
                <h2 className="si-display text-[1.8rem] font-medium text-[#6e0e12]">Hai Bên Gia Đình</h2>
              </div>
              <span className="h-px flex-1 bg-[#C9B79C] mb-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border-r border-[#C9B79C]/50 pr-3">
                <p className="text-[0.64rem] uppercase tracking-[0.26em] text-[#000]">Nhà Trai</p>
                <div className="mt-4 space-y-1">
                  <p className="si-display text-[1.2rem] font-medium text-[#6e0e12]">{weddingData.families.groom.fatherName}</p>
                  <p className="si-display text-[1.2rem] font-medium text-[#6e0e12]">{weddingData.families.groom.motherName}</p>
                </div>
                <p className="mt-4 text-[0.78rem] italic text-[#000]/60">{weddingData.families.groom.address}</p>
              </div>

              <div className="pl-3">
                <p className="text-[0.64rem] uppercase tracking-[0.26em] text-[#000]">Nhà Gái</p>
                <div className="mt-4 space-y-1">
                  <p className="si-display text-[1.2rem] font-medium text-[#6e0e12]">{weddingData.families.bride.fatherName}</p>
                  <p className="si-display text-[1.2rem] font-medium text-[#6e0e12]">{weddingData.families.bride.motherName}</p>
                </div>
                <p className="mt-4 text-[0.78rem] italic text-[#000]/60">{weddingData.families.bride.address}</p>
              </div>
            </div>
          </section>

          {/* SECTION LỜI MỜI */}
          <section className="relative overflow-hidden bg-[#FBF8F2] px-6 py-16 text-center sm:py-20">
            {/* Họa tiết SVG cành lá */}
            <div className="mb-6 flex justify-center text-[#6e0e12]" aria-hidden="true">
              <svg width="120" height="24" viewBox="0 0 120 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <path d="M 10 18 Q 40 6, 60 12 Q 80 18, 110 6" />
                <path d="M 35 12 Q 38 6, 44 6 Q 40 12, 35 12 Z" />
                <path d="M 55 11 Q 53 17, 47 18 Q 50 12, 55 11 Z" />
                <path d="M 75 12 Q 78 7, 84 7 Q 80 13, 75 12 Z" />
              </svg>
            </div>
            {/* SECTION LỄ THÀNH HÔN */}
            <div>
              <div className="space-y-1">
                <p className="text-[0.88rem] uppercase tracking-[0.22em] text-[#6e0e12] sm:text-[0.74rem]">
                  TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN CỦA CON CHÚNG TÔI
                </p>
              </div>

              {/* Khối Tên Chú Rể & Cô Dâu Calligraphy */}
              <div className="my-8 space-y-2">
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
              </div>

              {/* Thông tin Địa điểm */}
              <div className="mt-4">
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
              </div>
            </div>

            {/* SECTION TIỆC */}
            {/* Họa tiết Mái Vòm */}
            <div className="mt-12 flex justify-center text-[#6e0e12]" aria-hidden="true">
              <svg width="100" height="24" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <path d="M 10 22 Q 50 -2, 90 22" />
                <path d="M 22 22 Q 50 6, 78 22" />
                <polygon points="50,2 53,6 50,10 47,6" fill="currentColor" />
              </svg>
            </div>

            {/* Thông tin Địa điểm */}
            <div className="mt-4">
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
              <a
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
              </a>
            </div>
          </section>

          {/* SECTION 04: ALBUM ĐÁM CƯỚI */}
          <section className="relative overflow-hidden bg-[#F1EADD] px-5 py-16 sm:px-6 sm:py-24">
            <div className="mb-9 flex items-end gap-4 sm:gap-5">
              <span className="si-display text-[3.2rem] font-medium leading-none text-[#6e0e12]">03</span>
              <div className="pb-1">
                <p className="text-[0.74rem] uppercase tracking-[0.16em] text-[#000]">GALLERY</p>
                <h2 className="si-display text-[1.8rem] font-medium text-[#6e0e12]">Album Kỷ Niệm</h2>
              </div>
              <span className="h-px flex-1 bg-[#C9B79C] mb-2" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {weddingData.album.map((img, idx) => (
                <div key={idx} className="overflow-hidden rounded-lg shadow-sm">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 05: SỔ LƯU BÚT */}
          <section className="relative overflow-hidden px-5 py-16 sm:px-6 sm:py-24">
            <div className="text-center">
              <h2 className="si-display text-[2rem] font-medium text-[#6e0e12]">Sổ Lưu Bút</h2>
              <p className="mt-1 text-sm italic text-[#000]">
                Gửi những lời chúc tốt đẹp nhất dành cho cặp đôi
              </p>
            </div>

            <form onSubmit={handleGuestbookSubmit} className="mx-auto mt-8 max-w-md space-y-4">
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
              <button
                type="submit"
                className="w-full rounded-full bg-[#6e0e12] py-3 text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
              >
                Gửi Lời Chúc
              </button>
            </form>

            <div className="mx-auto mt-10 max-w-md space-y-3">
              {guestbook.map((item, index) => (
                <div key={index} className="rounded-lg bg-[#F1EADD]/60 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#000]">{item.name}</p>
                    <span className="text-[0.7rem] text-[#000]">{item.time}</span>
                  </div>
                  <p className="mt-2 text-sm italic text-[#000]">"{item.content}"</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 06: MỪNG CƯỚI */}
          <section className="relative overflow-hidden bg-[#F1EADD] px-5 py-16 sm:px-6 sm:py-24">
            <div className="text-center">
              <WeddingGiftModal
                buttonImageUrl="/images/gift-box.png"
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
            </div>
            
          </section>

          {/* SECTION 07: RSVP */}
          <section className="relative overflow-hidden px-5 py-16 sm:px-6 sm:py-24">
            <div className="text-center">
              <h2 className="si-display text-[2rem] font-medium text-[#6e0e12]">Xác Nhận Tham Dự</h2>
              <p className="mt-1 text-sm italic text-[#000]">Vui lòng phản hồi trước ngày 10/12/2026</p>
            </div>

            {rsvpSubmitted ? (
              <div className="mx-auto mt-8 max-w-md rounded-xl bg-green-50 p-6 text-center text-green-800">
                Cảm ơn bạn đã phản hồi! Gia đình rất hân hạnh được đón tiếp.
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="mx-auto mt-8 max-w-md space-y-4">
                <input
                  type="text"
                  placeholder="Họ và tên quý khách"
                  defaultValue={guestName !== 'Quý Khách' ? guestName : ''}
                  className="w-full rounded-lg border border-[#B49A7E]/40 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#6e0e12]"
                  required
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus('attending')}
                    className={`flex-1 rounded-lg border py-3 text-xs font-semibold uppercase tracking-wider ${
                      rsvpStatus === 'attending'
                        ? 'border-[#6e0e12] bg-[#6e0e12] text-white'
                        : 'border-[#B49A7E]/40 bg-white text-[#6e0e12]'
                    }`}
                  >
                    Sẽ Tham Dự
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvpStatus('not_attending')}
                    className={`flex-1 rounded-lg border py-3 text-xs font-semibold uppercase tracking-wider ${
                      rsvpStatus === 'not_attending'
                        ? 'border-[#6e0e12] bg-[#6e0e12] text-white'
                        : 'border-[#B49A7E]/40 bg-white text-[#6e0e12]'
                    }`}
                  >
                    Rất Tiếc Không Thể
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!rsvpStatus}
                  className="w-full rounded-full bg-[#6e0e12] py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-50"
                >
                  Xác Nhận
                </button>
              </form>
            )}
          </section>

          {/* Footer */}
          <footer className="bg-[#F1EADD] py-12 text-center">
            <p className="font-calligraphy text-3xl text-[#6e0e12]">
              {weddingData.couple.groom.shortName} &amp; {weddingData.couple.bride.shortName}
            </p>
            <p className="mt-2 text-xs text-[#6e0e12]">Thank you for celebrating with us!</p>
          </footer>

        </div>
      </div>

      <MusicPlayer src={weddingData.music.src} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
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
