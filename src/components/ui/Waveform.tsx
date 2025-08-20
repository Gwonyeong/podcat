'use client';

export default function Waveform() {
  return (
    <div className="waveform">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            height: `${Math.random() * 40 + 10}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
