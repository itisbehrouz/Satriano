"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; href: string }[];
}

const FAQ_KNOWLEDGE_BASE: { keywords: string[]; answer: string; actions?: { label: string; href: string }[] }[] = [
  {
    keywords: ["moq", "minimum", "quantity", "least", "pcs", "pieces"],
    answer: "Our standard Minimum Order Quantity (MOQ) starts at 50 units per fabric line/colorway. For multi-fabric orders within the same product line, combined MOQ options are available.",
    actions: [
      { label: "View Wholesale MOQ Filters", href: "/wholesale" },
      { label: "Configure Order Spec", href: "/konfigurator" },
    ],
  },
  {
    keywords: ["price", "cost", "pricing", "budget", "ledger", "tier", "quote"],
    answer: "Unit costs are determined by your chosen fabric grade (Standard Cotton, Royal Oxford, Italian Wool) and order volume. Use our live Price Ledger Estimator on the homepage or launch the configurator for an instant breakdown.",
    actions: [
      { label: "Live Price Ledger Estimator", href: "/#estimator" },
      { label: "Wholesale Price Tiers", href: "/wholesale" },
    ],
  },
  {
    keywords: ["proforma", "invoice", "pdf", "payment", "stripe", "checkout"],
    answer: "After configuring your spec, our system generates an official itemized Proforma Invoice PDF with 30-day validity sent directly to your email. Payments can be completed securely via card checkout.",
    actions: [
      { label: "B2B Partner Portal", href: "/portal" },
      { label: "Supply & Manufacturing Terms", href: "/legal/supply-terms" },
    ],
  },
  {
    keywords: ["delivery", "shipping", "lead time", "time", "days", "express", "incoterms"],
    answer: "Standard production lead time is 14 business days from payment confirmation. Delivery is fulfilled under DDP or EXW Incoterms directly to your international corporate distribution centers.",
    actions: [
      { label: "Explore Wholesale Delivery Times", href: "/wholesale" },
    ],
  },
  {
    keywords: ["size", "sizing", "eu", "us", "matrix", "measurements", "fit"],
    answer: "We utilize fixed producible size matrices (XS through 3XL) across European (EU) and American (US) standard sizing systems. We offer 8 menswear cut options including Slim, Regular, Tailored, and Oversized.",
    actions: [
      { label: "Launch Size Matrix Configurator", href: "/konfigurator" },
    ],
  },
  {
    keywords: ["logo", "branding", "embroidery", "print", "vector", "ai", "svg", "eps"],
    answer: "We support full white-label branding! Upload your vector logo (.AI, .EPS, .SVG) during configuration for Left-Chest or Right-Sleeve placement, custom neck tags, and care labels.",
    actions: [
      { label: "Upload Vector Logo Spec", href: "/konfigurator" },
    ],
  },
  {
    keywords: ["catalog", "categories", "products", "menswear", "suits", "blazers", "shirts"],
    answer: "Our manufacturing catalog features over 65 producible products across 7 main categories: Tops, Bottoms, Formal Wear, Outerwear, Sportswear, Loungewear, and Accessories.",
    actions: [
      { label: "Browse Full Manufacturing Catalog", href: "/categories" },
      { label: "Wholesale Menswear Grid", href: "/wholesale" },
    ],
  },
];

const PRESET_QUESTIONS = [
  "What is the Minimum Order Quantity (MOQ)?",
  "How does proforma invoicing work?",
  "What are the standard production lead times?",
  "What fabrics and sizing systems are available?",
  "Can we upload vector logos for branding?",
];

export function AIFaqAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "ai",
      text: "Welcome to Satriano Atelier 24/7 AI B2B Desk! I am your automated procurement assistant. Ask me anything about MOQs, proforma PDF issuance, fabric grades, lead times, or site navigation.",
      timestamp: "Just now",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenAI = () => setIsOpen(true);
    window.addEventListener("open-ai-assistant", handleOpenAI);
    return () => window.removeEventListener("open-ai-assistant", handleOpenAI);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");

    // Simulate instant 24/7 AI response matching knowledge base
    setTimeout(() => {
      const q = userText.toLowerCase();
      let match = FAQ_KNOWLEDGE_BASE.find((k) => k.keywords.some((kw) => q.includes(kw)));

      const aiResponseText = match
        ? match.answer
        : "I am trained on Satriano Atelier's manufacturing protocols. For specific custom contracts, MOQs starting at 50 pcs, or proforma invoice details, you can launch our online spec builder or contact our human B2B concierge.";

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedActions: match?.actions || [
          { label: "Start Custom Order Spec", href: "/konfigurator" },
          { label: "View Wholesale Catalog", href: "/wholesale" },
        ],
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-start p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div className="w-full max-w-lg bg-[#0B1E3D] text-white border border-[#1E3A8A] rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:ml-4">
            {/* Header */}
            <div className="bg-[#071325] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#DBB671] text-[#0B1E3D] rounded-none flex items-center justify-center font-bold shadow-md">
                  <span className="material-symbols-outlined text-xl">smart_toy</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Satriano 24/7 AI Desk</h3>
                    <span className="text-[10px] bg-[#DBB671]/20 text-[#DBB671] border border-[#DBB671]/40 px-2 py-0.5 rounded-none font-mono font-bold">
                      24/7 LIVE AI
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">Instant answers to FAQs, MOQs, pricing &amp; proformas</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-[#94A3B8] hover:text-white text-xs p-1 cursor-pointer"
                aria-label="Close 24/7 AI B2B Desk"
              >
                ✕
              </button>
            </div>

            {/* Quick Preset Question Chips */}
            <div className="p-3 bg-[#081733] border-b border-white/10 flex gap-2 overflow-x-auto scrollbar-none">
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="whitespace-nowrap text-[11px] bg-[#152744] hover:bg-[#2E5AAC] text-[#93C5FD] hover:text-white px-3 py-1.5 rounded-none border border-white/10 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-4 flex-grow max-h-[50vh] text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-none space-y-2 border ${
                      msg.sender === "user"
                        ? "bg-[#2E5AAC] text-white border-[#60A5FA]/30"
                        : "bg-[#152744] text-[#E2E8F0] border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-[#94A3B8] border-b border-white/10 pb-1 mb-1">
                      <span className="font-bold uppercase tracking-wider text-[#DBB671]">
                        {msg.sender === "user" ? "You (Client)" : "Satriano AI Desk"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="leading-relaxed text-xs">{msg.text}</p>

                    {/* Suggested Links / Actions */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <Link
                            key={aIdx}
                            href={action.href}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#60A5FA] hover:text-white underline"
                          >
                            <span>{action.label}</span>
                            <span>→</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputQuery);
              }}
              className="p-4 bg-[#071325] border-t border-white/10 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask AI about MOQs, lead times, sizing, proforma invoices..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-grow bg-[#152744] border border-white/20 rounded-none px-4 py-2.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#DBB671]"
              />
              <button
                type="submit"
                className="bg-[#DBB671] hover:bg-[#c9a35e] text-[#0B1E3D] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-none transition-colors shrink-0"
              >
                Ask AI
              </button>
            </form>
          </div>
        </div>
  );
}
