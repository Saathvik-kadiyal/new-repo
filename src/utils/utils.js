export function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `
    M ${start.x} ${start.y}
    A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}
  `;
}


const baseColors = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ec4899", "#f43f5e", "#22c55e",
  "#0ea5e9", "#eab308",
];

export function getColor(index) {
  const base = baseColors[index % baseColors.length];
  const shadeOffset = Math.floor(index / baseColors.length) * 10;
  return shadeColor(base, shadeOffset);
}

export function shadeColor(color, percent) {
  const num = parseInt(color.slice(1),16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = (num >> 8 & 0x00FF) + amt,
    B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R<255?R<1?0:R:255)*0x10000 +
    (G<255?G<1?0:G:255)*0x100 +
    (B<255?B<1?0:B:255)
  ).toString(16).slice(1)}`;
}


export function formatRupees(amount) {
  if (amount == null || isNaN(amount)) return "₹0";

  const abs = Math.abs(amount);

  if (abs >= 1_00_00_000) {
    return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`;
  }

  if (abs >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(2)} L`;
  }

  if (abs >= 1_000) {
    return `₹${(amount / 1_000).toFixed(2)} K`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}



export function formatRupeesWithUnit(amount, unit = "auto") {
  if (amount == null || isNaN(amount)) return "₹0";

  const units = {
    K: 1_000,
    L: 1_00_000,
    Cr: 1_00_00_000,
  };

  if (unit === "auto") return formatRupees(amount);

  const divisor = units[unit];
  if (!divisor) return `₹${amount}`;

  return `₹${(amount / divisor).toFixed(2)} ${unit}`;
}

