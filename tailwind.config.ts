import type { Config } from "tailwindcss";
const config:Config={
 content:["./src/**/*.{js,ts,jsx,tsx,mdx}"],
 theme:{extend:{
  colors:{
   bg:{DEFAULT:"#0d1211",surface:"#151a19",elevated:"#1c231f",border:"#2a342e"},
   lime:{DEFAULT:"#c7f76b",glow:"#dbff96",dim:"#91b953"},
   ink:{DEFAULT:"#f3f7f0",dim:"#abb7ad",mute:"#738278"}
  },
  fontFamily:{sans:["var(--font-geist)","ui-sans-serif","system-ui"],display:["var(--font-instrument)","ui-sans-serif","system-ui"],mono:["ui-monospace","SFMono-Regular","monospace"]},
 }},
 plugins:[]
};
export default config;
