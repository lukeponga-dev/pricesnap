import { motion } from 'motion/react';
import { useAppState } from '../store';
import { Camera, CameraOff } from 'lucide-react';
import { useRef, useEffect, useState, useCallback } from 'react';

export default function ScannerScreen() {
  const { startScan } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  const setupCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCamera(false);
    }
  }, []);

  useEffect(() => {
    setupCamera();
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [setupCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        startScan(dataUrl);
      }
    }
  };

  if (hasCamera === false) {
    return (
      <div className="w-full h-full flex flex-col bg-navy-950 overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-50">
          <div className="w-24 h-24 bg-snap/10 rounded-full flex items-center justify-center mb-6 border border-snap/20">
            <CameraOff className="w-12 h-12 text-snap" />
          </div>
          <h2 className="text-2xl font-display font-bold text-ink mb-3">
            Camera Access Required
          </h2>
          <p className="text-ink-dim mb-8 max-w-sm leading-relaxed">
            PriceSnap needs access to your camera to scan items and find their live market value.
          </p>
          <button 
            onClick={setupCamera}
            className="pw-btn w-full max-w-xs"
          >
            Grant Access
          </button>
          <p className="text-xs text-ink-faint mt-6 max-w-xs">
            If you previously denied access, you may need to enable it in your browser settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-navy-950 overflow-hidden relative">
      {/* Full-bleed camera background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
      </div>

      {/* Viewfinder Overlay with Darkened Mask */}
      <div className="flex-1 relative flex items-center justify-center p-6 z-10 pointer-events-none mt-16 mb-44">
        {/* VIEW FINDER BOX (Perfect 1:1 Aspect Ratio) */}
        <div className="w-72 h-72 sm:w-80 sm:h-80 relative rounded-2xl shadow-[0_0_0_9999px_rgba(28,28,28,0.7)] border border-white/20 overflow-hidden">
          
          {/* Corner brackets in Forest Green */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-snap rounded-tl-lg z-20"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-snap rounded-tr-lg z-20"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-snap rounded-bl-lg z-20"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-snap rounded-br-lg z-20"></div>
          
          {/* Center Crosshair HUD */}
          <div className="absolute inset-6 border border-dashed border-white/5 rounded-xl flex items-center justify-center">
            <div className="w-5 h-[1px] bg-white/20"></div>
            <div className="h-5 w-[1px] bg-white/20 absolute"></div>
          </div>

          {/* Smooth animated scan line gradient */}
          <motion.div 
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-snap to-transparent shadow-[0_0_15px_3px_rgba(45,90,39,0.5)] z-20"
            animate={{ top: ['4%', '96%', '4%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/60 via-black/30 to-transparent pb-20 flex items-center justify-center z-30">
        <button 
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white/40 p-1 flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-snap/50 pointer-events-auto shadow-lg"
          aria-label="Take photo"
        >
          <motion.div 
            className="w-full h-full bg-white rounded-full flex items-center justify-center group-hover:bg-navy-900 transition-colors"
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.85 }}
          >
            <Camera className="w-8 h-8 text-navy-950" />
          </motion.div>
        </button>
      </div>
      
      <div className="absolute top-20 left-0 right-0 text-center pointer-events-none z-30">
        <p className="text-white/80 font-display font-medium text-sm drop-shadow-md">Center item in frame</p>
      </div>
    </div>
  );
}
