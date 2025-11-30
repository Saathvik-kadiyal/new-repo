const COLORS = [
  "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
  "#59a14f", "#edc949", "#af7aa1", "#ff9da7",
  "#9c755f", "#bab0ab", "#1f77b4", "#ff7f0e",
  "#2ca02c", "#d62728", "#9467bd", "#8c564b",
  "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
];

// helper to assign a color to each client
export const getClientColorMap = (clients) => {
  const map = {};
  clients.forEach((c, i) => {
    map[c] = COLORS[i % COLORS.length];
  });
  return map;
};
