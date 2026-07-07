// ── MoMo fee calculator ──────────────────────────────────────────
// Source: NCA Ghana published tariff schedules
// Fees are charged on the SENDER based on amount bands

export const MOMO_NETWORKS = {
  mtn: {
    name: 'MTN MoMo',
    color: '#FFD700',
    textColor: '#5a4000',
    bands: [
      { min: 1,     max: 50,    fee: 0.50  },
      { min: 51,    max: 100,   fee: 1.00  },
      { min: 101,   max: 250,   fee: 1.75  },
      { min: 251,   max: 500,   fee: 3.00  },
      { min: 501,   max: 1000,  fee: 5.00  },
      { min: 1001,  max: 2000,  fee: 9.00  },
      { min: 2001,  max: 5000,  fee: 15.00 },
      { min: 5001,  max: 10000, fee: 25.00 },
    ],
  },
  telecel: {
    name: 'Telecel Cash',
    color: '#e60000',
    textColor: '#fff',
    bands: [
      { min: 1,     max: 50,    fee: 0.50  },
      { min: 51,    max: 100,   fee: 1.00  },
      { min: 101,   max: 250,   fee: 2.00  },
      { min: 251,   max: 500,   fee: 3.50  },
      { min: 501,   max: 1000,  fee: 5.50  },
      { min: 1001,  max: 2000,  fee: 9.50  },
      { min: 2001,  max: 5000,  fee: 16.00 },
      { min: 5001,  max: 10000, fee: 26.00 },
    ],
  },
  airteltigo: {
    name: 'AirtelTigo Money',
    color: '#003399',
    textColor: '#fff',
    bands: [
      { min: 1,     max: 50,    fee: 0.50  },
      { min: 51,    max: 100,   fee: 1.00  },
      { min: 101,   max: 250,   fee: 1.75  },
      { min: 251,   max: 500,   fee: 3.00  },
      { min: 501,   max: 1000,  fee: 5.00  },
      { min: 1001,  max: 2000,  fee: 9.00  },
      { min: 2001,  max: 5000,  fee: 15.00 },
      { min: 5001,  max: 10000, fee: 25.00 },
    ],
  },
};

export function getMoMoFee(networkKey, amount) {
  const network = MOMO_NETWORKS[networkKey];
  if (!network || !amount || amount <= 0) return 0;
  const band = network.bands.find(b => amount >= b.min && amount <= b.max);
  return band ? band.fee : 0;
}

export function formatGHS(amount) {
  const num = parseFloat(amount) || 0;
  return `₵ ${num.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Expense categories ───────────────────────────────────────────
export const CATEGORIES = [
  { id: 'food',          label: 'Food & drinks',     icon: '🍛', color: '#1d9e75' },
  { id: 'transport',     label: 'Transport',          icon: '🚐', color: '#378ADD' },
  { id: 'data',          label: 'Data & airtime',     icon: '📡', color: '#9F7AEA' },
  { id: 'momo',          label: 'MoMo transfer',      icon: '📲', color: '#EF9F27' },
  { id: 'groceries',     label: 'Groceries',          icon: '🛒', color: '#63B3ED' },
  { id: 'rent',          label: 'Rent',               icon: '🏠', color: '#FC8181' },
  { id: 'electricity',   label: 'Light bill (ECG)',   icon: '💡', color: '#F6E05E' },
  { id: 'water',         label: 'Water (GWCL)',        icon: '🚿', color: '#76E4F7' },
  { id: 'church',        label: 'Church / Tithe',     icon: '⛪', color: '#B794F4' },
  { id: 'clothing',      label: 'Clothing',           icon: '👕', color: '#F687B3' },
  { id: 'entertainment', label: 'Entertainment',      icon: '🎮', color: '#68D391' },
  { id: 'health',        label: 'Health / Pharmacy',  icon: '💊', color: '#FC8181' },
  { id: 'savings',       label: 'Savings / Susu',     icon: '🏦', color: '#48BB78' },
  { id: 'education',     label: 'Education',          icon: '📚', color: '#667EEA' },
  { id: 'family',        label: 'Family support',     icon: '👨‍👩‍👧', color: '#F6AD55' },
  { id: 'other',         label: 'Other',              icon: '💰', color: '#A0AEC0' },
];

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

// ── Smart suggestions engine ─────────────────────────────────────
// Runs locally, no API needed
export function generateSuggestions(expenses, income) {
  const suggestions = [];
  if (!expenses || expenses.length === 0 || !income) return suggestions;

  const now = new Date();
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const spentPct = income > 0 ? (totalSpent / income) * 100 : 0;

  // Group by category
  const byCategory = {};
  monthExpenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = sorted[0];

  // Overall spending alert
  if (spentPct >= 90) {
    suggestions.push({
      type: 'danger',
      icon: '🚨',
      title: 'Almost out of budget!',
      message: `You've spent ${formatGHS(totalSpent)} — ${spentPct.toFixed(0)}% of your ₵${income} income this month.`,
    });
  } else if (spentPct >= 70) {
    suggestions.push({
      type: 'warning',
      icon: '⚠️',
      title: 'Spending is high',
      message: `You've used ${spentPct.toFixed(0)}% of your income. Slow down spending for the rest of the month.`,
    });
  } else if (spentPct < 40) {
    const saved = income - totalSpent;
    suggestions.push({
      type: 'success',
      icon: '🎉',
      title: 'Great pace this month!',
      message: `Only ${spentPct.toFixed(0)}% spent so far. Consider saving ${formatGHS(saved * 0.5)} before month end.`,
    });
  }

  // Top spending category alert
  if (topCat) {
    const cat = getCategoryById(topCat[0]);
    const catPct = income > 0 ? (topCat[1] / income) * 100 : 0;
    if (catPct > 20) {
      suggestions.push({
        type: 'warning',
        icon: cat.icon,
        title: `${cat.label} is your biggest spend`,
        message: `You've spent ${formatGHS(topCat[1])} on ${cat.label} — ${catPct.toFixed(0)}% of your income. Can you reduce this?`,
      });
    }
  }

  // MoMo fees alert
  const momoFees = monthExpenses
    .filter(e => e.category === 'momo' && e.momoFee > 0)
    .reduce((s, e) => s + e.momoFee, 0);
  if (momoFees > 10) {
    suggestions.push({
      type: 'tip',
      icon: '📲',
      title: `MoMo fees costing you ${formatGHS(momoFees)}`,
      message: 'Batch your transfers — send one big amount instead of many small ones to save on fees.',
    });
  }

  // Savings suggestion
  const leftover = income - totalSpent;
  if (leftover > 200 && spentPct < 60) {
    suggestions.push({
      type: 'tip',
      icon: '🏦',
      title: 'Move some money to savings',
      message: `You have ${formatGHS(leftover)} left. Consider saving ${formatGHS(leftover * 0.3)} now before you spend it.`,
    });
  }

  // Food spending tip
  const foodSpend = byCategory['food'] || 0;
  const foodPct = income > 0 ? (foodSpend / income) * 100 : 0;
  if (foodPct > 25) {
    suggestions.push({
      type: 'tip',
      icon: '🍛',
      title: 'Food spend is very high',
      message: `${formatGHS(foodSpend)} on food this month (${foodPct.toFixed(0)}%). Cooking at home twice a week could save ₵50–100.`,
    });
  }

  return suggestions.slice(0, 4); // max 4 suggestions
}

// ── Date helpers ─────────────────────────────────────────────────
export function getDaysLeftInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

export function getCurrentMonthName() {
  return new Date().toLocaleDateString('en-GH', { month: 'long', year: 'numeric' });
}
