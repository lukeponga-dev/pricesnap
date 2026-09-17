import React,{createContext,useContext,useEffect,useRef,useState}from'react';
import { prepareImage, readAnalysisResponse } from './lib/analysis-client';
import{AnalysisState,ScanResult,Screen}from'./types';import{triggerHaptic}from'./utils';

interface Ctx{
  screen:Screen;
  setScreen:(s:Screen)=>void;
  direction:number;
  history:ScanResult[];
  addToHistory:(r:ScanResult)=>void;
  currentScan:ScanResult|null;
  startScan:(i:string)=>Promise<void>;
  analysisState:AnalysisState;
  toastMessage:string|null;
  showToast:(m:string)=>void;
}

const Context=createContext<Ctx|undefined>(undefined);
const KEY='pricesnap.history.v1';

export function AppStateProvider({children}:{children:React.ReactNode}){
  const activeScan = useRef<AbortController | null>(null);
  useEffect(() => () => activeScan.current?.abort(), []);
  const[screen,setScreenState]=useState<Screen>('landing');
  const[direction,setDirection]=useState(1);
  const[history,setHistory]=useState<ScanResult[]>(()=>{
    try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}
  });
  const[currentScan,setCurrentScan]=useState<ScanResult|null>(null);
  const[analysisState,setAnalysisState]=useState<AnalysisState>('idle');
  const[toastMessage,setToastMessage]=useState<string|null>(null);

  useEffect(()=>{
    try{localStorage.setItem(KEY,JSON.stringify(history.slice(0,50)))}catch{}
  },[history]);

  const setScreen=(n:Screen)=>{
    if (n !== 'analyzing' && n !== 'result') { activeScan.current?.abort(); activeScan.current = null; }
    const o:Record<Screen,number>={landing:0,home:1,scanner:2,history:3,settings:4,analyzing:5,result:6,pitch:7,privacy:8};
    setDirection(o[n]>o[screen]?1:-1);
    setScreenState(n);
    triggerHaptic();
  };

  const showToast=(m:string)=>{
    triggerHaptic();
    setToastMessage(m);
    setTimeout(()=>setToastMessage(null),8000);
  };

  const startScan=async(imageBase64:string)=>{
    triggerHaptic();
    setCurrentScan(null);
    setAnalysisState('uploading');
    setScreen('analyzing');
    activeScan.current?.abort();
    const controller = new AbortController();
    activeScan.current = controller;
    const timer = setTimeout(() => controller.abort(new DOMException('Analysis timed out. Please try again.', 'TimeoutError')), 100000);
    try {
      const prepared = await prepareImage(imageBase64);
      if (controller.signal.aborted) return;
      const response = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
        body: JSON.stringify({ imageBase64: prepared }), signal: controller.signal,
      });
      const data = await readAnalysisResponse(response, stage => {
        if (activeScan.current === controller) setAnalysisState(stage);
      });
      if (activeScan.current !== controller) return;
      setCurrentScan(data);
      setAnalysisState('complete');
      setScreen('result');
    } catch (error: any) {
      if (activeScan.current !== controller) return;
      setAnalysisState('error');
      setScreen('scanner');
      showToast(controller.signal.reason?.name === 'TimeoutError' ? 'Analysis timed out. Please try again.' : error?.message || 'Unable to analyze this image. Please try again.');
    } finally {
      clearTimeout(timer);
      if (activeScan.current === controller) activeScan.current = null;
    }
  };

  const addToHistory=(r:ScanResult)=>{
    if(!history.find(h=>h.id===r.id)){
      setHistory(p=>[r,...p].slice(0,50));
      showToast('Result saved to history');
    }else{
      showToast('Already in history');
    }
  };

  return <Context.Provider value={{screen,setScreen,direction,history,addToHistory,currentScan,startScan,analysisState,toastMessage,showToast}}>{children}</Context.Provider>;
}

export function useAppState(){
  const c=useContext(Context);
  if(!c)throw new Error('useAppState must be used within AppStateProvider');
  return c;
}
