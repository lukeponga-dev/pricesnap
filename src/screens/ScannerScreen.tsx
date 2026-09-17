import { motion } from 'motion/react';
import { useAppState } from '../store';
import { Camera, CameraOff, Upload, ArrowLeft } from 'lucide-react';
import { useRef, useEffect, useState, useCallback, ChangeEvent } from 'react';

export default function ScannerScreen() {
  const { startScan, setScreen } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  const setupCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setHasCamera(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
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
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        startScan(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        startScan(result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (hasCamera === false) {
    return (
      <div className="w-full h-full flex flex-col bg-navy-950 overflow-hidden relative">
        <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between border-b border-surface/50 z-20">
          <button 
            onClick={() => setScreen('home')}
            className="flex items-center gap-2 text-xs font-medium text-ink-dim hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </header>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pt-20">
          <div className="w-24 h-24 bg-snap/10 rounded-full flex items-center justify-center mb-6 border border-snap/20">
            <CameraOff className="w-12 h-12 text-snap" />
          </div>
          <h2 className="text-2xl font-display font-bold text-ink mb-3">
            Camera Access Unavailable
          </h2>
          <p className="text-ink-dim mb-8 max-w-sm leading-relaxed text-sm">
            Camera permissions were denied or your environment does not support direct camera capture. You can upload an image file instead.
          </p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="pw-btn w-full flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Upload Photo Instead
            </button>
            <button 
              onClick={setupCamera}
              className="px-4 py-3 bg-navy-900 hover:bg-navy-800 text-ink font-display font-medium text-xs rounded-xl border border-surface transition-all"
            >
              Retry Camera Permission
            </button>
          </div>
          
          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
          />

          <p className="text-xs text-ink-faint mt-6 max-w-xs">
            Or select test samples directly from the home screen dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-navy-950 overflow-hidden relative">
      <header className="absolute top-0 left-0 right-0 px-6 py-5 flex items-center justify-between z-30">
        <button 
          onClick={() => setScreen('home')}
          className="flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
        >
          <Upload className="w-4 h-4" /> Upload Photo
        </button>
      </header>

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
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

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
