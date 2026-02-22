/**
 * Kolory wykresów — gender tylko w kontekście danych płci, status semantyczny.
 * Używaj w Recharts: fill={CHART_COLORS.women}, stroke={CHART_COLORS.men} itd.
 */
export const CHART_COLORS = {
  women: "#D4789C", // ZAWSZE — Kobiety
  men: "#6B9FD4", // ZAWSZE — Mężczyźni
  total: "#9AA0BB", // Łącznie / neutral
  correct: "#5BAD7F",
  action: "#C4934A",
  review: "#7B6FAF",
  alert: "#C45A5A",
} as const;
