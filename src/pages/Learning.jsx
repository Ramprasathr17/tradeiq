import React, { useState } from 'react'

const COURSES = {
  Beginner: [
    {
      icon: '📊', title: 'Options 101: Calls & Puts', duration: '25 min', lessons: 8, progress: 100, tags: ['Basics', 'Essential'],
      content: [
        { title: 'What is an Option?', body: 'An option is a contract that gives you the RIGHT but not the obligation to buy or sell an asset at a specific price before a specific date. You pay a premium to buy this right.' },
        { title: 'Call Option (CE)', body: 'A Call option gives you the right to BUY the underlying asset. You buy a Call when you think the price will GO UP. Example: Buy NIFTY 24600 CE — you profit if NIFTY goes above 24600.' },
        { title: 'Put Option (PE)', body: 'A Put option gives you the right to SELL the underlying asset. You buy a Put when you think the price will GO DOWN. Example: Buy NIFTY 24600 PE — you profit if NIFTY falls below 24600.' },
        { title: 'Premium', body: 'The price you pay to buy an option is called the Premium. It is the maximum loss for a buyer. Example: If NIFTY 24600 CE costs 215 — you pay 215 x lot size as premium.' },
        { title: 'Strike Price', body: 'The price at which you have the right to buy or sell. If NIFTY is at 24615 and you buy 24600 CE — 24600 is your strike price.' },
        { title: 'Expiry Date', body: 'Every option has an expiry date. On that date the option either has value or expires worthless. NIFTY has weekly expiry every Thursday and monthly expiry last Thursday of month.' },
        { title: 'Lot Size', body: 'Options are traded in lots. NIFTY lot size is 75 units. So if NIFTY CE premium is 215 — total cost = 215 x 75 = 16,125 rupees.' },
        { title: 'Buyer vs Seller', body: 'Option Buyer pays premium and has limited loss unlimited profit. Option Seller receives premium and has limited profit but higher risk. Most successful traders are option sellers.' },
      ]
    },
    {
      icon: '🎯', title: 'Understanding Greeks', duration: '40 min', lessons: 4, progress: 65, tags: ['Greeks', 'Must Know'],
      content: [
        { title: 'Delta', body: 'Delta measures how much the option price moves for every 1 rupee move in the underlying. ATM options have delta of 0.5. Deep ITM options have delta near 1. OTM options have delta near 0. Call delta is positive, Put delta is negative.' },
        { title: 'Theta', body: 'Theta is time decay — how much value the option loses every day just by the passage of time. Theta hurts option buyers and helps option sellers. An option with 30 DTE loses value slowly. An option with 5 DTE loses value very fast near expiry.' },
        { title: 'Vega', body: 'Vega measures sensitivity to Implied Volatility. When IV increases option prices increase. When IV decreases option prices decrease. Buying options before earnings (high IV) and selling after is called IV crush — dangerous for buyers.' },
        { title: 'Gamma', body: 'Gamma measures rate of change of Delta. High gamma near ATM strikes especially close to expiry. This is why weekly expiry options move so fast near Thursday. Gamma risk is the biggest risk for option sellers near expiry.' },
      ]
    },
    {
      icon: '📋', title: 'Reading an Options Chain', duration: '20 min', lessons: 3, progress: 30, tags: ['Practical'],
      content: [
        { title: 'What is an Options Chain?', body: 'An options chain shows all available strikes for a given expiry. Left side shows CALL options. Right side shows PUT options. The middle column shows strike prices. ATM strike is highlighted.' },
        { title: 'Open Interest (OI)', body: 'OI shows how many contracts are currently open. High OI at a strike means strong support or resistance. If 24500 PE has very high OI — it means many traders have sold puts there — strong support level.' },
        { title: 'Put Call Ratio', body: 'PCR = Total Put OI divided by Total Call OI. PCR above 1.2 means more puts — bullish market. PCR below 0.7 means more calls — bearish market. PCR near 1 means balanced neutral market.' },
      ]
    },
    {
      icon: '💡', title: 'Intrinsic vs Extrinsic Value', duration: '18 min', lessons: 2, progress: 0, tags: ['Basics'],
      content: [
        { title: 'Intrinsic Value', body: 'Intrinsic value is the real value of an option if exercised right now. For a Call option: Spot Price minus Strike Price (if positive). Example: NIFTY at 24700, Strike 24600 CE — intrinsic value = 100 rupees.' },
        { title: 'Extrinsic Value (Time Value)', body: 'Extrinsic value is everything above intrinsic value. It includes time remaining and implied volatility. An option with 30 days to expiry has more extrinsic value than one with 3 days. Theta eats away extrinsic value every day.' },
      ]
    },
    {
      icon: '⚖️', title: 'Risk Management', duration: '30 min', lessons: 3, progress: 0, tags: ['Risk', 'Essential'],
      content: [
        { title: 'Never Risk More Than 2%', body: 'Professional traders never risk more than 2% of total capital on a single trade. If your account is 5 lakh rupees — maximum loss per trade should be 10,000 rupees. This ensures you survive losing streaks.' },
        { title: 'Position Sizing', body: 'Position sizing determines how many lots to trade. If max loss is 10,000 and one lot of Iron Condor risks 5,000 — trade 2 lots maximum. Always calculate max loss before entering any trade.' },
        { title: 'Stop Loss Rules', body: 'For option buying — exit if option loses 50% of premium paid. For option selling — exit if premium doubles against you. For spreads — exit at 2x the credit received. Never hold through stop loss hoping for recovery.' },
      ]
    },
    {
      icon: '📅', title: 'Expiry Cycles and F&O Basics', duration: '22 min', lessons: 3, progress: 0, tags: ['NSE', 'Basics'],
      content: [
        { title: 'NSE F&O Expiry Cycles', body: 'NIFTY has weekly expiry every Thursday. BANKNIFTY has weekly expiry every Wednesday. Monthly expiry is the last Thursday of each month. The closer to expiry the faster options decay — good for sellers bad for buyers.' },
        { title: 'F&O Products', body: 'MIS — intraday only, auto squares off at 3:20 PM. NRML — carry overnight positions. CNC — for equity delivery only. For options trading always use NRML for overnight and MIS for intraday.' },
        { title: 'Margin Requirements', body: 'Buying options requires only premium amount. Selling options requires full SPAN margin — much higher. Example: Buying NIFTY CE costs 15,000. Selling NIFTY CE requires 1,20,000 margin. Use Zerodha margin calculator to check before trading.' },
      ]
    },
  ],
  Intermediate: [
    {
      icon: '🦋', title: 'Iron Condor Complete Guide', duration: '35 min', lessons: 4, progress: 20, tags: ['Strategy', 'Neutral'],
      content: [
        { title: 'What is Iron Condor?', body: 'Iron Condor is a 4-leg options strategy. You sell an OTM Call and Put, and buy further OTM Call and Put for protection. You profit when the underlying stays in a range until expiry. Maximum profit is the net credit received.' },
        { title: 'Setting Up Iron Condor on NIFTY', body: 'Step 1: Find ATM strike (say 24600). Step 2: Sell 24800 CE and 24400 PE (OTM). Step 3: Buy 25000 CE and 24200 PE (further OTM for protection). Step 4: Collect net credit. Profit zone is between 24400 and 24800.' },
        { title: 'Managing Iron Condor', body: 'Take profit at 50% of max profit — do not be greedy. If one side gets threatened exit that spread immediately. Best time to trade is when IV Rank is above 30 — premiums are fat. Avoid entering near major events like RBI policy or earnings.' },
        { title: 'Iron Condor Greeks', body: 'Delta near zero — direction neutral. Theta positive — time decay works for you. Vega negative — falling IV helps you. Gamma negative — big moves hurt you. Best to enter 20-30 days before expiry and exit at 7 days to avoid gamma risk.' },
      ]
    },
    {
      icon: '🐂', title: 'Bull and Bear Spreads', duration: '30 min', lessons: 4, progress: 0, tags: ['Directional'],
      content: [
        { title: 'Bull Call Spread', body: 'Buy lower strike CE and sell higher strike CE. Example: Buy 24600 CE at 215, Sell 24800 CE at 84. Net debit = 131. Maximum profit = 200 minus 131 = 69 per unit = 5175 per lot. Use when moderately bullish.' },
        { title: 'Bear Put Spread', body: 'Buy higher strike PE and sell lower strike PE. Example: Buy 24600 PE at 198, Sell 24400 PE at 68. Net debit = 130. Maximum profit = 200 minus 130 = 70 per unit = 5250 per lot. Use when moderately bearish.' },
        { title: 'Advantages of Spreads', body: 'Spreads reduce cost compared to buying naked options. They also reduce the impact of IV crush after events. The tradeoff is capped profit. Spreads are ideal for directional trades with defined risk and reward.' },
        { title: 'When to Use Spreads', body: 'Use bull call spread when you expect moderate upside not runaway rally. Use bear put spread when you expect moderate fall not crash. Avoid spreads in very low IV environment as the protection leg costs relatively more.' },
      ]
    },
    {
      icon: '⚡', title: 'IV Rank and Percentile', duration: '45 min', lessons: 3, progress: 0, tags: ['Volatility'],
      content: [
        { title: 'What is IV Rank?', body: 'IV Rank compares current IV to the past 52 weeks range. IV Rank of 80 means current IV is higher than 80% of the past year readings. High IV Rank above 50 means premiums are expensive — good time to SELL options. Low IV Rank below 30 means premiums are cheap — good time to BUY options.' },
        { title: 'IV Crush', body: 'After major events like earnings or RBI policy IV drops sharply. This is called IV Crush. Option buyers get destroyed even if direction is right. Example: Buy call before earnings, stock goes up 3%, but IV drops 40% — option loses value. Sell options before events to benefit from IV crush.' },
        { title: 'India VIX', body: 'India VIX measures expected volatility of NIFTY over next 30 days. VIX above 20 means high fear — option premiums are expensive. VIX below 12 means low fear — cheap premiums. When VIX spikes suddenly market is falling — good time to sell puts for premium after spike settles.' },
      ]
    },
    {
      icon: '📈', title: 'Technical Analysis for Options', duration: '50 min', lessons: 3, progress: 0, tags: ['Charts'],
      content: [
        { title: 'Support and Resistance', body: 'Support is a price level where buying is strong enough to stop the fall. Resistance is where selling is strong enough to stop the rally. In options trading OI data confirms these levels. High Put OI at a strike = strong support. High Call OI at a strike = strong resistance.' },
        { title: 'Using Charts for Strike Selection', body: 'Identify key support and resistance on daily chart. Place Iron Condor strikes just beyond these levels. Example: If 24000 is strong support and 25000 is strong resistance — sell 24200 PE and 24800 CE. Market has to break these levels for you to lose.' },
        { title: 'Trend and Options Strategy', body: 'In uptrend use bull call spreads or sell puts. In downtrend use bear put spreads or sell calls. In sideways market use Iron Condor or short straddle. Never trade directional options against the trend — trade with trend or trade neutral.' },
      ]
    },
    {
      icon: '🌀', title: 'Calendar Spreads', duration: '38 min', lessons: 2, progress: 0, tags: ['Theta'] ,
      content: [
        { title: 'What is Calendar Spread?', body: 'Sell near-term option and buy far-term option at the same strike. Example: Sell NIFTY 24600 CE expiring this Thursday, Buy NIFTY 24600 CE expiring next month. You collect more theta from near-term option. Profit when underlying stays near the strike.' },
        { title: 'Why Calendar Spreads Work', body: 'Near-term options decay faster than far-term options. The difference in decay is your profit. Calendar spreads have low margin requirement and defined risk. Best used when IV is low and you expect IV to rise or underlying to stay flat.' },
      ]
    },
    {
      icon: '🧮', title: 'Position Sizing', duration: '28 min', lessons: 2, progress: 0, tags: ['Risk', 'Math'],
      content: [
        { title: 'Kelly Criterion for Options', body: 'Kelly formula: Position size = (Win rate minus Loss rate divided by Win-Loss ratio). Example: 60% win rate, average win 5000, average loss 3000. Kelly = (0.6 minus 0.4) divided by (5000/3000) = 12%. Trade 12% of capital per trade maximum. In practice use half Kelly for safety.' },
        { title: 'Practical Position Sizing', body: 'Rule 1: Max 5% of capital in any single strategy. Rule 2: Max 20% of capital in options at any time. Rule 3: If down 10% in a month stop trading and review. Rule 4: Increase size only after 3 months of consistent profits. Never average losing option positions.' },
      ]
    },
  ],
  Advanced: [
    {
      icon: '🧠', title: 'Delta Hedging', duration: '55 min', lessons: 2, progress: 0, tags: ['Hedging'],
      content: [
        { title: 'What is Delta Hedging?', body: 'Delta hedging means maintaining a delta-neutral portfolio by offsetting option deltas with the underlying. Example: Short 2 lots of NIFTY 24600 CE (delta 0.5 each = total delta 1.0 short) — buy 1 lot of NIFTY futures to offset. As delta changes you adjust the hedge — this is called dynamic hedging.' },
        { title: 'Gamma Scalping', body: 'When you are long gamma (bought options) you delta hedge frequently and profit from the difference. As market moves up you sell futures. As market moves down you buy futures. The profit from these trades exceeds the theta paid if market moves enough. Used by market makers and professional desks.' },
      ]
    },
    {
      icon: '💹', title: 'Backtesting Strategies', duration: '60 min', lessons: 2, progress: 0, tags: ['Quant'],
      content: [
        { title: 'Why Backtest?', body: 'Backtesting shows how a strategy would have performed in the past. It reveals win rate, average profit, max drawdown, and Sharpe ratio. Never trade a strategy you have not backtested for at least 100 trades. Sensibull and Opstra have good backtesting tools for Indian options.' },
        { title: 'Backtesting Iron Condor on NIFTY', body: 'Entry rules: Enter every Monday, sell strikes 200 points away from ATM, target 50% profit, stop at 2x credit. Results from 2020-2024: Win rate 68%, average monthly return 3.2%, max drawdown 18%. Adjust strikes based on VIX — wider strikes when VIX is high.' },
      ]
    },
    {
      icon: '📡', title: 'Algo Trading with Kite Connect', duration: '90 min', lessons: 3, progress: 0, tags: ['API', 'Code'],
      content: [
        { title: 'Kite Connect API Basics', body: 'Kite Connect lets you automate trading with Python or JavaScript. You can fetch quotes, place orders, get holdings all via API calls. This very app uses Kite Connect to show your portfolio. For algo trading you need to handle login every day and store access token securely.' },
        { title: 'Auto-Trading Iron Condor', body: 'Step 1: Login to Kite and get access token. Step 2: At 9:20 AM fetch NIFTY spot price. Step 3: Calculate strikes 200 points OTM. Step 4: Place 4 orders simultaneously. Step 5: Monitor P&L and exit at target or stop. Python with KiteConnect library is most popular for this.' },
        { title: 'Risk Controls for Algos', body: 'Always add max loss per day limit. Add position size checks before every order. Log every order and response. Test with paper trading first. Never leave algo running unattended on expiry day. Have a kill switch to flatten all positions immediately.' },
      ]
    },
  ],
}

export default function Learning() {
  const [tab, setTab]           = useState('Beginner')
  const [section, setSection]   = useState('courses')
  const [openCourse, setOpenCourse] = useState(null)

  const courses    = COURSES[tab] || []
  const completed  = courses.filter(c => c.progress === 100).length
  const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length

  // Course detail view
  if (openCourse) {
    return (
      <div className="fade-in">
        <button
          onClick={() => setOpenCourse(null)}
          className="btn btn-secondary"
          style={{ marginBottom: '1.5rem' }}
        >
          <i className="ti ti-arrow-left"></i> Back to Courses
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: 48 }}>{openCourse.icon}</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: '.25rem' }}>{openCourse.title}</h1>
            <div style={{ fontSize: 13, color: 'var(--text2)', display: 'flex', gap: '1rem' }}>
              <span>{openCourse.duration}</span>
              <span>{openCourse.lessons} lessons</span>
              {openCourse.tags.map(t => (
                <span key={t} style={{ background: 'var(--surface3)', padding: '1px 7px', borderRadius: 4, fontSize: 11 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {openCourse.content.map((lesson, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#000'
                }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: '.5rem', color: 'var(--accent)' }}>
                    {lesson.title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                    {lesson.body}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(0,212,170,.06)', border: '1px solid rgba(0,212,170,.2)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--green)', marginBottom: '.5rem' }}>
            Course Complete!
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            You have finished all lessons in this course. Keep learning to become a better trader.
          </div>
          <button
            onClick={() => setOpenCourse(null)}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Back to All Courses
          </button>
        </div>
      </div>
    )
  }

  const GLOSSARY = [
    { term: 'ATM', def: 'At The Money — strike price equals current spot price.' },
    { term: 'OTM', def: 'Out of The Money — CE above spot price, PE below spot price. No intrinsic value.' },
    { term: 'ITM', def: 'In The Money — CE below spot price, PE above spot price. Has intrinsic value.' },
    { term: 'IV',  def: 'Implied Volatility — how much movement the market expects. Higher IV means costlier premiums.' },
    { term: 'Theta', def: 'Time decay — the rate at which an option loses value as expiry approaches.' },
    { term: 'Delta', def: 'Rate of change of option price per 1 rupee move in underlying. Range 0 to 1.' },
    { term: 'PCR', def: 'Put-Call Ratio — above 1.2 is bullish bias, below 0.7 is bearish bias.' },
    { term: 'OI',  def: 'Open Interest — total number of outstanding option contracts in the market.' },
    { term: 'Max Pain', def: 'Strike price where most options expire worthless. Acts as expiry magnet.' },
    { term: 'Gamma', def: 'Rate of change of Delta per rupee move. Highest near ATM strike near expiry.' },
  ]

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="tab-bar" style={{ marginBottom: 0 }}>
          <button className={section === 'courses' ? 'tab active' : 'tab'} onClick={() => setSection('courses')}>
            Courses
          </button>
          <button className={section === 'glossary' ? 'tab active' : 'tab'} onClick={() => setSection('glossary')}>
            Glossary
          </button>
        </div>

        {section === 'courses' && (
          <div className="tab-bar" style={{ marginBottom: 0 }}>
            {Object.keys(COURSES).map(level => (
              <button key={level} className={tab === level ? 'tab active' : 'tab'} onClick={() => setTab(level)}>
                {level}
              </button>
            ))}
          </div>
        )}

        {section === 'courses' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem' }}>
            {completed > 0 && <span className="badge badge-green">{completed} completed</span>}
            {inProgress > 0 && <span className="badge badge-orange">{inProgress} in progress</span>}
          </div>
        )}
      </div>

      {section === 'courses' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {courses.map((course, i) => (
            <div
              key={i}
              onClick={() => setOpenCourse(course)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', overflow: 'hidden',
                cursor: 'pointer', transition: 'all .2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent2)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, background: 'var(--surface2)' }}>
                {course.icon}
              </div>
              <div style={{ padding: '1rem 1.2rem' }}>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginBottom: '.4rem' }}>
                  {course.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', gap: '.75rem', marginBottom: '.6rem' }}>
                  <span>{course.duration}</span>
                  <span>{course.lessons} lessons</span>
                </div>
                <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginBottom: '.65rem' }}>
                  {course.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--surface3)', color: 'var(--text2)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ height: 3, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: course.progress + '%', borderRadius: 2,
                    background: course.progress === 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--accent2), var(--accent))',
                  }}></div>
                </div>
                <div style={{ fontSize: 10, marginTop: '.4rem', color: course.progress === 100 ? 'var(--green)' : course.progress > 0 ? 'var(--accent3)' : 'var(--text3)' }}>
                  {course.progress === 100 ? 'Completed' : course.progress > 0 ? course.progress + '% complete' : 'Not started — Click to Start'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {section === 'glossary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
          {GLOSSARY.map(g => (
            <div key={g.term} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)', fontFamily: 'var(--mono)', marginBottom: '.4rem' }}>
                {g.term}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                {g.def}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}