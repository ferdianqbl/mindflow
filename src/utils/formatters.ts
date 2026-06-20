import { WorkCategory } from "@/components/journal-modal";

interface FocusLogItem {
  id: string;
  category: string;
  description: string;
  durationMinutes: number;
  createdAt: string | Date;
}

export const CATEGORY_EMOJIS: Record<WorkCategory, string> = {
  coding: "💻",
  debugging: "🐛",
  design: "🎨",
  learning: "📚",
  meeting: "🤝",
  operations: "⚙️",
};

export const CATEGORY_LABELS: Record<WorkCategory, string> = {
  coding: "Coding & Implementation",
  debugging: "Debugging & Problem Solving",
  design: "UI/UX & Design",
  learning: "Research & Learning",
  meeting: "Meetings & Syncs",
  operations: "Operations & Admin Tasks",
};

// Formatter 1: Slack / Discord format - Grouped by Category with emojis
export function formatToSlack(logs: FocusLogItem[]): string {
  if (logs.length === 0) return "No accomplishments logged for today.";

  const grouped: Record<string, string[]> = {};
  logs.forEach((log) => {
    const cat = log.category.toLowerCase() as WorkCategory;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(log.description);
  });

  let output = "*📢 Daily Standup Report*\n\n";
  
  Object.keys(grouped).forEach((catKey) => {
    const cat = catKey as WorkCategory;
    const emoji = CATEGORY_EMOJIS[cat] || "📝";
    const label = CATEGORY_LABELS[cat] || cat;
    
    output += `${emoji} *${label}*:\n`;
    grouped[catKey].forEach((desc) => {
      output += `  • ${desc}\n`;
    });
    output += "\n";
  });

  return output.trim();
}

// Formatter 2: Yesterday-Today-Blocker (YTB) format
export function formatToYTB(logs: FocusLogItem[]): string {
  let accomplished = "";
  if (logs.length === 0) {
    accomplished = "- Plan focus sessions and prepare tasks";
  } else {
    logs.forEach((log) => {
      const cat = log.category.toLowerCase() as WorkCategory;
      const emoji = CATEGORY_EMOJIS[cat] || "•";
      accomplished += `${emoji} ${log.description}\n`;
    });
  }

  return `*📅 Yesterday / Today's Accomplishments:*
${accomplished.trim()}

*🔮 Plans for Tomorrow:*
- Continue focused sprints and implement core features

*⚠️ Blockers:*
- None`.trim();
}

// Formatter 3: Bullet Journal (Markdown format)
export function formatToMarkdown(logs: FocusLogItem[]): string {
  if (logs.length === 0) return "* No accomplishments logged today.";

  return logs
    .map((log) => {
      const cat = log.category.toLowerCase() as WorkCategory;
      const emoji = CATEGORY_EMOJIS[cat] || "•";
      const timestamp = new Date(log.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `- [${timestamp}] ${emoji} **${log.category}**: ${log.description}`;
    })
    .join("\n");
}
