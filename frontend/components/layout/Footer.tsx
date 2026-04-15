export default function Footer() {
  return (
    <footer className="max-w-[1200px] mx-auto px-8 mt-16 pt-6 pb-8 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[10px] text-text-tertiary uppercase tracking-widest">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Settlement powered by</span>
          <span className="font-bold text-accent-teal">HSP</span>
          <span className="text-text-tertiary">·</span>
          <span className="normal-case tracking-normal text-[11px] text-text-secondary">
            HashKey Settlement Protocol
          </span>
        </div>
        <span className="normal-case tracking-normal text-[10px] text-text-tertiary">
          Merchant API · x402
        </span>
      </div>
    </footer>
  );
}
