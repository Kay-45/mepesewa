// Official MoMo fee structures (GHS)
// Source: NCA published tariffs

export const MOMO_FEES = {
  mtn: {
    name: 'MTN MoMo',
    color: '#FFD700',
    textColor: '#1a1a00',
    bands: [
      { min: 1, max: 50, fee: 0.50 },
      { min: 51, max: 100, fee: 1.00 },
      { min: 101, max: 250, fee: 1.75 },
      { min: 251, max: 500, fee: 3.00 },
      { min: 501, max: 1000, fee: 5.00 },
      { min: 1001, max: 2000, fee: 9.00 },
      { min: 2001, max: 5000, fee: 15.00 },
      { min: 5001, max: 10000, fee: 25.00 },
    ]
  },
  telecel: {
    name: 'Telecel Cash',
    color: '#FF0000',
    textColor: '#fff',
    bands: [
      { min: 1, max: 50, fee: 0.50 },
      { min: 51, max: 100, fee: 1.00 },
      { min: 101, max: 250, fee: 2.00 },
      { min: 251, max: 500, fee: 3.50 },
      { min: 501, max: 1000, fee: 5.50 },
      { min: 1001, max: 2000, fee: 9.50 },
      { min: 2001, max: 5000, fee: 16.00 },
      { min: 5001, max: 10000, fee: 26.00 },
    ]
  },
  airteltigo: {
    name: 'AirtelTigo Money',
    color: '#003399',
    textColor: '#fff',
    bands: [
      { min: 1, max: 50, fee: 0.50 },
      { min: 51, max: 100, fee: 1.00 },
      { min: 101, max: 250, fee: 1.75 },
      { min: 251, max: 500, fee: 3.00 },
      { min: 501, max: 1000, fee: 5.00 },
      { min: 1001, max: 2000, fee: 9.00 },
      { min: 2001, max: 5000, fee: 15.00 },
      { min: 5001, max: 10000, fee: 25.00 },
    ]
  }
};

export function getMoMoFee(network, amount) {
  const net = MOMO_FEES[network];
  if (!net) return 0;
  const band = net.bands.find(b => amount >= b.min && amount <= b.max);
  return band ? band.fee : 0;
}

export function formatGHS(amount) {
  return `₵ ${Number(amount).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & drinks', icon: '🍛', color: '#1d9e75' },
  { id: 'transport', label: 'Transport', icon: '🚐', color: '#378ADD' },
  { id: 'data', label: 'Data & airtime', icon: '📡', color: '#9F7AEA' },
  { id: 'momo', label: 'MoMo transfer', icon: '📲', color: '#EF9F27' },
  { id: 'groceries', label: 'Groceries', icon: '🛒', color: '#63B3ED' },
  { id: 'rent', label: 'Rent', icon: '🏠', color: '#FC8181' },
  { id: 'electricity', label: 'Light bill (ECG)', icon: '💡', color: '#F6E05E' },
  { id: 'water', label: 'Water bill (GWCL)', icon: '🚿', color: '#76E4F7' },
  { id: 'church', label: 'Church / Tithe', icon: '⛪', color: '#B794F4' },
  { id: 'clothing', label: 'Clothing', icon: '👕', color: '#F687B3' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#68D391' },
  { id: 'health', label: 'Health / Pharmacy', icon: '💊', color: '#FC8181' },
  { id: 'savings', label: 'Savings / Susu', icon: '🏦', color: '#48BB78' },
  { id: 'education', label: 'Education', icon: '📚', color: '#667EEA' },
  { id: 'family', label: 'Family support', icon: '👨‍👩‍👧', color: '#F6AD55' },
  { id: 'other', label: 'Other', icon: '💰', color: '#A0AEC0' },
];

export function getDaysLeftInMonth() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

export function getDaysInMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}
