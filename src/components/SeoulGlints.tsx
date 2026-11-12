'use client';

export default function SeoulGlints() {
  const glints = [
    { left: '18%', duration: '24s', delay: '0s', size: '56px', opacity: 0.2, drift: '22px' },
    { left: '70%', duration: '27s', delay: '-8s', size: '70px', opacity: 0.16, drift: '-26px' },
    { left: '45%', duration: '22s', delay: '-14s', size: '48px', opacity: 0.24, drift: '18px' },
    { left: '88%', duration: '26s', delay: '-4s', size: '60px', opacity: 0.18, drift: '-20px' },
    { left: '8%', duration: '23s', delay: '-18s', size: '44px', opacity: 0.22, drift: '16px' },
    { left: '14%', duration: '13s', delay: '-3.5s', size: '4px', opacity: 0.7, drift: '-10px' },
    { left: '23%', duration: '10.5s', delay: '-1.5s', size: '9px', opacity: 1, drift: '8px' },
    { left: '54%', duration: '11s', delay: '-4.5s', size: '10px', opacity: 1, drift: '10px' },
    { left: '84%', duration: '12.5s', delay: '-5.5s', size: '4px', opacity: 0.62, drift: '-8px' },
  ];

  return (
    <div className="si-fall pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {glints.map((g, idx) => (
        <span
          key={idx}
          className="si-glint-fall"
          style={{
            left: g.left,
            animationDuration: g.duration,
            animationDelay: g.delay,
            ['--si-drift' as any]: g.drift,
          }}
        >
          <span
            className="block rounded-full bg-white"
            style={{
              width: g.size,
              height: g.size,
              opacity: g.opacity,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
            }}
          />
        </span>
      ))}
    </div>
  );
}
