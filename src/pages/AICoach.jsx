import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatGHS } from '../utils/finance';

const SUGGESTIONS = [
  "Am I on track this month?",
  "How can I save more money?",
  "What's my biggest spending area?",
  "How do I reduce MoMo fees?",
  "Help me plan for next month",
  "Should I buy this item?",
];

export default function AICoach() {
  const { household, getTotalIncome, getFixedBillsTotal, getSavingsTarget, getPocketMoney, getVariableSpent, getCurrentMonthExpenses } = useApp();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Ei ${household?.name || 'boss'}! 👋 I'm your MePesewa financial coach. I know your budget, your spending, and your goals. Ask me anything — I'll keep it real with you. 💪` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    const income = getTotalIncome();
    const bills = getFixedBillsTotal();
    const savings = getSavingsTarget();
    const pocket = getPocketMoney();
    const spent = getVariableSpent();
    const pocketLeft = Math.max(0, pocket - spent);
    const expenses = getCurrentMonthExpenses();
    const now = new Date();
    const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

    return `You are MePesewa, a warm and practical Ghanaian personal finance coach app. You speak like a knowledgeable friend — supportive, direct, occasionally using Ghanaian expressions like "Ei!", "Chale", "Boss". You know the user's full financial picture.

USER PROFILE:
- Name: ${household?.name || 'User'}
- Household mode: ${household?.mode || 'single'}${household?.mode === 'couple' ? ` (partner: ${household.partnerName})` : ''}
- Monthly income: GHS ${income.toFixed(2)}

MONTHLY BUDGET:
- Fixed bills (rent, water, light, groceries): GHS ${bills.toFixed(2)}
- Savings target: GHS ${savings.toFixed(2)}
- Pocket money (discretionary): GHS ${pocket.toFixed(2)}

CURRENT STATUS (this month):
- Variable spent so far: GHS ${spent.toFixed(2)}
- Pocket money remaining: GHS ${pocketLeft.toFixed(2)}
- Days left in month: ${daysLeft}
- Daily budget: GHS ${pocket > 0 ? (pocket / 30).toFixed(2) : '0.00'}
- Daily actual spend: GHS ${expenses.length > 0 ? (spent / Math.max(1, 30 - daysLeft)).toFixed(2) : '0.00'}

RECENT EXPENSES (last 10):
${expenses.slice(0, 10).map(e => `- ${e.note || e.category}: GHS ${e.amount.toFixed(2)}`).join('\n') || 'No expenses yet this month.'}

Give specific, actionable advice based on the real numbers. Keep responses concise (2-4 sentences usually). Use ₵ symbol for Ghana cedis. Be encouraging but honest.`;
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const apiMessages = newMessages
        .filter(m => m.role !== 'assistant' || newMessages.indexOf(m) > 0)
        .map(m => ({ role: m.role, content: m.content }));

      // Calls our Netlify Function instead of Anthropic directly —
      // this keeps the API key on the server, never in the browser.
      const endpoint = import.meta.env.DEV
        ? 'http://localhost:8888/api/chat'  // netlify dev proxies functions here
        : '/api/chat';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: buildContext(),
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const reply = data.content?.[0]?.text || 'Sorry, I couldn\'t respond. Try again!';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `😔 Connection issue: ${err.message}. Make sure you're running "netlify dev" (not "npm run dev") so the AI function works locally.` }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text1)', fontSize: 16 }}>MePesewa Coach</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--green)' }}>● Online · Knows your full budget</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>🤖</div>
            )}
            <div style={{
              maxWidth: '78%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'var(--green)' : 'var(--card)',
              color: msg.role === 'user' ? '#fff' : 'var(--text1)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: 14, lineHeight: 1.6,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
            <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--green)', opacity: 0.6, animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} style={{
                whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 99,
                border: '1.5px solid var(--green)', background: 'var(--green-soft)',
                color: 'var(--green)', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0,
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px 80px', borderTop: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask your coach anything..." disabled={loading}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text1)', fontSize: 14, outline: 'none', resize: 'none' }} />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--green)', border: 'none',
            color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0,
          }}>➤</button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.3);opacity:1} }`}</style>
    </div>
  );
}
