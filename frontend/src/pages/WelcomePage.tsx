import { Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import bgImage from "../../public/assets/bg.jpg";
import "../styles/WelcomePage.css";
import { LogIn } from "lucide-react";

function WelcomePage() {
  const numberOfIcons = 30;
  const iconEmojis = ["🍰", "🧁", "🍩", "🎂", "🍪", "🍫", "🍬", "🍦", "🍮"];

  const icons = Array.from({ length: numberOfIcons }).map((_, i) => {
    const duration = 10 + Math.random() * 10;
    const delay = -(Math.random() * duration);
    const left = Math.random() * 100;
    const size = 20 + Math.random() * 30;
    const emoji = iconEmojis[Math.floor(Math.random() * iconEmojis.length)];
    const opacity = 0.5 + Math.random() * 0.5;

    return (
      <div
        key={i}
        className="falling-icon"
        style={{
          "--left-position": `${left}vw`,
          "--animation-duration": `${duration}s`,
          "--icon-size": `${size}px`,
          "--animation-delay": `${delay}s`,
          "--initial-opacity": opacity.toString(),
        }}
      >
        {emoji}
      </div>
    );
  });

  return (
    <>
      <div
        className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center dark:bg-gray-900 animate-background-pan overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {icons}
        <div className="absolute inset-0 bg-black opacity-20"></div>

        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Welcome to NVC Cake Program
          </h1>
          <div className="flex justify-center">
            <Link to="/login">
              <Button className="px-8 py-4 text-lg gap-2">
                <LogIn />
                <span>เข้าสู่ระบบ</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePage;
