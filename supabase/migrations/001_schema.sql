-- ═══════════════════════════════════════════════════════════════
-- TradeIQ — Complete Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. Kite Sessions
--    Stores access_token returned from Edge Function after OAuth
-- ──────────────────────────────────────────────────────────────
create table if not exists kite_sessions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade,
  kite_user_id  text unique not null,
  access_token  text not null,
  user_name     text,
  email         text,
  expires_at    timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 2. Holdings (equity)
-- ──────────────────────────────────────────────────────────────
create table if not exists holdings (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  tradingsymbol         text not null,
  exchange              text not null default 'NSE',
  instrument_token      bigint,
  isin                  text,
  quantity              integer not null default 0,
  t1_quantity           integer default 0,
  average_price         numeric(12,4) not null default 0,
  last_price            numeric(12,4) not null default 0,
  close_price           numeric(12,4) default 0,
  pnl                   numeric(14,2) not null default 0,
  day_change            numeric(12,4) default 0,
  day_change_percentage numeric(8,4)  default 0,
  current_value         numeric(14,2) generated always as (quantity * last_price) stored,
  updated_at            timestamptz default now(),
  constraint holdings_user_symbol unique (user_id, tradingsymbol)
);
create index if not exists idx_holdings_user on holdings(user_id);

-- ──────────────────────────────────────────────────────────────
-- 3. Positions (F&O + intraday)
-- ──────────────────────────────────────────────────────────────
create table if not exists positions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  tradingsymbol    text not null,
  exchange         text default 'NFO',
  instrument_token bigint,
  product          text,
  quantity         integer default 0,
  overnight_qty    integer default 0,
  multiplier       integer default 1,
  average_price    numeric(12,4) default 0,
  last_price       numeric(12,4) default 0,
  close_price      numeric(12,4) default 0,
  buy_price        numeric(12,4) default 0,
  sell_price       numeric(12,4) default 0,
  buy_quantity     integer default 0,
  sell_quantity    integer default 0,
  pnl              numeric(14,2) default 0,
  realised         numeric(14,2) default 0,
  unrealised       numeric(14,2) default 0,
  m2m              numeric(14,2) default 0,
  instrument_type  text,
  expiry           date,
  strike           numeric(12,2),
  lot_size         integer default 1,
  created_at       timestamptz default now()
);
create index if not exists idx_positions_user on positions(user_id);

-- ──────────────────────────────────────────────────────────────
-- 4. Portfolio Snapshots (NAV history)
-- ──────────────────────────────────────────────────────────────
create table if not exists portfolio_snapshots (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  total_value    numeric(14,2) not null default 0,
  invested_value numeric(14,2) not null default 0,
  pnl            numeric(14,2) not null default 0,
  pnl_pct        numeric(8,4)  default 0,
  options_pnl    numeric(14,2) default 0,
  recorded_at    date not null default current_date,
  constraint portfolio_snapshots_user_date unique (user_id, recorded_at)
);
create index if not exists idx_snapshots_user_date on portfolio_snapshots(user_id, recorded_at desc);

-- ──────────────────────────────────────────────────────────────
-- 5. Watchlist
-- ──────────────────────────────────────────────────────────────
create table if not exists watchlist (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  tradingsymbol text not null,
  exchange      text not null default 'NSE',
  notes         text,
  created_at    timestamptz default now(),
  constraint watchlist_user_symbol unique (user_id, tradingsymbol)
);
create index if not exists idx_watchlist_user on watchlist(user_id);

-- ──────────────────────────────────────────────────────────────
-- 6. Alerts
-- ──────────────────────────────────────────────────────────────
create type alert_status as enum ('active', 'triggered', 'disabled');

create table if not exists alerts (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  symbol       text not null,
  exchange     text default 'NSE',
  alert_type   text not null default 'Price',   -- Price, IV, OI, Earnings, Volume
  condition    text,                             -- '>', '<', '=', 'crosses'
  value        numeric(14,4),
  note         text,
  status       alert_status default 'active',
  triggered_at timestamptz,
  created_at   timestamptz default now()
);
create index if not exists idx_alerts_user on alerts(user_id, status);

-- ──────────────────────────────────────────────────────────────
-- 7. Trade Journal
-- ──────────────────────────────────────────────────────────────
create table if not exists trade_journal (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  symbol       text not null,
  exchange     text default 'NSE',
  strategy     text,
  direction    text,   -- LONG, SHORT
  entry_date   date,
  exit_date    date,
  entry_price  numeric(12,4),
  exit_price   numeric(12,4),
  quantity     integer,
  pnl          numeric(14,2),
  charges      numeric(10,2) default 0,
  net_pnl      numeric(14,2) generated always as (pnl - charges) stored,
  rating       smallint check (rating between 1 and 5),
  notes        text,
  tags         text[],
  created_at   timestamptz default now()
);
create index if not exists idx_journal_user on trade_journal(user_id, entry_date desc);

-- ──────────────────────────────────────────────────────────────
-- 8. User Settings
-- ──────────────────────────────────────────────────────────────
create table if not exists user_settings (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  kite_api_key    text,                       -- stored encrypted (optional)
  default_exchange text default 'NSE',
  risk_per_trade  numeric(5,2) default 2.0,   -- % of capital
  theme           text default 'dark',
  notifications   boolean default true,
  currency        text default 'INR',
  updated_at      timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────
-- 9. Market News Cache (populated by edge function / cron)
-- ──────────────────────────────────────────────────────────────
create table if not exists market_news (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  summary     text,
  source      text,
  url         text,
  tag         text,           -- MACRO, F&O, RESULT, SECTOR, ALERT
  impact      text,           -- Positive, Negative, Neutral
  symbols     text[],         -- ['RELIANCE', 'TCS']
  published_at timestamptz,
  created_at  timestamptz default now()
);
create index if not exists idx_news_published on market_news(published_at desc);

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────
alter table kite_sessions      enable row level security;
alter table holdings            enable row level security;
alter table positions           enable row level security;
alter table portfolio_snapshots enable row level security;
alter table watchlist           enable row level security;
alter table alerts              enable row level security;
alter table trade_journal       enable row level security;
alter table user_settings       enable row level security;
alter table market_news         enable row level security;

-- RLS policies
do $$ begin
  create policy "own_kite_sessions"   on kite_sessions      for all using (auth.uid() = user_id);
  create policy "own_holdings"        on holdings            for all using (auth.uid() = user_id);
  create policy "own_positions"       on positions           for all using (auth.uid() = user_id);
  create policy "own_snapshots"       on portfolio_snapshots for all using (auth.uid() = user_id);
  create policy "own_watchlist"       on watchlist           for all using (auth.uid() = user_id);
  create policy "own_alerts"          on alerts              for all using (auth.uid() = user_id);
  create policy "own_journal"         on trade_journal       for all using (auth.uid() = user_id);
  create policy "own_settings"        on user_settings       for all using (auth.uid() = user_id);
  create policy "news_public_read"    on market_news         for select using (true);
exception when duplicate_object then null;
end $$;

-- ──────────────────────────────────────────────────────────────
-- AUTO SNAPSHOT TRIGGER — records daily NAV whenever holdings update
-- ──────────────────────────────────────────────────────────────
create or replace function fn_record_snapshot()
returns trigger language plpgsql security definer as $$
declare
  v_total   numeric;
  v_invest  numeric;
  v_opt_pnl numeric;
begin
  select
    coalesce(sum(last_price * quantity), 0),
    coalesce(sum(average_price * quantity), 0)
  into v_total, v_invest
  from holdings where user_id = new.user_id;

  select coalesce(sum(pnl), 0)
  into v_opt_pnl
  from positions where user_id = new.user_id;

  insert into portfolio_snapshots
    (user_id, total_value, invested_value, pnl, pnl_pct, options_pnl)
  values (
    new.user_id, v_total, v_invest,
    v_total - v_invest,
    case when v_invest > 0 then round((v_total - v_invest)/v_invest*100, 4) else 0 end,
    v_opt_pnl
  )
  on conflict (user_id, recorded_at) do update set
    total_value    = excluded.total_value,
    invested_value = excluded.invested_value,
    pnl            = excluded.pnl,
    pnl_pct        = excluded.pnl_pct,
    options_pnl    = excluded.options_pnl;
  return new;
end;
$$;

drop trigger if exists trg_auto_snapshot on holdings;
create trigger trg_auto_snapshot
  after insert or update on holdings
  for each row execute function fn_record_snapshot();
