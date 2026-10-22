'use client';
import {useEffect,useState} from 'react';

type Theme='light'|'dark';
const KEY='interview-buddy-theme';

export function ThemeToggle(){
 const [theme,setTheme]=useState<Theme>('light');
 useEffect(()=>{
  try{
   const saved=window.localStorage.getItem(KEY);
   const next:Theme=saved==='dark'?'dark':'light';
   document.documentElement.dataset.theme=next;
   setTheme(next);
  }catch{
   document.documentElement.dataset.theme='light';
  }
 },[]);
 function toggle(){
  const next:Theme=theme==='light'?'dark':'light';
  document.documentElement.dataset.theme=next;
  setTheme(next);
  try{window.localStorage.setItem(KEY,next)}catch{/* Browser may block storage. */}
 }
 return <button className="theme-toggle" type="button" onClick={toggle} aria-label={theme==='light'?'Switch to dark mode':'Switch to light mode'} title={theme==='light'?'Switch to dark mode':'Switch to light mode'} aria-pressed={theme==='dark'}>
  <span aria-hidden="true">{theme==='light'?'☾':'☀'}</span>
 </button>;
}
