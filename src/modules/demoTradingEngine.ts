/**
 * DEMO TRADING & VIRTUAL FUTURES ENGINE
 * 100% Không cần tài khoản sàn, không cần API Key, không mất phí, không rủi ro
 * Cung cấp tài khoản Demo $10,000 USDT ảo để người dùng tập trade và chạy Bot Auto-Trade.
 */

import { TokenMetrics } from '../types';
import { generateLongShortSetup, LongShortSetup } from './longShortEngine';

export interface DemoPosition {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  marginUsd: number;
  sizeTokens: number;
  stopLossPrice: number;
  takeProfit1Price: number;
  takeProfit2Price: number;
  unrealizedPnlUsd: number;
  unrealizedRoePercent: number;
  openedAt: string;
  timeframe: string;
  reason: string;
  winRate: number;
  status: 'OPEN' | 'CLOSED';
}

export interface DemoTradeHistoryItem {
  id: string;
  tokenSymbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  leverage: number;
  marginUsd: number;
  realizedPnlUsd: number;
  realizedRoePercent: number;
  closeReason: 'MANUAL_CLOSE' | 'TAKE_PROFIT_1' | 'TAKE_PROFIT_2' | 'STOP_LOSS' | 'EMERGENCY_KILL';
  openedAt: string;
  closedAt: string;
}

export interface DemoAccountState {
  initialBalanceUsd: number;
  balanceUsd: number; // Tiền mặt khả dụng
  equityUsd: number;  // Tổng tài sản = Tiền mặt + Margin + UnPnL
  usedMarginUsd: number;
  totalUnrealizedPnlUsd: number;
  totalRealizedPnlUsd: number;
  totalTradesCount: number;
  winningTradesCount: number;
  losingTradesCount: number;
  winRatePercent: number;
  positions: DemoPosition[];
  history: DemoTradeHistoryItem[];
  autoTradeBotActive: boolean; // Công tắc cho Bot tự động chạy Demo
  botMinWinRate: number; // Mặc định 75%
  botMaxMarginPerTrade: number; // Mặc định $200
  botMaxOpenPositions: number; // Mặc định 3
  botMaxLeverage: number; // Mặc định 5x
  botDirectionFilter: 'ALL' | 'LONG_ONLY' | 'SHORT_ONLY'; // Mặc định ALL
}

const DEFAULT_DEMO_BALANCE = 10000; // $10,000 USD vốn ảo khởi tạo

export function loadDemoAccount(): DemoAccountState {
  try {
    const saved = localStorage.getItem('demo_trading_account_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        initialBalanceUsd: DEFAULT_DEMO_BALANCE,
        balanceUsd: parsed.balanceUsd ?? DEFAULT_DEMO_BALANCE,
        equityUsd: parsed.equityUsd ?? DEFAULT_DEMO_BALANCE,
        usedMarginUsd: parsed.usedMarginUsd ?? 0,
        totalUnrealizedPnlUsd: parsed.totalUnrealizedPnlUsd ?? 0,
        totalRealizedPnlUsd: parsed.totalRealizedPnlUsd ?? 0,
        totalTradesCount: parsed.totalTradesCount ?? 0,
        winningTradesCount: parsed.winningTradesCount ?? 0,
        losingTradesCount: parsed.losingTradesCount ?? 0,
        winRatePercent: parsed.winRatePercent ?? 0,
        positions: parsed.positions || [],
        history: parsed.history || [],
        autoTradeBotActive: parsed.autoTradeBotActive ?? false,
        botMinWinRate: parsed.botMinWinRate ?? 75,
        botMaxMarginPerTrade: parsed.botMaxMarginPerTrade ?? 200,
        botMaxOpenPositions: parsed.botMaxOpenPositions ?? 3,
        botMaxLeverage: parsed.botMaxLeverage ?? 5,
        botDirectionFilter: parsed.botDirectionFilter ?? 'ALL',
      };
    }
  } catch (e) {
    console.warn('Could not read demo account from storage:', e);
  }

  return {
    initialBalanceUsd: DEFAULT_DEMO_BALANCE,
    balanceUsd: DEFAULT_DEMO_BALANCE,
    equityUsd: DEFAULT_DEMO_BALANCE,
    usedMarginUsd: 0,
    totalUnrealizedPnlUsd: 0,
    totalRealizedPnlUsd: 0,
    totalTradesCount: 0,
    winningTradesCount: 0,
    losingTradesCount: 0,
    winRatePercent: 0,
    positions: [],
    history: [],
    autoTradeBotActive: false,
    botMinWinRate: 75,
    botMaxMarginPerTrade: 200,
    botMaxOpenPositions: 3,
    botMaxLeverage: 5,
    botDirectionFilter: 'ALL',
  };
}

export function saveDemoAccount(state: DemoAccountState): void {
  try {
    localStorage.setItem('demo_trading_account_v1', JSON.stringify(state));
  } catch (e) {
    console.error('Could not save demo account:', e);
  }
}

export function resetDemoAccount(): DemoAccountState {
  const fresh: DemoAccountState = {
    initialBalanceUsd: DEFAULT_DEMO_BALANCE,
    balanceUsd: DEFAULT_DEMO_BALANCE,
    equityUsd: DEFAULT_DEMO_BALANCE,
    usedMarginUsd: 0,
    totalUnrealizedPnlUsd: 0,
    totalRealizedPnlUsd: 0,
    totalTradesCount: 0,
    winningTradesCount: 0,
    losingTradesCount: 0,
    winRatePercent: 0,
    positions: [],
    history: [],
    autoTradeBotActive: false,
    botMinWinRate: 75,
    botMaxMarginPerTrade: 200,
    botMaxOpenPositions: 3,
    botMaxLeverage: 5,
    botDirectionFilter: 'ALL',
  };
  saveDemoAccount(fresh);
  return fresh;
}

export function updateDemoBotSettings(
  state: DemoAccountState,
  settings: Partial<Pick<DemoAccountState, 'botMinWinRate' | 'botMaxMarginPerTrade' | 'botMaxOpenPositions' | 'botMaxLeverage' | 'botDirectionFilter'>>
): DemoAccountState {
  const updated: DemoAccountState = {
    ...state,
    ...settings,
  };
  saveDemoAccount(updated);
  return updated;
}

/**
 * Mở vị thế Demo mới
 */
export function openDemoPosition(
  state: DemoAccountState,
  params: {
    tokenSymbol: string;
    tokenName: string;
    direction: 'LONG' | 'SHORT';
    entryPrice: number;
    leverage: number;
    marginUsd: number;
    stopLossPrice: number;
    takeProfit1Price: number;
    takeProfit2Price: number;
    winRate: number;
    timeframe: string;
    reason: string;
  }
): { state: DemoAccountState; success: boolean; message: string } {
  if (state.balanceUsd < params.marginUsd) {
    return {
      state,
      success: false,
      message: `Số dư Demo không đủ! Cần $${params.marginUsd} USD nhưng chỉ còn $${state.balanceUsd.toFixed(2)} USD.`,
    };
  }

  // Kiểm tra xem đã có vị thế của coin này chưa
  const existing = state.positions.find((p) => p.tokenSymbol === params.tokenSymbol);
  if (existing) {
    return {
      state,
      success: false,
      message: `Bạn đang có 1 vị thế ${existing.direction} ${params.tokenSymbol} đang mở. Hãy đóng vị thế cũ trước khi mở thêm.`,
    };
  }

  const notionalSize = params.marginUsd * params.leverage;
  const sizeTokens = params.entryPrice > 0 ? notionalSize / params.entryPrice : 0;

  const newPos: DemoPosition = {
    id: `DEMO_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tokenSymbol: params.tokenSymbol,
    tokenName: params.tokenName,
    direction: params.direction,
    entryPrice: params.entryPrice,
    currentPrice: params.entryPrice,
    leverage: params.leverage,
    marginUsd: params.marginUsd,
    sizeTokens,
    stopLossPrice: params.stopLossPrice,
    takeProfit1Price: params.takeProfit1Price,
    takeProfit2Price: params.takeProfit2Price,
    unrealizedPnlUsd: 0,
    unrealizedRoePercent: 0,
    openedAt: new Date().toISOString(),
    timeframe: params.timeframe,
    reason: params.reason,
    winRate: params.winRate,
    status: 'OPEN',
  };

  const updatedPositions = [newPos, ...state.positions];
  const newBalance = state.balanceUsd - params.marginUsd;
  const newUsedMargin = state.usedMarginUsd + params.marginUsd;

  const newState: DemoAccountState = {
    ...state,
    balanceUsd: parseFloat(newBalance.toFixed(2)),
    usedMarginUsd: parseFloat(newUsedMargin.toFixed(2)),
    positions: updatedPositions,
  };

  saveDemoAccount(newState);
  return {
    state: newState,
    success: true,
    message: `✅ Mở thành công vị thế Demo ${params.direction} ${params.tokenSymbol} (${params.leverage}x) với ký quỹ $${params.marginUsd} USD!`,
  };
}

/**
 * Đóng vị thế Demo và kết toán PnL
 */
export function closeDemoPosition(
  state: DemoAccountState,
  positionId: string,
  exitPrice?: number,
  closeReason: DemoTradeHistoryItem['closeReason'] = 'MANUAL_CLOSE'
): { state: DemoAccountState; success: boolean; message: string; pnl: number } {
  const pos = state.positions.find((p) => p.id === positionId);
  if (!pos) {
    return { state, success: false, message: 'Không tìm thấy vị thế để đóng', pnl: 0 };
  }

  const finalExitPrice = exitPrice || pos.currentPrice;
  let priceDiffRatio = 0;
  if (pos.direction === 'LONG') {
    priceDiffRatio = (finalExitPrice - pos.entryPrice) / pos.entryPrice;
  } else {
    priceDiffRatio = (pos.entryPrice - finalExitPrice) / pos.entryPrice;
  }

  const realizedRoePercent = priceDiffRatio * pos.leverage * 100;
  const realizedPnlUsd = (pos.marginUsd * realizedRoePercent) / 100;

  // Hoàn trả margin + tiền lãi/lỗ vào số dư khả dụng
  const returnedCapital = Math.max(0, pos.marginUsd + realizedPnlUsd);
  const newBalance = state.balanceUsd + returnedCapital;
  const newUsedMargin = Math.max(0, state.usedMarginUsd - pos.marginUsd);

  const historyItem: DemoTradeHistoryItem = {
    id: pos.id,
    tokenSymbol: pos.tokenSymbol,
    direction: pos.direction,
    entryPrice: pos.entryPrice,
    exitPrice: finalExitPrice,
    leverage: pos.leverage,
    marginUsd: pos.marginUsd,
    realizedPnlUsd: parseFloat(realizedPnlUsd.toFixed(2)),
    realizedRoePercent: parseFloat(realizedRoePercent.toFixed(2)),
    closeReason,
    openedAt: pos.openedAt,
    closedAt: new Date().toISOString(),
  };

  const updatedPositions = state.positions.filter((p) => p.id !== positionId);
  const updatedHistory = [historyItem, ...state.history].slice(0, 100);

  const totalTrades = state.totalTradesCount + 1;
  const isWin = realizedPnlUsd > 0;
  const wins = state.winningTradesCount + (isWin ? 1 : 0);
  const losses = state.losingTradesCount + (!isWin ? 1 : 0);
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

  const newState: DemoAccountState = {
    ...state,
    balanceUsd: parseFloat(newBalance.toFixed(2)),
    usedMarginUsd: parseFloat(newUsedMargin.toFixed(2)),
    totalRealizedPnlUsd: parseFloat((state.totalRealizedPnlUsd + realizedPnlUsd).toFixed(2)),
    totalTradesCount: totalTrades,
    winningTradesCount: wins,
    losingTradesCount: losses,
    winRatePercent: parseFloat(winRate.toFixed(1)),
    positions: updatedPositions,
    history: updatedHistory,
  };

  saveDemoAccount(newState);
  return {
    state: newState,
    success: true,
    message: `Đã đóng vị thế ${pos.direction} ${pos.tokenSymbol}. PnL: ${realizedPnlUsd >= 0 ? '+' : ''}$${realizedPnlUsd.toFixed(2)} USD (${realizedRoePercent >= 0 ? '+' : ''}${realizedRoePercent.toFixed(1)}% ROE)`,
    pnl: realizedPnlUsd,
  };
}

/**
 * Cập nhật giá thời gian thực cho các vị thế Demo đang mở
 * Tự động kích hoạt Chốt lời TP hoặc Cắt lỗ SL nếu giá chạm ngưỡng!
 */
export function updateDemoPositionsWithLivePrices(
  state: DemoAccountState,
  tokens: TokenMetrics[]
): { state: DemoAccountState; triggeredAlerts: string[] } {
  if (state.positions.length === 0) return { state, triggeredAlerts: [] };

  const tokenMap = new Map<string, number>();
  tokens.forEach((t) => {
    tokenMap.set(t.symbol.toUpperCase(), t.priceUsd);
  });

  const triggeredAlerts: string[] = [];
  let updatedPositions: DemoPosition[] = [];
  let currentState = { ...state };

  for (const pos of state.positions) {
    const livePrice = tokenMap.get(pos.tokenSymbol.toUpperCase()) || pos.currentPrice;
    
    // Tính PnL hiện tại
    let diffRatio = 0;
    if (pos.direction === 'LONG') {
      diffRatio = (livePrice - pos.entryPrice) / pos.entryPrice;
    } else {
      diffRatio = (pos.entryPrice - livePrice) / pos.entryPrice;
    }
    const roe = diffRatio * pos.leverage * 100;
    const unPnl = (pos.marginUsd * roe) / 100;

    // KIỂM TRA ĐIỀU KIỆN CHẠM TAKE PROFIT HOẶC STOP LOSS TỰ ĐỘNG
    let hitTp = false;
    let hitSl = false;

    if (pos.direction === 'LONG') {
      if (livePrice >= pos.takeProfit1Price) hitTp = true;
      if (livePrice <= pos.stopLossPrice) hitSl = true;
    } else {
      if (livePrice <= pos.takeProfit1Price) hitTp = true;
      if (livePrice >= pos.stopLossPrice) hitSl = true;
    }

    if (hitTp) {
      const closeRes = closeDemoPosition(currentState, pos.id, livePrice, 'TAKE_PROFIT_1');
      currentState = closeRes.state;
      triggeredAlerts.push(`🎯 [DEMO BOT] Chốt lời tự động TP1 cho ${pos.direction} ${pos.tokenSymbol} tại $${livePrice} (+${roe.toFixed(1)}% ROE)`);
    } else if (hitSl) {
      const closeRes = closeDemoPosition(currentState, pos.id, livePrice, 'STOP_LOSS');
      currentState = closeRes.state;
      triggeredAlerts.push(`🛑 [DEMO BOT] Kích hoạt cắt lỗ tự động SL cho ${pos.direction} ${pos.tokenSymbol} tại $${livePrice} (${roe.toFixed(1)}% ROE)`);
    } else {
      updatedPositions.push({
        ...pos,
        currentPrice: livePrice,
        unrealizedPnlUsd: parseFloat(unPnl.toFixed(2)),
        unrealizedRoePercent: parseFloat(roe.toFixed(2)),
      });
    }
  }

  // Tính lại tổng Equity và UnPnL
  const totalUnrealized = updatedPositions.reduce((sum, p) => sum + p.unrealizedPnlUsd, 0);
  const totalUsedMargin = updatedPositions.reduce((sum, p) => sum + p.marginUsd, 0);
  const totalEquity = currentState.balanceUsd + totalUsedMargin + totalUnrealized;

  const finalState: DemoAccountState = {
    ...currentState,
    positions: updatedPositions,
    usedMarginUsd: parseFloat(totalUsedMargin.toFixed(2)),
    totalUnrealizedPnlUsd: parseFloat(totalUnrealized.toFixed(2)),
    equityUsd: parseFloat(totalEquity.toFixed(2)),
  };

  saveDemoAccount(finalState);
  return { state: finalState, triggeredAlerts };
}

/**
 * BOT TỰ ĐỘNG HÓA QUÉT VÀ VÀO LỆNH DEMO (AUTO-TRADE BOT DEMO RUNNER)
 */
export function runDemoAutoTradeScanner(
  state: DemoAccountState,
  tokens: TokenMetrics[]
): { state: DemoAccountState; newPositionsOpened: string[] } {
  if (!state.autoTradeBotActive) return { state, newPositionsOpened: [] };
  if (state.positions.length >= state.botMaxOpenPositions) return { state, newPositionsOpened: [] };

  const newPositionsOpened: string[] = [];
  let currentState = { ...state };

  for (const token of tokens) {
    if (currentState.positions.length >= currentState.botMaxOpenPositions) break;
    if (currentState.balanceUsd < currentState.botMaxMarginPerTrade) break;

    // Không mở trùng vị thế
    if (currentState.positions.some((p) => p.tokenSymbol === token.symbol)) continue;

    const setup = generateLongShortSetup(token);

    // Kiểm tra bộ lọc Hướng Đánh (Long only / Short only / Cả 2)
    if (currentState.botDirectionFilter === 'LONG_ONLY' && setup.direction !== 'LONG') continue;
    if (currentState.botDirectionFilter === 'SHORT_ONLY' && setup.direction !== 'SHORT') continue;

    // Chỉ tự động vào lệnh nếu Win Rate ước tính vượt ngưỡng cài đặt (ví dụ >= 75%)
    if (setup.estimatedWinRate >= currentState.botMinWinRate) {
      const chosenLeverage = Math.min(currentState.botMaxLeverage || 5, setup.maxLeverage);
      const openRes = openDemoPosition(currentState, {
        tokenSymbol: setup.tokenSymbol,
        tokenName: setup.tokenName,
        direction: setup.direction,
        entryPrice: setup.entryPrice,
        leverage: chosenLeverage,
        marginUsd: currentState.botMaxMarginPerTrade,
        stopLossPrice: setup.stopLoss,
        takeProfit1Price: setup.takeProfit1,
        takeProfit2Price: setup.takeProfit2,
        winRate: setup.estimatedWinRate,
        timeframe: setup.timeframe,
        reason: setup.reason,
      });

      if (openRes.success) {
        currentState = openRes.state;
        newPositionsOpened.push(
          `🤖 [BOT AUTO TRADE] Đã tự động mở vị thế Demo ${setup.direction} ${setup.tokenSymbol} (${setup.estimatedWinRate}% Win Rate, Đòn bẩy ${chosenLeverage}x, Ký quỹ $${currentState.botMaxMarginPerTrade})`
        );
      }
    }
  }

  return { state: currentState, newPositionsOpened };
}
