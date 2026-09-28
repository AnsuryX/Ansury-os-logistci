import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ====================================================================
// ANSURY AI CFO COPILOT — GROUNDED PROXY ROUTE (/api/ai-cfo)
// Holds GEMINI_API_KEY server-side; client never sees it.
// Pulls grounded context (bank txns, AR, invoices, vehicles, expenses)
// ====================================================================
app.post('/api/ai-cfo', async (req, res) => {
  try {
    const { question, jwt } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Valid question parameter required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        fallback: true,
        label: 'Cached heuristic — Edge Function offline',
        message: 'GEMINI_API_KEY not configured on server',
      });
    }

    // Grounded Enterprise Financial Dataset
    const groundedData = {
      company: {
        name: 'BEYAYAN LIMITED',
        taxPin: 'P051239841K',
        hq: 'Nairobi Logistics Hub, ICD Road, Embakasi',
        directors: ['Ali Ahmed Ali', 'Ayub Al-Ansari'],
        bankAccounts: [
          { bank: 'I&M Bank Kenya', account: '01306297851250', currency: 'USD', clearedBalance: 15487.69 },
          { bank: 'Safaricom Daraja B2C', paybill: '809214', currency: 'KES', clearedBalance: 482400.00 }
        ]
      },
      swift_wires: [
        { ref: 'S0661552C79D01USD', uetr: '0c9b0da8', date: '2026-06-05', gross: 9730.95, fee: 8.00, net: 9722.95, debtor: 'One Petroleum (U) Limited', status: 'cleared' },
        { ref: 'S0661941AE0101USD', date: '2026-07-13', gross: 5339.61, fee: 0.00, net: 5339.61, debtor: 'One Petroleum (U) Limited', status: 'cleared' },
        { ref: 'S0662191EFAF01', uetr: '66393c7c', date: '2026-08-07', gross: 11420.84, fee: 0.00, net: 11420.84, debtor: 'One Petroleum (U) Limited', status: 'cleared' }
      ],
      commercial_cheques: [
        { chequeNumber: '6297851250000014', ref: 'CHQ-14', amountUsd: 3307.00, payee: 'Toyota Tsusho Spares', status: 'cleared' },
        { chequeNumber: '6297851250000015', ref: 'CHQ-15', amountUsd: 3307.00, payee: 'Bridgestone Tyre Centre', status: 'cleared' }
      ],
      shareholder_equity_inflows: [
        { ref: 'EQ-ALI-10K', wireRef: 'Ali Ahmed Ali A/C 1.96E+11', amountUsd: 10000.00, accountCode: '3001 Shareholder Capital', pnlImpactUsd: 0.00, cashFlowCategory: 'Financing Activities' }
      ],
      accounts_receivable: {
        totalBilledUsd: 97619.40,
        realizedCashUsd: 34499.40,
        outstandingArUsd: 63120.00,
        aging: { current0_30: 42100.00, days31_60: 15420.00, days61_90: 5600.00, days90Plus: 0.00 },
        invoices: [
          { id: 'INV-2026-0815', customer: 'One Petroleum (U) Ltd', corridor: 'Mombasa - Kampala', totalUsd: 16800.00, paidUsd: 7000.00, balanceUsd: 9800.00, status: 'partially_paid' },
          { id: 'INV-2026-0820', customer: 'Vivo Energy Kenya', corridor: 'Nairobi - Eldoret', totalUsd: 12400.00, paidUsd: 12400.00, balanceUsd: 0.00, status: 'paid' },
          { id: 'INV-2026-0828', customer: 'TotalEnergies Marketing', corridor: 'Mombasa - Kigali', totalUsd: 24500.00, paidUsd: 0.00, balanceUsd: 24500.00, status: 'issued' }
        ]
      },
      fleet_telematics: [
        { reg: 'KDA 542T', model: 'Mercedes-Benz Actros 2640', driver: 'John Kuria', corridor: 'Naivasha - Eldoret', baselineBurnL100km: 47.5, observedBurnL100km: 54.2, variancePct: 14.2, idleDurationMins: 42, idleReason: 'Mai Mahiu weighbridge bypass queueing' },
        { reg: 'KDA 543U', model: 'Scania R450 Streamline', driver: 'Hassan Omar', corridor: 'Mombasa - Malaba', baselineBurnL100km: 45.0, observedBurnL100km: 44.8, variancePct: -0.4, status: 'Optimal' },
        { reg: 'KCG 891B', model: 'Isuzu Giga CYH52', driver: 'David Kimani', corridor: 'Mombasa - Nairobi', baselineBurnL100km: 48.0, observedBurnL100km: 47.9, variancePct: -0.2, status: 'Optimal' }
      ],
      expenses_compliance: [
        { id: 'EXP-1055', vendor: 'Equator Tyres Nakuru', amountKes: 48000, category: 'Emergency Tyre Replacement', etrReceiptVerified: false, kraSection23Status: 'Disallowed - Pending Fiscal QR Code', status: 'held' },
        { id: 'EXP-1049', vendor: 'TotalEnergies Mlolongo', amountKes: 96480, category: 'Diesel Fuel Fleet Card', etrReceiptVerified: true, kraSection23Status: 'Allowed Statutory Deduction', status: 'approved' }
      ],
      system_settings: {
        targetFuelBenchmarkKmL: 2.40,
        fuelSpikeThresholdPct: 12.5,
        demurrageDailyUsd: 250.00,
        weighbridgeTolerancePct: 0.50,
        mpesaMinFloatKes: 250000.00,
        pettyCashDailyLimitKes: 100000.00
      }
    };

    const systemPrompt = `You are the Ansury AI CFO Copilot, an enterprise financial controller and haulage intelligence expert for Ansury Logistics OS (operating along the East African Northern Corridor).

NON-NEGOTIABLE ACCOUNTING & TELEMATICS RULES:
1. Grounding Mandate: You must answer ONLY using facts, numbers, and identifiers found in the GROUNDED LEDGER DATA below. Do NOT invent, extrapolate, or hallucinate transactions, invoices, or corridors.
2. Source Citations: Every single financial claim, variance, balance, or calculation MUST include explicit source citations in square brackets referencing the source table and row identifier.
   Examples:
   - "[Source: invoices #INV-2026-0815]"
   - "[Source: swift_wires #S0661552C79D01USD]"
   - "[Source: shareholder_equity_inflows #EQ-ALI-10K]"
   - "[Source: fleet_telematics #KDA 542T]"
   - "[Source: expenses_compliance #EXP-1055]"
   - "[Source: bankAccounts #01306297851250]"
3. Insufficient Data Rule: If the user asks about an unknown period, an unrecorded truck, or unrecorded figures not present in the data, you MUST explicitly state: "Insufficient data in active enterprise ledgers to substantiate this inquiry." Do not guess.
4. Non-Revenue Rule: Owner capital injections (e.g. Ali Ahmed Ali $10,000.00) are classified strictly under Shareholder Equity (Account 3001) and Financing Cash Flows. They are NEVER operating revenue and have $0.00 P&L impact.
5. Accrual Isolation Rule: Unpaid invoices in Accounts Receivable are contractual billing assets on the Balance Sheet; they NEVER count as liquid cash in bank accounts until cleared.
6. CapEx Isolation: Vehicle or equipment purchases are capital expenditures (Asset Account 1500) and are depreciated; they are NEVER booked directly as operating period haulage costs.
7. KRA Section 23: Cash or mobile disbursements lacking an electronic tax register (ETR/TIMS) QR code are non-deductible for corporate tax under KRA Section 23.

GROUNDED LEDGER DATA:
${JSON.stringify(groundedData, null, 2)}
`;

    const ai = new GoogleGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${systemPrompt}\n\nUSER QUESTION: ${question}`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      }
    });

    const answer = response.text || 'Insufficient data in active enterprise ledgers to substantiate this inquiry.';

    // Extract citation brackets
    const citationRegex = /\[Source:\s*([^\]]+)\]/g;
    const citations: string[] = [];
    let match;
    while ((match = citationRegex.exec(answer)) !== null) {
      citations.push(match[1]);
    }

    return res.json({
      answer,
      citations: Array.from(new Set(citations)),
      isGrounded: true,
      model: 'gemini-3.8-flash',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai-cfo:', error);
    return res.status(500).json({
      fallback: true,
      error: error?.message || 'AI CFO Grounding Service error',
    });
  }
});

// ====================================================================
// VITE MIDDLEWARE / STATIC ASSETS HOSTING
// ====================================================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ansury Logistics OS] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
