import { motion } from 'motion/react';
import { useAppState } from '../store';
import { 
  Camera, 
  CameraOff, 
  UploadCloud, 
  Image as ImageIcon, 
  RefreshCw, 
  Sparkles, 
  SwitchCamera,
  AlertCircle,
  FileImage,
  ArrowRight
} from 'lucide-react';
import React, { useRef, useEffect, useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { SAMPLE_PRESETS, SampleItem } from '../sampleItems';

export default function ScannerScreen() {
  const { startScan } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [videoDevicesCount, setVideoDevicesCount] = useState<number>(1);
  const [isInitializing, setIsInitializing] = useState(true);

  // Stop active stream tracks safely
  const stopStream = useCallback(() => {
    if (videoRef.current?.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }
  }, []);

  const setupCamera = useCallback(async (desiredFacing: 'environment' | 'user' = facingMode) => {
    setIsInitializing(true);
    stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraErrorMsg('Camera access is not supported by your current browser or context.');
      setIsInitializing(false);
      return;
    }

    try {
      // Check available video devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevicesCount(videoInputs.length);
      } catch {
        // ignore enumeration issues
      }

      let stream: MediaStream | null = null;

      // Attempt 1: Ideal facingMode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: desiredFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err: any) {
        // Attempt 2: Fallback to any available video stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } catch (fallbackErr: any) {
          throw fallbackErr;
        }
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setHasCamera(true);
        setCameraErrorMsg('');
      } else {
        setHasCamera(false);
        setCameraErrorMsg('No video feed could be initialized.');
      }
    } catch (err: any) {
      setHasCamera(false);
      const name = err?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraErrorMsg('Camera permission was denied. Please allow camera access in browser settings or upload a photo.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') {
        setCameraErrorMsg('No physical camera device was found. You can upload an image or choose a preset below.');
      } else {
        setCameraErrorMsg(err?.message || 'Unable to access camera on this device.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    setupCamera(facingMode);
    return () => {
      stopStream();
    };
  }, [setupCamera, facingMode, stopStream]);

  // Capture frame from active video stream
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopStream();
        startScan(dataUrl);
      }
    }
  };

  // Toggle between front and back camera
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    setupCamera(nextMode);
  };

  // Handle uploaded file
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        stopStream();
        startScan(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSampleClick = (sample: SampleItem) => {
    stopStream();
    startScan(sample.imageSvg);
  };

  // ==========================================
  // Fallback View: Camera Unavailable / Upload
  // ==========================================
  if (hasCamera === false) {
    return (
      <div 
        className="w-full h-full flex flex-col bg-navy-950 overflow-y-auto pt-20 pb-28 px-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileInputChange}
        />

        {/* Status Header */}
        <div className="pw-card mb-4 border-surface bg-navy-900/90 text-center flex flex-col items-center p-5">
          <div className="w-14 h-14 bg-snap/10 rounded-2xl flex items-center justify-center mb-3 border border-snap/20 text-snap">
            <CameraOff className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-display font-bold text-ink mb-1">
            Camera Mode Inactive
          </h2>
          <p className="text-xs text-ink-dim max-w-xs leading-relaxed mb-3">
            {cameraErrorMsg || 'No active camera stream detected. Choose an image file or test with sample items below.'}
          </p>
          
          <div className="flex gap-2 w-full max-w-xs">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 pw-btn py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Image
            </button>
            <button 
              onClick={() => setupCamera(facingMode)}
              className="px-3 py-2.5 rounded-btn bg-navy-800 hover:bg-navy-750 text-ink border border-surface text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Retry camera detection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInitializing ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`pw-card border-2 border-dashed transition-all p-6 text-center mb-5 cursor-pointer flex flex-col items-center justify-center ${
            isDragging 
              ? 'border-snap bg-snap/10 scale-[1.01]' 
              : 'border-surface bg-navy-900/50 hover:border-snap/50 hover:bg-navy-900'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-navy-800 text-snap flex items-center justify-center mb-2.5 border border-surface">
            <FileImage className="w-6 h-6" />
          </div>
          <span className="text-sm font-display font-semibold text-ink mb-0.5">
            Drop photo here or browse
          </span>
          <p className="text-xs text-ink-faint">
            Supports JPEG, PNG, WEBP from your device or gallery
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-snap" />
              <h3 className="font-display font-semibold text-xs text-ink uppercase tracking-wider">
                Instant Demo Presets
              </h3>
            </div>
            <span className="text-[11px] text-ink-faint">One-tap scan</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {SAMPLE_PRESETS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleSampleClick(sample)}
                className="pw-card p-3 flex flex-col justify-between hover:border-snap/40 bg-navy-900 hover:bg-navy-800/80 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{sample.icon}</span>
                    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-snap/10 text-snap border border-snap/20">
                      {sample.badge}
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-xs text-ink line-clamp-1 group-hover:text-snap transition-colors">
                    {sample.name}
                  </h4>
                  <p className="text-[11px] text-ink-dim line-clamp-1 mt-0.5">
                    {sample.category}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-surface flex items-center justify-between text-xs">
                  <span className="font-bold text-snap font-display">
                    NZ${sample.estimatedNZD}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:text-snap group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Active Camera View
  // ==========================================
  return (
    <div 
      className="w-full h-full flex flex-col bg-black overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileInputChange}
      />

      {/* Full-bleed camera feed */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Drag Overlay if user drags a file over active camera */}
      {isDragging && (
        <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 text-center border-4 border-dashed border-snap">
          <UploadCloud className="w-16 h-16 text-snap mb-3 animate-bounce" />
          <h3 className="text-lg font-display font-bold text-ink">Drop Image to Appraise</h3>
          <p className="text-xs text-ink-dim">Release to start instant NZ market valuation</p>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-16 inset-x-0 px-4 py-3 z-30 flex items-center justify-between pointer-events-auto">
        <div className="bg-navy-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/90 flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-snap animate-pulse" />
          <span>AI Vision Ready</span>
        </div>

        <div className="flex items-center gap-2">
          {videoDevicesCount > 1 && (
            <button
              onClick={handleFlipCamera}
              className="p-2.5 rounded-full bg-navy-950/70 backdrop-blur-md text-white border border-white/10 hover:bg-navy-900 transition-all cursor-pointer shadow-sm"
              title="Switch camera"
              aria-label="Switch camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setHasCamera(false)}
            className="px-3 py-1.5 rounded-full bg-navy-950/70 backdrop-blur-md text-white/90 border border-white/10 hover:bg-navy-900 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Open Demo & Upload view"
          >
            <Sparkles className="w-3.5 h-3.5 text-snap" />
            <span>Presets</span>
          </button>
        </div>
      </div>

      {/* Viewfinder Overlay with Darkened Mask */}
      <div className="flex-1 relative flex items-center justify-center p-6 z-10 pointer-events-none mt-16 mb-40">
        {/* VIEW FINDER BOX (1:1 Aspect Ratio) */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 relative rounded-2xl shadow-[0_0_0_9999px_rgba(11,15,25,0.65)] border border-white/20 overflow-hidden">
          
          {/* Corner brackets in Emerald */}
          <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-snap rounded-tl-lg z-20"></div>
          <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-snap rounded-tr-lg z-20"></div>
          <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-snap rounded-bl-lg z-20"></div>
          <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-snap rounded-br-lg z-20"></div>
          
          {/* Center Crosshair HUD */}
          <div className="absolute inset-6 border border-dashed border-white/10 rounded-xl flex items-center justify-center">
            <div className="w-4 h-[1px] bg-white/30"></div>
            <div className="h-4 w-[1px] bg-white/30 absolute"></div>
          </div>

          {/* Smooth animated scan line gradient */}
          <motion.div 
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-snap to-transparent shadow-[0_0_15px_3px_rgba(16,185,129,0.7)] z-20"
            animate={{ top: ['5%', '95%', '5%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom Camera Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black/90 via-black/50 to-transparent pb-16 flex items-center justify-around px-8 z-30 pointer-events-auto">
        {/* Upload from Gallery button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors cursor-pointer"
          title="Upload photo from device"
          aria-label="Upload photo"
        >
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition-all">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-medium">Upload</span>
        </button>

        {/* Shutter Button */}
        <button 
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white/40 p-1 flex items-center justify-center group focus:outline-none focus:ring-4 focus:ring-snap/50 cursor-pointer shadow-2xl"
          aria-label="Capture photo"
        >
          <motion.div 
            className="w-full h-full bg-white rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors"
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.85 }}
          >
            <Camera className="w-8 h-8 text-navy-950" />
          </motion.div>
        </button>

        {/* Switch / Presets button */}
        <button
          onClick={() => setHasCamera(false)}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors cursor-pointer"
          title="View test presets"
          aria-label="View test presets"
        >
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition-all">
            <Sparkles className="w-5 h-5 text-snap" />
          </div>
          <span className="text-[11px] font-medium">Presets</span>
        </button>
      </div>
      
      <div className="absolute top-28 left-0 right-0 text-center pointer-events-none z-20">
        <p className="text-white/90 font-display font-medium text-xs drop-shadow-md bg-black/40 px-3 py-1 rounded-full inline-block backdrop-blur-sm border border-white/10">
          Center item in frame or drop photo
        </p>
      </div>
    </div>
  );
}
