import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { adService, BANNER_AD_ID } from "@/lib/adService";
import { Button } from "@/components/ui/button";
import { BookOpen, Moon, RefreshCcw, Home, Brain } from "lucide-react";
import { Difficulty } from "./DifficultySelect";

// Game Constants
const TICK_RATE_MS = 16; // ~60fps
const TAP_POWER = 5; // How much % player gains per tap

// Difficulty Configurations (Sleep growth per tick)
const DIFFICULTY_RATES: Record<Difficulty, number> = {
  Easy: 0.05,        // Very slow
  Medium: 0.15,      // Manageable
  Hard: 0.35,        // Fast
  Impossible: 0.60   // Extremely fast
};

export default function Game() {
  const [match, params] = useRoute("/game/:difficulty");
  const [_, setLocation] = useLocation();
  const difficulty = (params?.difficulty as Difficulty) || "Medium";

  // Game State
  const [studyProgress, setStudyProgress] = useState(50); // 0 = All Sleep, 100 = All Study
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [gameTime, setGameTime] = useState(0);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Game
  useEffect(() => {
    startGame();
    return () => stopGame();
  }, []);

  const startGame = () => {
    setStudyProgress(50);
    setGameState("playing");
    setGameTime(0);
    
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    gameLoopRef.current = setInterval(() => {
      setStudyProgress((prev) => {
        const sleepGrowth = DIFFICULTY_RATES[difficulty];
        const newProgress = prev - sleepGrowth;

        if (newProgress <= 0) {
          handleGameOver("lost");
          return 0;
        }
        if (newProgress >= 100) {
          handleGameOver("won");
          return 100;
        }
        
        return newProgress;
      });
      
      setGameTime(t => t + TICK_RATE_MS);
    }, TICK_RATE_MS);
  };

  const stopGame = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };

  const handleGameOver = (result: "won" | "lost") => {
    stopGame();
    setGameState(result);
  };

  const handleTap = () => {
    if (gameState !== "playing") return;
    
    setStudyProgress(prev => {
      const next = prev + TAP_POWER;
      if (next >= 100) {
        handleGameOver("won");
        return 100;
      }
      return next;
    });
  };

  const handleRestart = async () => {
    // Requirement: Show 1 ad when restarting after losing
    if (gameState === "lost") {
      await adService.showInterstitialAd("restart_game");
    }
    startGame();
  };

  const handleHome = () => {
    setLocation("/");
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden touch-manipulation">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-secondary/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* HUD */}
      <div className="p-6 flex justify-between items-center z-10">
        <div className="bg-card/50 backdrop-blur border border-white/5 px-4 py-2 rounded-full">
          <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Level:</span>
          <span className={`ml-2 font-bold ${
            difficulty === "Easy" ? "text-green-400" :
            difficulty === "Medium" ? "text-yellow-400" :
            difficulty === "Hard" ? "text-orange-500" : "text-red-500"
          }`}>{difficulty}</span>
        </div>
        
        <Button variant="ghost" size="icon" onClick={handleHome} className="rounded-full hover:bg-white/10">
          <Home className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto z-10">
        
        {/* The Bar */}
        <div className="w-full mb-12 relative">
          <div className="flex justify-between mb-4 font-display font-bold text-xl uppercase tracking-widest">
            <span className="text-study flex items-center gap-2 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">
              <Brain className="w-5 h-5"/> Study
            </span>
            <span className="text-sleep flex items-center gap-2 drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
              Sleep <Moon className="w-5 h-5"/>
            </span>
          </div>
          
          <div className="h-16 w-full bg-secondary/20 rounded-3xl overflow-hidden border-4 border-white/5 relative shadow-2xl shadow-black/50">
            {/* Study Bar (Left) */}
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 absolute left-0 top-0 shadow-[0_0_30px_rgba(34,211,238,0.5)] z-10"
              style={{ width: `${studyProgress}%` }}
              transition={{ type: "tween", ease: "linear", duration: 0 }} // Instant update for responsiveness
            />
            
             {/* Sleep Bar (Right - Visual Only, effectively the background but let's make it explicit for the glow) */}
             <div className="absolute right-0 top-0 h-full bg-violet-900/40 w-full z-0" />

            {/* Center Line Indicator */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 z-20 mix-blend-overlay" />
          </div>
        </div>

        {/* Tap Button */}
        <div className="relative">
           <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleTap}
            disabled={gameState !== "playing"}
            className="w-48 h-48 rounded-full bg-primary text-primary-foreground shadow-[0_0_60px_rgba(14,165,233,0.4)] border-8 border-cyan-300/20 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-[0_0_80px_rgba(14,165,233,0.6)] disabled:opacity-50 disabled:grayscale active:bg-cyan-400"
            data-testid="btn-study"
          >
            <BookOpen className="w-16 h-16" />
            <span className="font-display font-bold text-2xl uppercase tracking-wider">Study!</span>
          </motion.button>
          
          <div className="absolute -inset-4 rounded-full border border-white/5 animate-ping opacity-20 pointer-events-none" />
        </div>

      </div>

      {/* Overlay for Win/Loss */}
      <AnimatePresence>
        {gameState !== "playing" && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
            >
              {gameState === "won" ? (
                <>
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">You Passed!</h2>
                  <p className="text-muted-foreground mb-8">You stayed awake long enough to finish studying.</p>
                </>
              ) : (
                <>
                   <div className="w-20 h-20 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Moon className="w-10 h-10 text-violet-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">You Fell Asleep</h2>
                  <p className="text-muted-foreground mb-8">The urge to sleep was too strong.</p>
                </>
              )}

              <div className="space-y-3">
                <Button onClick={handleRestart} className="w-full h-12 text-lg font-bold" size="lg">
                  <RefreshCcw className="mr-2 w-5 h-5" /> Try Again
                </Button>
                <Button onClick={handleHome} variant="outline" className="w-full h-12" size="lg">
                  Main Menu
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Ad Banner Placeholder */}
      <div className="bg-black/40 h-[60px] w-full mt-auto flex items-center justify-center border-t border-white/5 text-xs text-white/30 uppercase tracking-widest">
        Banner Ad Area ({BANNER_AD_ID})
      </div>
    </div>
  );
}
