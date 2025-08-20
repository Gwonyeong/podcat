'use client';

export default function Waveform() {
  // 고정된 높이 값들로 hydration mismatch 방지
  const heights = [32, 18, 45, 28, 38, 22, 41, 15, 35, 48, 26, 39];

  return (
    <div className="waveform">
      {heights.map((height, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            height: `${height}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
