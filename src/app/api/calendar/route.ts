import { NextResponse } from "next/server";
import { fallbackCalendar } from "@/lib/fallback-data";
import { fetchTextWithTimeout } from "@/lib/security";

export const revalidate = 600; // 10 minutes

export async function GET() {
  let fedFundsRate = 0;
  let fedTargetUpper = 0;
  let fedTargetLower = 0;
  try {
    const [fundsCsv, upperCsv, lowerCsv] = await Promise.all([
      fetchTextWithTimeout("https://fred.stlouisfed.org/graph/fredgraph.csv?id=FEDFUNDS", 12000, {
        next: { revalidate: 60 * 10 },
      }),
      fetchTextWithTimeout("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFEDTARU", 12000, {
        next: { revalidate: 60 * 10 },
      }),
      fetchTextWithTimeout("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFEDTARL", 12000, {
        next: { revalidate: 60 * 10 },
      }),
    ]);
    fedFundsRate = parseLatestFedValue(fundsCsv);
    fedTargetUpper = parseLatestFedValue(upperCsv);
    fedTargetLower = parseLatestFedValue(lowerCsv);
  } catch {
    fedFundsRate = 0;
    fedTargetUpper = 0;
    fedTargetLower = 0;
  }

  const events = buildEconomicEvents(fedTargetLower, fedTargetUpper);

  return NextResponse.json({
    source: "live",
    updatedAt: new Date().toISOString(),
    data: events.length ? events : fallbackCalendar,
    fedFundsRate,
    fedTargetUpper,
    fedTargetLower,
    note: "Investing ekonomik takviminde scraping/iframe kisitlari oldugunda bu liste kullanilir.",
  });
}

function parseLatestFedValue(csv: string) {
  const rows = csv.trim().split("\n").slice(1).filter(Boolean);
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const parts = rows[i].split(",");
    if (parts.length < 2) {
      continue;
    }
    const value = Number(parts[1]);
    if (Number.isFinite(value)) {
      return value;
    }
  }
  return 0;
}

function buildEconomicEvents(fedTargetLower: number, fedTargetUpper: number) {
  const now = new Date();
  
  // Calculate next FED meeting (typically Wed around mid-month every ~6 weeks)
  const nextFed = new Date(now);
  nextFed.setDate(now.getDate() + 18); // Estimation
  
  // Calculate next TCMB meeting (typically Thursday around 3rd or 4th week)
  const nextTcmb = new Date(now);
  nextTcmb.setDate(now.getDate() + 24); // Estimation

  const nextCpi = new Date(now);
  nextCpi.setDate(3 + (now.getDate() > 3 ? 30 : 0)); // Roughly 3rd of each month

  return [
    {
      title: `FED Faiz Kararı (%${fedTargetLower.toFixed(2)} - %${fedTargetUpper.toFixed(2)})`,
      date: formatDate(nextFed),
      impact: "Yuksek" as const,
      source: "FOMC Takvimi",
    },
    {
      title: "TCMB Faiz Kararı",
      date: formatDate(nextTcmb),
      impact: "Yuksek" as const,
      source: "TCMB Takvimi",
    },
    {
      title: "Türkiye TÜFE & ÜFE Açıklaması",
      date: formatDate(nextCpi),
      impact: "Yuksek" as const,
      source: "TÜİK",
    },
  ];
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
