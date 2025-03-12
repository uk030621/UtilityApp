"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Calculator() {
  const [input, setInput] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);

  const handleButtonClick = (value: string) => {
    if (value === "=") {
      try {
        const result = eval(input).toString();
        setInput(result);
        setHistory((prev) => [input + " = " + result, ...prev].slice(0, 5)); // Store last 5 calculations
      } catch {
        setInput("Error");
      }
    } else if (value === "C") {
      setInput("");
    } else if (value === "←") {
      setInput(input.slice(0, -1));
    } else if (value === "x²") {
      setInput((prev) =>
        prev ? Math.pow(parseFloat(prev), 2).toString() : ""
      );
    } else if (value === "√x") {
      setInput((prev) => (prev ? Math.sqrt(parseFloat(prev)).toString() : ""));
    } else if (value === "%") {
      setInput((prev) => (prev ? (parseFloat(prev) / 100).toString() : ""));
    } else {
      setInput((prev) => prev + value);
    }
  };

  const clearHistory = () => setHistory([]);

  const buttons = [
    { label: "C", style: "bg-blue-500 hover:bg-blue-600" },
    { label: "←", style: "bg-blue-500 hover:bg-blue-600" },
    { label: "x²", style: "bg-blue-500 hover:bg-blue-600" },
    { label: "√x", style: "bg-blue-500 hover:bg-blue-600" },

    { label: "7", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "8", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "9", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "/", style: "bg-gray-600 hover:bg-gray-700" },

    { label: "4", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "5", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "6", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "*", style: "bg-gray-600 hover:bg-gray-700" },

    { label: "1", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "2", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "3", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "-", style: "bg-gray-600 hover:bg-gray-700" },

    { label: "0", style: "bg-gray-600 hover:bg-gray-700" },
    { label: ".", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "%", style: "bg-gray-600 hover:bg-gray-700" },
    { label: "+", style: "bg-gray-600 hover:bg-gray-700" },
  ];

  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-b from-slate-100 to-slate-500 p-4 py-6">
      <div className="w-80 bg-gray-800 rounded-lg p-4 shadow-lg">
        {/* Display */}
        <motion.div
          key={input}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-2 p-3 bg-gray-700 text-white text-right text-2xl rounded"
        >
          {input || "0"}
        </motion.div>

        {/* History */}
        <div className="mb-2">
          <div className="text-gray-400 text-sm">History</div>
          <div className="h-16 overflow-y-auto bg-gray-700 p-2 rounded text-white text-sm">
            {history.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                {entry}
              </motion.div>
            ))}
          </div>
          <button
            onClick={clearHistory}
            className="mt-2 text-xs text-red-400 hover:text-red-300"
          >
            Clear History
          </button>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          {buttons.map(({ label, style }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.9 }}
              className={`p-4 text-xl font-semibold rounded shadow-sm transition text-white ${style}`}
              onClick={() => handleButtonClick(label)}
            >
              {label}
            </motion.button>
          ))}

          {/* Equal Button (Spans Two Columns) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-4 text-xl font-semibold rounded shadow-sm transition bg-green-500 hover:bg-green-600 text-white col-span-2"
            onClick={() => handleButtonClick("=")}
          >
            =
          </motion.button>

          {/* Back to Menu Button (Spans Two Columns) */}
          <Link
            href="/"
            className="p-4 text-center text-xl font-semibold rounded shadow-sm transition bg-gray-600 hover:bg-gray-700 text-white col-span-2 flex items-center justify-center"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
}
