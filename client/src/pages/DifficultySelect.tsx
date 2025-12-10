import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { adService, ADMOB_APP_ID } from "@/lib/adService";
import { Brain, Moon, Skull, Zap } from "lucide-react";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Impossible";

const difficulties: { level: Difficulty; color: string; icon: any; description: string }[] = [
  { level: "Easy", color: "text-green-400", icon: Moon, description: "A gentle nap" },
  { level: "Medium", color: "text-yellow-400", icon: Brain, description: "All-nighter" },
  { level: "Hard", color: "text-orange-500", icon: Zap, description: "Exam week" },
  { level: "Impossible", color: "text-red-500", icon: Skull, description: "Sleep deprivation" },
];

export default function DifficultySelect() {
  const [_, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (level: Difficulty) => {
    setLoading(true);
    
    // Requirement: Show 2 ads when selecting a difficulty level
    // We will simulate this sequentially for the mockup
    await adService.showInterstitialAd("difficulty_select_1");
    await adService.showInterstitialAd("difficulty_select_2");

    setLoading(false);
    setLocation(`/game/${level}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-background -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-4">
          <span className="text-primary">Study</span> vs <span className="text-secondary">Sleep</span>
        </h1>
        <p className="text-muted-foreground text-lg">Choose your difficulty to begin</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {difficulties.map((diff, index) => (
          <motion.button
            key={diff.level}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => !loading && handleSelect(diff.level)}
            disabled={loading}
            className="group relative overflow-hidden bg-card hover:bg-card/80 border border-white/5 p-6 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            data-testid={`btn-difficulty-${diff.level}`}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r from-transparent via-white to-transparent`} />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-2xl font-bold ${diff.color} mb-1`}>{diff.level}</h3>
                <p className="text-muted-foreground text-sm">{diff.description}</p>
              </div>
              <diff.icon className={`w-8 h-8 ${diff.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-12 text-xs text-muted-foreground text-center opacity-50">
        <p>Mock AdMob Integration Active</p>
        <p>APP_ID: {ADMOB_APP_ID}</p>
      </div>
    </div>
  );
}
