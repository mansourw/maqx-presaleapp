'use client'

import { useState } from 'react'
import {
  useAccount, useChainId, useConnect, useDisconnect, useSwitchChain,
  useReadContract, useWriteContract, useWaitForTransactionReceipt
} from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { parseEther, parseUnits, formatUnits } from 'viem'
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts'




function GenerateWalletBlock() {
  const [stage, setStage] = useState<'idle' | 'showing'>('idle')
  const [addr, setAddr] = useState<string | null>(null)
  const [pk, setPk] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  function generate() {
    try {
      const priv = generatePrivateKey()
      const account = privateKeyToAccount(priv)
      setPk(priv)
      setAddr(account.address)
      setStage('showing')
      setConfirmed(false)
    } catch (e) {
      alert('Failed to generate wallet. Please try again.')
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  function downloadTxt() {
    if (!addr || !pk) return
    const content =
`MAQX Wallet (self-custody)
Address: ${addr}
Private Key (keep secret!): ${pk}

IMPORTANT:
• Anyone with this private key can spend your funds.
• MAQX cannot recover this if you lose it. Store offline.
`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'maqx-wallet.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (stage === 'idle') {
    return (
      <button
        onClick={generate}
        className="w-44 px-3 py-1.5 rounded text-black text-sm"
        style={{ backgroundColor: '#d7df23' }}
        title="Create a self-custodial wallet (store your key safely)"
      >
        Generate wallet
      </button>
    )
  }

  // stage === 'showing'
  return (
    <div className="w-full sm:w-80 rounded-xl border border-zinc-700 bg-zinc-900/80 p-3 text-xs">
      <div className="font-medium mb-2">Your new wallet</div>
      <div className="space-y-2">
        <div className="break-all">
          <div className="opacity-70">Address</div>
          <div className="font-mono">{addr}</div>
          <button onClick={() => addr && copy(addr)} className="mt-1 underline">Copy address</button>
        </div>
        <div className="break-all">
          <div className="opacity-70">Private key</div>
          <div className="font-mono">{pk}</div>
          <button onClick={() => pk && copy(pk)} className="mt-1 underline">Copy private key</button>
        </div>

        <div className="mt-2">
          <button onClick={downloadTxt} className="px-2 py-1 rounded bg-zinc-200 text-black">Download .txt backup</button>
        </div>

        <div className="mt-2 p-2 rounded bg-yellow-900/20 border border-yellow-700/40">
          <div className="text-yellow-300 font-medium">Important</div>
          <ul className="list-disc list-inside opacity-90">
            <li>Store the private key offline. Anyone with it can spend your funds.</li>
            <li>MAQX cannot recover this for you if lost.</li>
            <li>Import into MetaMask/Rabby later using “Import account &gt; Private key”.</li>
          </ul>
        </div>

        <label className="mt-2 flex items-center gap-2">
          <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
          <span>I saved my key safely</span>
        </label>

        <div className="mt-2 flex justify-end">
          <button
            disabled={!confirmed}
            onClick={() => setStage('idle')}
            className="px-3 py-1.5 rounded bg-white text-black disabled:opacity-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
import { presaleAbi } from '@/lib/presaleAbi'
import { erc20Abi } from '@/lib/erc20Abi'


function Faq() {
  const items = [
    {
      q: 'What can I buy with?',
      a: (
        <>
          <p><b>ETH, USDC, EURC, and Fiat</b> are supported.</p>
          <p className="mt-1">Minimums and any per-method notes are shown live on the <b>Presale Board</b>.</p>
        </>
      ),
    },
    {
      q: 'What is the minimum buy?',
      a: (
        <>
          <p>Each currency has its own minimum. Purchases below the minimum won’t go through.</p>
          <p className="mt-1">Check the <b>Presale Board</b> for live values.</p>
        </>
      ),
    },
    {
      q: 'Is there a maximum per wallet?',
      a: <>Yes. Each wallet has a purchase cap shown on the <b>Presale Board</b>.</>,
    },
    {
      q: 'How do the presale tiers work?',
      a: (
        <>
          <p>The presale runs in <b>4 tiers</b> with increasing prices and fixed allocations.</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>When one tier sells out, the next begins automatically.</li>
            <li>The <b>Presale Board</b> shows current tier, price, remaining supply, and timing.</li>
          </ul>
        </>
      ),
    },
    {
      q: 'What wallet do I need?',
      a: (
        <ul className="list-disc list-inside space-y-1">
          <li>Already use MetaMask or a WalletConnect wallet? Connect it directly.</li>
          <li>No wallet yet? You can auto-generate one (planned) from the <b>Presale Board</b>.</li>
          <li>Save your private key securely — <b>MAQX cannot recover lost keys</b>.</li>
        </ul>
      ),
    },
    {
      q: 'Can I send ETH directly to the contract?',
      a: (
        <>
          <p><b>Yes.</b> Sending ETH to the presale contract equals a purchase — you’re paying into the presale and <b>MAQX tokens are delivered instantly</b> to your wallet (import the MAQX token if not visible).</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Works from self-custody wallets (MetaMask, Rabby, Frame, Brave, Coinbase Wallet, Trust, Ledger, Trezor, etc.).</li>
            <li><b>Do not send from exchanges.</b></li>
            <li>Make sure your amount is above the minimum shown on the <b>Presale Board</b>.</li>
          </ul>
        </>
      ),
    },
    {
      q: 'What happens after I buy?',
      a: <>Delivery is immediate to your connected wallet. If you don’t see tokens, add the MAQX token contract address.</>,
    },
    {
      q: 'Where do my funds go?',
      a: <>All proceeds go directly into the official <b>MAQX LABS Ltd. Treasury</b>.</>,
    },
    {
      q: 'Where can I find live updates?',
      a: (
        <>
          Always check the <b>Presale Board</b> for accepted currencies, minimums, wallet caps, tier status, price, and remaining supply.
        </>
      ),
    },
  ];

  return (
    <section className="mt-8">
      <h2 className="text-base font-normal mb-3">MAQX Presale – FAQ</h2>
      <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/40">
        {items.map((item, i) => (
          <FaqItem key={i} {...item} />
        ))}
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-4 py-2 text-left hover:bg-zinc-900/60"
        aria-expanded={open}
      >
        <span className="text-xs font-normal">{q}</span>
        <span
          className={`inline-flex h-6 w-6 items-center justify-center text-xs transition-transform ${
            open ? 'rotate-45' : ''
          }`}
          aria-hidden
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs text-zinc-300">
          {a}
        </div>
      )}
    </div>
  );
}


function Guidelines() {
  const sections: Array<{
    title: string
    defaultOpen?: boolean
    content: React.ReactNode
  }> = [
    {
      title: 'What can I buy with?',
      defaultOpen: true,
      content: (
        <div className="space-y-2 text-xs">
          <p>You can participate in the presale using <b>ETH</b> or <b>USDC</b>.</p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>Minimum amounts (per currency) are displayed live on the <b>Presale Board</b>.</li>
            <li>Purchases below the minimum will not go through.</li>
            <li>You can always buy more than the minimum.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'How do the tiers work?',
      content: (
        <div className="space-y-2 text-xs">
          <p>The presale runs in <b>4 tiers</b>:</p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>Each tier has its own token price and allocation.</li>
            <li>Prices increase as you move up the tiers.</li>
            <li>When one tier sells out, the next begins automatically.</li>
            <li>Tier duration, remaining supply, and price are always visible on the <b>Presale Board</b>.</li>
          </ul>
          <p className="opacity-80">👉 Simply check the Board for the current tier and price before you buy.</p>
        </div>
      ),
    },
    {
      title: 'What wallet do I need?',
      content: (
        <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
          <li>If you already use a wallet (e.g. MetaMask or a WalletConnect wallet), connect it directly.</li>
          <li>If you don’t have a wallet yet, you’ll be able to auto-generate one on the <b>Presale Board</b> (planned).</li>
          <li>Save your wallet address and private key securely. <b>MAQX cannot recover lost keys</b>.</li>
          <li>Your wallet must hold enough ETH or USDC before you can buy.</li>
        </ul>
      ),
    },
    {
      title: 'Buying MAQX with direct ETH sends',
      content: (
        <div className="space-y-2 text-xs">
          <p>
            You can purchase MAQX by sending ETH directly to the presale contract address. This <b>pays into the presale</b> and
            <b> tokens are delivered instantly</b> to your wallet (import the MAQX token if not visible).
          </p>
          <ul className="list-disc list-inside space-y-1 opacity-80">
            <li>Works from self-custody wallets (MetaMask, Rabby, Frame, Brave Wallet, Coinbase Wallet, Trust, Ledger, Trezor, etc.).</li>
            <li><b>Does not work from exchanges</b> (Binance, Coinbase exchange, Kraken, etc.).</li>
            <li>ETH amount must be above the minimum shown on the <b>Presale Board</b>.</li>
            <li>Recommended for experienced users; most buyers should still use the Presale Board UI.</li>
          </ul>
          <ol className="list-decimal list-inside space-y-1 opacity-80">
            <li>Copy the official presale contract address from the MAQX website.</li>
            <li>In your wallet, choose <i>Send ETH</i>.</li>
            <li>Paste the presale contract address.</li>
            <li>Enter the amount of ETH to invest.</li>
            <li>Confirm the transaction.</li>
            <li>Your MAQX tokens appear in your wallet (import the MAQX token address if not visible).</li>
          </ol>
        </div>
      ),
    },
    {
      title: 'Other important notes',
      content: (
        <ul className="list-disc list-inside space-y-1 text-xs opacity-80">
          <li><b>Per-wallet cap:</b> Each wallet can only purchase up to the maximum shown on the <b>Presale Board</b>.</li>
          <li><b>Instant delivery:</b> Tokens are sent straight to your wallet after each purchase.</li>
          <li><b>Treasury:</b> All funds go directly to the official <b>MAQX LABS Ltd. Treasury</b>.</li>
          <li><b>Direct ETH buys:</b> Sending ETH directly to the presale contract also works (see section above).</li>
        </ul>
      ),
    },
  ];

  return (
    <section className="mt-6">
      <h2 className="text-base font-medium mb-2">Guidelines</h2>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 divide-y divide-zinc-800">
        {sections.map((s, i) => (
          <GuidelineItem key={i} title={s.title} defaultOpen={!!s.defaultOpen}>
            {s.content}
          </GuidelineItem>
        ))}
      </div>
    </section>
  );
}

function GuidelineItem({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-900/60"
        aria-expanded={open}
      >
        <span className="text-sm font-normal">{title}</span>
        <span className={`text-lg leading-none transition-transform ${open ? 'rotate-90' : ''}`} aria-hidden>›</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}


const PRESALE = process.env.NEXT_PUBLIC_PRESALE_ADDRESS as `0x${string}`
const USDC    = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`
const EURC   = process.env.NEXT_PUBLIC_EURC_ADDRESS as `0x${string}` | undefined
const TARGET  = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111)
// Colors for dashboard
const BAR_H = 10;                 // <-- bar height in px (try 10, 12, etc.)
const MIN_SOLD_PCT = 3;          // <-- ensures a tiny green even when 0 sold
const GREEN = '#43D89B';         // "MAQX green" (adjust to taste)
const CYAN  = '#22D3EE';         // cyan for remaining (adjust to taste)
// Define clear min decimals
const MIN_DISPLAY = 2      // show minimum 2 decimals
const MAX_DISPLAY = 6      // cap at 6 decimals
// Minimum buy amounts
const MIN_ETH = '0.01';   // in ETH
const MIN_USDC = '10';    // in USDC
const MIN_EURC = '10';    // in EURC
const MIN_FIAT = '10';    // USD/EUR – placeholder until provider confirms

// quick helpers
const fmt = (n?: any, d = 18) => (n == null ? '—' : (Number(n) / 10 ** d).toLocaleString())
const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '')
const bnToNum = (n?: any, d = 18) =>
  n == null ? 0 : Number(n) / 10 ** d

const pct = (num: number, den: number) =>
  den > 0 ? Math.min(100, Math.max(0, (num / den) * 100)) : 0

// Decimals helpers
const gte = (a: string, b: string, dec = 18) => {
  try { return parseUnits(a || '0', dec) >= parseUnits(b || '0', dec) } catch { return false }
}
const isPositiveNumber = (v: string) => !!v && !Number.isNaN(Number(v)) && Number(v) > 0
const clampDecimals = (v: string, max = 6) => {
  const [i, f = ''] = (v || '').split('.')
  return f ? `${i}.${f.slice(0, max)}` : i
}
const fmtU = (v?: bigint, dec = 18, dp = 4) => {
  if (v == null) return '—'
  const s = formatUnits(v, dec)
  const n = Number(s)
  if (!Number.isFinite(n)) return s
  return n.toLocaleString(undefined, { maximumFractionDigits: dp })
}






function Donut({ sold, cap }: { sold: number; cap: number }) {
  const total = Math.max(cap, 0)
  const value = Math.min(sold, total)
  const r = 42
  const c = 2 * Math.PI * r
  const soldPct = pct(value, total)
  const soldLen = (soldPct / 100) * c


  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#27272a" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="#22d3ee" strokeWidth="10"
          strokeDasharray={`${soldLen} ${c - soldLen}`} strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="text-sm">
        <div className="text-lg font-medium">
          {sold.toLocaleString()} / {total.toLocaleString()}
        </div>
        <div className="opacity-70">Sold / Available (tokens)</div>
        <div className="opacity-70">{Math.round(soldPct)}% sold</div>
      </div>
    </div>
  )
}

function TierBars({
  tiers = [
    { name: 'Tier 1', price: '—', sold: 0, total: 0 },
    { name: 'Tier 2', price: '—', sold: 0, total: 0 },
    { name: 'Tier 3', price: '—', sold: 0, total: 0 },
    { name: 'Tier 4', price: '—', sold: 0, total: 0 },
  ],
}: {
  tiers?: Array<{ name: string; price: string; sold: number; total: number }>
}) {
  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
      {tiers.map((t) => {
        const p = pct(t.sold, t.total)
        return (
          <div key={t.name} className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="opacity-90">{t.name}</span>
              <span className="opacity-60">Price: {t.price}</span>
            </div>
            <div className="h-3 rounded bg-zinc-800 overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${p}%` }} />
            </div>
            <div className="mt-1 opacity-70">
              {t.sold.toLocaleString()} / {t.total.toLocaleString()} sold
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PresaleDashboard({
  soldTokens,
  capTokens,
  currentTierPrice = '—',
}: {
  soldTokens: number
  capTokens: number
  currentTierPrice?: string
}) {
  // TODO: replace these placeholders with real per-tier numbers when the contract exposes them
  const tiers = [
    { name: 'Tier 1', price: '0.01', sold: Math.round(soldTokens * 0.40), total: Math.round(capTokens * 0.25) },
    { name: 'Tier 2', price: '0.012', sold: Math.round(soldTokens * 0.30), total: Math.round(capTokens * 0.25) },
    { name: 'Tier 3', price: '0.015', sold: Math.round(soldTokens * 0.20), total: Math.round(capTokens * 0.25) },
    { name: 'Tier 4', price: '0.02', sold: Math.round(soldTokens * 0.10), total: Math.round(capTokens * 0.25) },
  ]

  return (
    <section className="space-y-4">
      <div className="text-sm opacity-70">Presale Dashboard</div>
      <Donut sold={soldTokens} cap={capTokens} />
      <TierBars tiers={tiers} />
    </section>
  )
}


function Dashboard() {
  // --- Placeholder data; wire these up to your reads later ---
  const totalSold = 0;         // number of tokens sold (total)
  const totalCap  = 0;         // total tokens available (total)
  const pct = totalCap > 0 ? Math.min(100, Math.round((totalSold / totalCap) * 100)) : 0;

  const tiers = [
    { name: 'Tier 1', price: 0.01, sold: 0, cap: 0 },
    { name: 'Tier 2', price: 0.012, sold: 0, cap: 0 },
    { name: 'Tier 3', price: 0.015, sold: 0, cap: 0 },
    { name: 'Tier 4', price: 0.02, sold: 0, cap: 0 },
  ];

  // donut geometry (helpers)
const R = 54;
const C = 2 * Math.PI * R;

const GAP_PX = 2;            // thin black separator between arcs (px along the path)
const MIN_SOLD_PCT = 3;      // minimum green % so "0%" still shows a sliver
const soldPct = pct;         // you already compute `pct` above

const soldLen = Math.max((MIN_SOLD_PCT / 100) * C, (soldPct / 100) * C);
const remainingLen = Math.max(0, C - soldLen - 2 * GAP_PX);



return (
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* LEFT: Donut + metrics */}
<div className="flex flex-col items-center">
  {/* Donut container: size derived from R and stroke width */}
  {(() => {
    const STROKE = 12;
    const SIZE = 2 * (R + STROKE / 2); // same as your SVG view size
    return (
      <div
        className="relative"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* Donut SVG fills the container */}
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90 absolute inset-0"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
          />
          {/* SOLD (green) */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={GREEN}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={`${soldLen} ${C - soldLen}`}
          />
          {/* REMAINING (cyan) */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={CYAN}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={`${Math.max(1, remainingLen)} ${C}`}
            strokeDashoffset={-(soldLen + 1)}  // 1px gap after green
          />
        </svg>

        {/* KEEP your existing % text, now perfectly centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-base font-normal">{pct}%</div>
          <div className="text-xs opacity-70">sold</div>
        </div>
      </div>
    );
  })()}

  {/* Metrics under donut */}
  <div className="mt-3 w-full max-w-xs text-sm leading-tight space-y-0.5">
    <div className="flex justify-between">
      <span className="opacity-70">Total available</span>
      <span>{totalCap.toLocaleString()}</span>
    </div>
  </div>
</div>

        {/* RIGHT: Tiers list */}
        <div className="space-y-3">
          {tiers.map((t, i) => {
            const progress = t.cap > 0 ? Math.min(100, (t.sold / t.cap) * 100) : 0;
            return (
              <div key={i} className="">
  {/* header row: Tier + sold inline, price on right */}
  <div className="flex items-center justify-between text-xs">
    <div className="flex items-baseline gap-1">
      <span className="font-normal">{t.name}</span>
      <span className="opacity-70">{t.sold.toLocaleString()} / {t.cap.toLocaleString()} sold</span>
    </div>
    <div className="opacity-70">Price: {t.price}</div>
  </div>

  {/* thin progress bar */}
  {/* split progress: green (sold) | black gap | cyan (remaining) */}
<div className="mt-0">
   <div className="">
  {/* a 1px black separator between the two segments */}
  <div className="bg-black p-px">
    <div className="flex gap-px" style={{ height: BAR_H }}>
      {/* SOLD (green) */}
      <div
        style={{
          width: `${Math.max(MIN_SOLD_PCT, progress)}%`,
          background: GREEN,
          // square edges
          borderRadius: 0,
        }}
      />
      {/* REMAINING (cyan) */}
      <div
        style={{
          width: `${Math.max(0, 100 - Math.max(MIN_SOLD_PCT, progress))}%`,
          background: CYAN,
          borderRadius: 0,
        }}
      />
    </div>
    </div>
  </div>
</div>
</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



export default function Presale() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const [ethAmt, setEthAmt] = useState('0.05')
  const [usdcAmt, setUsdcAmt] = useState('100')
  const [eurcAmt, setEurcAmt] = useState('');
  const eurcReady = !!EURC; // true when the env var is set

  const [fiatAmt, setFiatAmt] = useState('100')

function handleFiatBuy() {
  // TODO: swap this for your MoonPay/Transak/Ramp widget open
  // e.g. open a modal or route to /fiat?amount=fiatAmt
  alert(`Opening fiat checkout for ${fiatAmt}…`)
}

  // Reads
  const { data: price } = useReadContract({
    address: PRESALE, abi: presaleAbi, functionName: 'getPricePerToken',
    query: { enabled: Boolean(PRESALE) }
  })
  const { data: status } = useReadContract({
    address: PRESALE, abi: presaleAbi, functionName: 'getPresaleStatus',
    query: { enabled: Boolean(PRESALE) }
  }) as { data: any }

  const saleActive = Array.isArray(status) ? Boolean(status[0]) : undefined
  const phaseCap   = Array.isArray(status) ? status[1] : undefined
  const phaseSold  = Array.isArray(status) ? status[2] : undefined

  // Writes
  const { writeContract: writeETH,   data: hEth,   isPending: pEth } = useWriteContract()
  const { writeContract: writeAppr,  data: hAppr,  isPending: pAppr } = useWriteContract()
  const { writeContract: writeUSDC,  data: hUsdc,  isPending: pUsdc } = useWriteContract()

  const { isLoading: mEth,  isSuccess: sEth  } = useWaitForTransactionReceipt({ hash: hEth })
  const { isLoading: mAppr, isSuccess: sAppr } = useWaitForTransactionReceipt({ hash: hAppr })
  const { isLoading: mUsdc, isSuccess: sUsdc } = useWaitForTransactionReceipt({ hash: hUsdc })

  const wrongNet = isConnected && chainId !== TARGET



  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-xl px-5 py-8 space-y-6">
        {/* Header (vertical/mobile-first) */}
        <header className="space-y-4">
          {/* Top: logo + tagline */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-start gap-1">
              {/* Uses public/header-logo.png */}
              <img src="/header-logo.png" alt="MAQX" className="h-12 w-auto" />
              <p className="text-xs opacity-60">Your Secure, Memoryless Digital Cash.</p>
            </div>
          </div>

          <div className="flex justify-between items-end w-full">
            {/* Left: Presale title */}
            <h1 className="text-xl font-semibold">MAQX Presale</h1>

            {/* Right: connect/disconnect */}
            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="opacity-70 text-sm truncate">{short(address)}</span>
                <button
                  onClick={() => disconnect()}
                  className="w-44 px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-end">
                <GenerateWalletBlock />
                {connectors.map((c) => (
                  <button
                    key={c.uid}
                    onClick={() => connect({ connector: c })}
                    className="w-44 px-3 py-1.5 rounded bg-white text-black text-sm"
                  >
                    Connect {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Network guard */}
        {wrongNet && (
          <div className="rounded-xl border border-yellow-600/50 bg-yellow-900/20 p-3 text-sm">
            Wrong network. Switch to {TARGET === 1 ? 'Ethereum Mainnet' : 'Sepolia'}.
            <button
              className="ml-3 underline"
              onClick={() =>
                switchChain({ chainId: TARGET === 1 ? mainnet.id : sepolia.id })
              }
            >
              Switch
            </button>
          </div>
        )}

        {/* Sale info */}
        <div className="rounded-2xl p-3 bg-zinc-900/70 border border-zinc-800 text-sm">
          <div>Active: {saleActive === undefined ? '—' : saleActive ? 'Yes' : 'No'}</div>
          <div>Price (raw): {price ? String(price) : '—'}</div>
          <div>Phase cap: {fmtU(phaseCap, 18, 0)}</div>
          <div>Phase sold: {fmtU(phaseSold, 18, 0)}</div>
        </div>


        {/* NEW: Presale Dashboard */}
        <Dashboard />

        {/* Buy with Card / Bank / Apple Pay */}
<section className="rounded-2xl p-3 bg-zinc-900/70 border border-zinc-800">
  <div className="flex items-center justify-between text-sm mb-2 opacity-80">
    <span>Buy with Card / Bank / Apple Pay</span>
    <span className="text-[11px] opacity-60">Min usually ~{MIN_FIAT} (varies by provider/region)</span>
  </div>

  <div className="flex gap-3">
    <input
      value={fiatAmt}
      onChange={(e) => setFiatAmt(e.target.value)}
      inputMode="decimal"
      placeholder="Amount (e.g., 100)"
      className="w-full rounded-xl px-4 py-1 bg-black border border-zinc-700 outline-none"
    />
    <button
      onClick={handleFiatBuy}
      className="px-4 py-1 rounded-xl text-black font-medium hover:opacity-90 active:opacity-100"
      style={{ backgroundColor: '#d7df23' }}
      title="Pay with card/bank; no crypto required"
    >
      Continue
    </button>
  </div>

  <p className="mt-2 text-xs opacity-70">
    No crypto needed. Generate a wallet, Buy here, and receive MAQX in your wallet
  </p>
</section>

        {/* Buy with ETH */}
        <div className="rounded-2xl p-2 bg-zinc-900/70 border border-zinc-800">
  <div className="flex items-center justify-between text-sm mb-1 opacity-80">
    <span>Buy with ETH</span>
    <span className="text-[11px] opacity-60">Min: {MIN_ETH} ETH</span>
  </div>

  <div className="flex gap-3">
            <input
  value={ethAmt}
  onChange={(e) => setEthAmt(clampDecimals(e.target.value, 6))}
  inputMode="decimal"
  className="w-full rounded-xl px-4 py-1 bg-black border border-zinc-700 outline-none"
/>

            <button
  onClick={() =>
    writeETH({
      address: PRESALE,
      abi: presaleAbi,
      functionName: 'buyWithETH',
      value: parseEther(ethAmt || '0'),
    })
  }
  disabled={
    !isConnected || wrongNet || pEth || mEth || saleActive === false ||
    !isPositiveNumber(ethAmt) || !gte(ethAmt, MIN_ETH, 18)
  }
  className="px-5 py-1 rounded-xl text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed"
  style={{ backgroundColor: "#d7df23" }}
>
  {pEth || mEth ? 'Processing…' : 'Buy'}
</button>
  
          </div>
          {sEth && <p className="mt-2 text-green-400 text-xs">ETH purchase confirmed ✅</p>}
        </div>

        {/* Buy with USDC */}
<div className="rounded-2xl p-2 bg-zinc-900/70 border border-zinc-800">
  {/* header with right-aligned min hint (same pattern as ETH) */}
  <div className="flex items-center justify-between text-sm mb-1 opacity-80">
    <span>Buy with USDC</span>
    <span className="text-[11px] opacity-60">Min: {MIN_USDC} USDC</span>
  </div>

  <div className="flex gap-3 mb-1">
    <input
      value={usdcAmt}
      onChange={(e) => setUsdcAmt(clampDecimals(e.target.value, 2))}
      inputMode="decimal"
      className="w-full rounded-xl px-4 py-1 bg-black border border-zinc-700 outline-none"
    />

    <button
      onClick={() =>
        writeAppr({
          address: USDC,
          abi: erc20Abi,
          functionName: 'approve',
          args: [PRESALE, parseUnits(usdcAmt || '0', 6)],
        })
      }
      disabled={
        !isConnected || wrongNet || pAppr || mAppr || saleActive === false ||
        !isPositiveNumber(usdcAmt) || !gte(usdcAmt, MIN_USDC, 6)
      }
      className="px-4 py-1 rounded-xl bg-zinc-200 text-black disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pAppr || mAppr ? 'Approving…' : 'Approve'}
    </button>

    <button
      onClick={() =>
        writeUSDC({
          address: PRESALE,
          abi: presaleAbi,
          functionName: 'buyWithUSDC',
          args: [parseUnits(usdcAmt || '0', 6)],
        })
      }
      disabled={
        !isConnected || wrongNet || pUsdc || mUsdc || saleActive === false ||
        !isPositiveNumber(usdcAmt) || !gte(usdcAmt, MIN_USDC, 6)
      }
      className="px-4 py-1 rounded-xl text-black disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: "#d7df23" }}
    >
      {pUsdc || mUsdc ? 'Buying…' : 'Buy'}
    </button>
  </div>

  {(sAppr || sUsdc) && <p className="text-green-400 text-xs">USDC step done ✅</p>}
</div>



        {/* Buy with EURC – always visible */}
<div className="rounded-2xl p-2 bg-zinc-900/70 border border-zinc-800">
  <div className="flex items-center justify-between text-sm mb-1 opacity-80">
    <span>Buy with EURC</span>
    <span className="text-[11px] opacity-60">Min: {MIN_EURC} EURC</span>
  </div>

  <div className="flex gap-3 mb-1">
    <input
      value={eurcAmt}
      onChange={(e) => setEurcAmt(clampDecimals(e.target.value, 2))}
      inputMode="decimal"
      className="w-full rounded-xl px-4 py-1 bg-black border border-zinc-700 outline-none"
      placeholder={eurcReady ? '' : 'EURC coming soon'}
      disabled={!eurcReady}
    />

    <button
      onClick={() =>
        writeAppr({
          address: EURC as `0x${string}`,
          abi: erc20Abi,
          functionName: 'approve',
          args: [PRESALE, parseUnits(eurcAmt || '0', 6)],
        })
      }
      disabled={
        !eurcReady ||
        !isConnected || wrongNet || pAppr || mAppr || saleActive === false ||
        !isPositiveNumber(eurcAmt) || !gte(eurcAmt, MIN_EURC, 6)
      }
      className="px-4 py-1 rounded-xl bg-zinc-200 text-black disabled:opacity-50 disabled:cursor-not-allowed"
      title={eurcReady ? '' : 'Will be enabled once EURC address is live'}
    >
      {pAppr || mAppr ? 'Approving…' : 'Approve'}
    </button>

    <button
      onClick={() =>
        writeUSDC({
          address: PRESALE,
          abi: presaleAbi,
          functionName: 'buyWithEURC', // update when live
          args: [parseUnits(eurcAmt || '0', 6)],
        })
      }
      disabled={
        !eurcReady ||
        !isConnected || wrongNet || pUsdc || mUsdc || saleActive === false ||
        !isPositiveNumber(eurcAmt) || !gte(eurcAmt, MIN_EURC, 6)
      }
      className="px-4 py-1 rounded-xl text-black disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: '#d7df23' }}
      title={eurcReady ? '' : 'Will be enabled once EURC address is live'}
    >
      {pUsdc || mUsdc ? 'Buying…' : 'Buy'}
    </button>
  </div>
</div>

        





        {/* Presale Guidelines (accordion) */}
        <Guidelines />

        <Faq />

        <p className="text-[11px] text-zinc-500">
          By proceeding you agree to the Terms &amp; Risk Notice.
        </p>
        {/* Footer */}
        <footer className="mt-12 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500 space-y-3">
          <div className="flex justify-center items-center gap-2">
            <img src="/header-logo.png" alt="MAQX" className="h-6 w-auto" />
          </div>
          <p>© 2025 MAQX LABS Ltd. No tracking. No memory.</p>
        </footer>
      </div>
    </main>
  )
}