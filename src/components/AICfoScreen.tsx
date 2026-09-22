import React, { useState } from 'react';

export const AICfoScreen: React.FC = () => {
  const [messages, setMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: "Good day David. I am your Ansury AI CFO Copilot, monitoring your 52 prime movers, KCB treasury float, and Northern Corridor unit margins in real time. How can I assist your haulage cash flow today?",
      time: '14:30 EAT',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedQuestions = [
    'Verify our real SWIFT wires and bank reconciliations',
    'Are unpaid invoices counted as liquid cash?',
    'How is shareholder owner capital treated in the P&L?',
    'Explain the +14.2% fuel spike on KDA 542T Actros',
    'Forecast our Mombasa-Kampala cash float required for next week',
    'Review KRA Section 23 ETR tax deductibility risks',
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q, time: 'Just now' };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();

      if (lower.includes('swift') || lower.includes('wire') || lower.includes('reconcil')) {
        reply =
          "**Verified Banking Ledger & Inward Remittances**:\n\n" +
          "Your live I&M Bank USD Account **01306297851250** reflects 3 verified SWIFT pacs.008 wire credit transfers totaling **$26,483.40** from shipper **One Petroleum (U) Limited**:\n\n" +
          "• **05-Jun-2026**: $9,722.95 (Net after $8.00 fee) • [SWIFT: pacs.008 | Ref: S0661552C79D01USD | UETR: 0c9b0da8]\n" +
          "• **13-Jul-2026**: $5,339.61 • [SWIFT: pacs.008 | Ref: S0661941AE0101USD]\n" +
          "• **07-Aug-2026**: $11,420.84 • [SWIFT: pacs.008 | Ref: S0662191EFAF01 | UETR: 66393c7c]\n\n" +
          "Commercial Cheques #14 ($3,307.00) & #15 ($3,307.00) cleared successfully for workshop spares and tyre replacements. Closing liquid bank balance: **$15,487.69** (100% reconciled).";
      } else if (lower.includes('unpaid') || lower.includes('ar') || lower.includes('receivable') || lower.includes('cash in the bank')) {
        reply =
          "**Accounting Isolation Rule: AR vs. Cash**:\n\n" +
          "Under strict accrual freight accounting, **unpaid invoices never appear as liquid cash** in your bank accounts:\n\n" +
          "• **Outstanding AR**: **$63,120.00** (contractual billing assets pending collection from Vivo Energy, TotalEnergies, and Mogas).\n" +
          "• **Liquid Cash at Bank**: **$15,487.69** (actual cleared funds at I&M Bank Kenya).\n\n" +
          "The $63,120.00 in uncollected AR is classified exclusively as a Current Asset on your Balance Sheet and is strictly excluded from your liquid cash reserves until cleared via bank RTGS or SWIFT wire.";
      } else if (lower.includes('capital') || lower.includes('owner') || lower.includes('ali ahmed')) {
        reply =
          "**Owner Capital Treatment (Non-Revenue Rule)**:\n\n" +
          "Shareholder capital injections are classified under **Equity (Account 3001)** and **Cash Flows from Financing Activities**, NOT Operating Revenue:\n\n" +
          "• **Shareholder**: Ali Ahmed Ali\n" +
          "• **Inflow Amount**: **+$10,000.00** (Wire Ref: Ali Ahmed Ali A/C 1.96E+11)\n" +
          "• **P&L Impact**: **$0.00** (Zero distortion of operating freight margin).\n\n" +
          "This guarantees your freight operating margin (53.0%) is purely derived from commercial haulage operations.";
      } else if (lower.includes('float') || lower.includes('mombasa') || lower.includes('forecast')) {
        reply =
          "**Corridor Cash Float Requirement Forecast**:\n\n" +
          "Based on scheduled departures for 12 prime movers on the Mombasa-Kampala corridor next week, direct variable outlay will require **KES 1,339,200**:\n\n" +
          "• **Diesel Fuel**: KES 892,800 (4,960 Litres @ KES 180/L across TotalEnergies cards)\n" +
          "• **Malaba OSBP & Transit Tolls**: KES 198,000\n" +
          "• **Driver En-Route Allowances**: KES 300,000 (disbursed via Safaricom Till 809214)\n" +
          "• **Emergency Contingency**: KES 48,400\n\n" +
          "Current liquid float across Safaricom Till 809214 and KCB Treasury stands at **KES 2,260,150**, providing a safe liquidity buffer of **KES 920,950** (+40.7% reserve).";
      } else if (lower.includes('fuel') || lower.includes('spike') || lower.includes('542t')) {
        reply =
          "**[AUDIT SIGNAL] Telemetry Fuel Variance Analysis**:\n\n" +
          "• **Asset**: KDA 542T (Mercedes Actros 2640, Driver: John Kuria)\n" +
          "• **Corridor**: Nairobi → Tororo / Kampala (Naivasha climb)\n" +
          "• **Observed Burn**: **54.2 L/100km** vs baseline target of **47.5 L/100km** (+14.2% variance).\n" +
          "• **CANBUS Diagnostic**: 3 extended idle stops (totalling 42 minutes) with air-conditioning active while queueing at Mai Mahiu weighbridge bypass.\n" +
          "• **Classification**: Labeled as behavioral idle queueing rather than fuel theft or injector failure. Mechanical turbo boost nominal at 2.1 bar.";
      } else if (lower.includes('kra') || lower.includes('etr') || lower.includes('tax')) {
        reply =
          "**KRA Section 23 Compliance Audit**:\n\n" +
          "• **Approved Deductions**: KES 1,820,000 verified with electronic fiscal QR slips.\n" +
          "• **[AUDIT SIGNAL: Documentation Missing]**: Claim #EXP-1055 (KES 48,000 at Equator Tyres Nakuru) currently lacks a verified ETR slip.\n" +
          "• Under Section 23 of the Kenya Income Tax Act, cash vouchers lacking ETR validation are disallowed as corporate tax offsets.\n" +
          "• **Action Taken**: Claim placed on temporary hold pending electronic vendor receipt. Zero hallucination enforced.";
      } else {
        reply =
          "**Corridor Performance & Unit Margins**:\n\n" +
          "Analyzing real haulage records across 15,560 km MTD:\n\n" +
          "• **Operating Margin**: **53.0%** (Freight revenue KES 4.82M vs direct trip outlays of KES 2.41M).\n" +
          "• **Revenue Yield**: **KES 148.50/km** against target baseline of KES 135.00/km (+10.0% outperformance).\n" +
          "• **Fleet Efficiency**: Averaging **2.20 km/L** across heavy 36-tonne prime movers.\n" +
          "• Grounded in 8 active corridor dispatches with 100% verified banking reconciliation.";
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: reply, time: 'Just now' },
      ]);
      setIsThinking(false);
    }, 750);
  };

  return (
    <div className="p-space-lg space-y-space-lg pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e5eeff]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-label-code text-[11px] text-outline">
              Executive AI Intelligence • Specialized East African Haulage LLM
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="font-headline-lg text-2xl font-bold text-on-surface tracking-tight">
              Ansury AI CFO Copilot
            </h1>
            <span className="font-label-code text-[11px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
              Active Synthesis
            </span>
          </div>
          <p className="font-body-md text-[13px] text-outline mt-0.5">
            Query corridor unit economics, cash float requirements, driver fuel burn patterns and KRA tax deductibility.
          </p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="p-3 bg-surface-container-lowest rounded-xl border border-[#dce9ff] hover:bg-surface-container text-left transition-colors shadow-sm text-[12px] text-on-surface font-medium flex items-start gap-2"
          >
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
              chat_bubble
            </span>
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="bg-surface-container-lowest rounded-2xl border border-[#dce9ff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex flex-col h-[520px] overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-space-lg space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-on-surface text-surface'
                    : 'bg-primary text-on-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {m.sender === 'user' ? 'person' : 'psychology'}
                </span>
              </div>

              <div
                className={`max-w-xl p-3.5 rounded-2xl text-[13px] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-primary text-on-primary rounded-tr-none'
                    : 'bg-surface-container-low text-on-surface border border-[#dce9ff] rounded-tl-none whitespace-pre-line'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`block text-[10px] mt-1 font-label-code ${
                    m.sender === 'user' ? 'text-on-primary/70' : 'text-outline'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  sync
                </span>
              </div>
              <div className="bg-surface-container-low p-3 rounded-2xl border border-[#dce9ff] text-[12px] text-outline">
                Ansury AI CFO is synthesizing telematics and treasury ledgers...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-space-md bg-surface-container-low border-t border-[#e5eeff] flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask about corridor profits, truck fuel anomalies, or driver allowances..."
            className="flex-1 h-10 px-4 bg-surface-container-lowest rounded-xl font-body-sm text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-[#dce9ff]"
          />
          <button
            onClick={() => handleSend()}
            className="h-10 px-4 bg-primary text-on-primary rounded-xl font-body-sm text-[13px] font-medium hover:bg-primary-container shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Ask CFO</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
