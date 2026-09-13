import { useEffect, useState } from "react";

interface Props {
  message: string;
  type: "great" | "good" | "warning";
  onClose: () => void;
}

const confettiColors = [
  "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98FB98", "#F0E68C", "#87CEEB",
];

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

export default function Celebration({ message, type, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg =
    type === "great"
      ? "from-yellow-400/20 to-orange-400/20 border-yellow-400/40"
      : type === "good"
      ? "from-green-400/20 to-emerald-400/20 border-green-400/40"
      : "from-blue-400/20 to-sky-400/20 border-blue-400/40";

  const icon = type === "great" ? "🏆" : type === "good" ? "✅" : "📊";

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100px); opacity: 0; }
        }
      `}</style>

      {type !== "warning" && visible && <Confetti />}

      <div
        className={`fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto`}
        style={{
          animation: visible ? "slideDown 0.4s ease forwards" : "slideUp 0.4s ease forwards",
        }}
      >
        <div
          className={`bg-gradient-to-r ${bg} backdrop-blur-md border rounded-2xl p-4 flex items-start gap-3 shadow-2xl`}
        >
          <span className="text-3xl flex-shrink-0 mt-0.5">{icon}</span>
          <div className="flex-1">
            <p className="text-white text-sm font-medium leading-relaxed">{message}</p>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 400);
            }}
            className="text-white/60 hover:text-white text-xl flex-shrink-0 mt-0.5"
          >
            ×
          </button>
        </div>
      </div>
    </>
  );
}
