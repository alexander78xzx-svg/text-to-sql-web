import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

export default function App() {
  return (
    <>
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      
      <h1 className="text-2xl font-bold mb-6">Text to SQL</h1>

      <div className="flex w-full max-w-4xl gap-6 items-stretch">
        
        <div className="flex-1 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium">Add tables :</p>
            <div className="bg-slate-200 rounded-lg p-2 flex items-center justify-center cursor-pointer">
              <button>+</button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Add foreign keys :</p>
            <div className="bg-slate-200 rounded-lg p-2 flex items-center justify-center cursor-pointer">
              <button>+</button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Your question :</p>
            <input 
              className="border-2 border-black/10 p-3 w-full text-sm rounded-2xl outline-none" 
              placeholder="Ask something..."
            />
          </div>

          <button className="w-full py-3 bg-emerald-500 hover:cursor-pointer  hover:bg-emerald-600 text-white font-bold rounded-xl duration-500 transition">
            Generate
          </button>
        </div>

        <div className="flex-1 border-2 border-black/10 rounded-2xl p-4 bg-white flex flex-col min-h-[300px]">
          <p className="text-gray-400 text-sm">Generated SQL will appear here...</p>
        </div>

      </div>
    </div>
  </>
  );
}