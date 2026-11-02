# 🚀 Crypto Radar Pro & Whales Holding Engine

<p align="center">
  <img src="public/favicon.svg" width="90" alt="Crypto Radar Pro Logo" />
</p>

<p align="center">
  <strong>Hệ thống Phân Tích Dữ Liệu Thị Trường Tiền Số, Săn Cá Voi On-Chain, Định Giá Chu Kỳ & Siêu Đồ Thị Kỹ Thuật Thời Gian Thực</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Electron-45-47848f?style=for-the-badge&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

---

## 📖 Giới Thiệu (Overview)

**Crypto Radar Pro** là nền tảng máy tính (Windows Desktop App & Web App) mã nguồn mở được thiết kế dành cho nhà đầu tư tiền mã hóa chuyên nghiệp. Ứng dụng tích hợp các mô hình định lượng quản trị rủi ro dòng tiền thông minh, theo dõi dấu chân ví cá voi tỷ đô, xác thực giá vốn tổ chức đầu tư và công cụ phân tích kỹ thuật chuẩn mực TradingView.

> ⚠️ **TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM (DISCLAIMER):**
> Ứng dụng này chỉ phục vụ mục đích nghiên cứu dữ liệu thị trường và phân tích quản trị rủi ro. Không cấu thành lời khuyên đầu tư tài chính. Hệ thống **tuyệt đối không yêu cầu nhập Private Key, Seed Phrase hay kết nối ủy quyền ví**.

---

## 🌟 Tính Năng Cốt Lõi (Key Features)

### 1. 🎯 Bảng Xếp Hạng Top Cơ Hội Giao Dịch (Opportunity Leaderboard)
* Thuật toán chấm điểm cơ hội (Opportunity Score 0 - 100đ) kết hợp 4 trụ cột định lượng:
  * **Dòng tiền mua ròng (30đ):** Tỷ lệ lệnh mua chủ động (Buy Volume Ratio) và thanh khoản vào ròng.
  * **Mức độ chú ý thị trường (25đ):** Niêm yết CEX Tier-1 (Binance, Coinbase, Bybit, OKX) và tỷ lệ Turnover Vol/Mcap.
  * **Độ sâu thanh khoản Pool (25đ):** Khả năng hấp thụ trượt giá và độ dày orderbook.
  * **Động lượng giá & Breakout (20đ):** Xung lực biến động nến $5m, 15m, 1h, 24h$.

### 2. 🛡️ Bảng Xếp Hạng Hold Coin & Mua Tích Lũy Chu Kỳ Động (Safe Hold Engine)
* **Mô hình định giá chu kỳ động (Dynamic Cycle Valuation Model):** Điểm tích lũy biến thiên linh hoạt theo tọa độ ATH Drawdown % và vị thế thị trường.
* **Nguyên tắc bảo vệ tài khoản:** Bất kỳ token nào ở vùng **"Tiệm Cận Đỉnh (Late Cycle)"** đều bị trừ điểm nặng và khống chế điểm tối đa $\le 58$ điểm, chuyển sang trạng thái cảnh báo *Chờ Chiết Khấu / Không Mua Mới*, loại bỏ triệt để rủi ro xúi người dùng mua FOMO ở đỉnh.
* **Kế hoạch phân bổ vốn:** Khuyến nghị tỷ trọng danh mục cụ thể ($40\% - 60\%$ cho BTC, $25\% - 35\%$ cho ETH, $10\% - 20\%$ cho Layer 1 tiềm năng).

### 3. 🏛️ Săn Dấu Chân Cá Voi & Hồ Sơ Giá Vốn Quỹ Tỷ Đô (Whales & Institutions)
* Theo dõi các tổ chức lớn: BlackRock, Fidelity, MicroStrategy, Paradigm, a16z crypto, Pantera, Multicoin, Binance Labs...
* **Kiểm chứng Giá Vốn Trung Bình của Quỹ (Cost Basis):**
  * Đối chiếu từ hồ sơ **SEC 8-K** và dòng tiền ròng **Spot ETF VWAP** (với BTC, ETH).
  * Đối chiếu từ **Hợp đồng SAFT các vòng gọi vốn Seed, Series A/B** qua CryptoRank & RootData (với SUI, ENA, TIA, SEI, NEAR, ONDO, SOL...).
  * Đo lường vị thế thị giá so với giá quỹ ($x$ lần hay rẻ hơn giá vốn quỹ).

### 4. 📈 Siêu Đồ Thị TradingView Pro Tích Hợp (Super Chart Engine)
* Tích hợp TradingView Pro Widget và Canvas Super Chart Engine:
  * Đầy đủ các chỉ báo kỹ thuật hàng đầu: EMA 20/50/200, Dải Bollinger Bands, RSI (Chỉ số sức mạnh tương đối), MACD, Khối lượng giao dịch phân kỳ.
  * Hỗ trợ đa khung thời gian: $1m, 5m, 15m, 1h, 4h, 1D$.
  * Tối ưu không gian hiển thị, chống tràn lẹm giao diện, responsive mượt mà trên desktop.

### 5. 💰 Công Cụ Kế Hoạch Chia Vốn DCA & Tính Take Profit Đa Tầng
* Bảng tính DCA thông minh: Tự động chia $3 - 5$ mốc giải ngân theo vùng hỗ trợ Fibonacci/Order Block.
* Tính toán mục tiêu chốt lời (TP1, TP2, TP3) và tỷ lệ R:R (Risk/Reward) minh bạch.

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

* **Frontend:** React 19, TypeScript, TailwindCSS v4, Vite 8
* **Desktop Platform:** Electron 45 (Chromium + Node.js)
* **Biểu đồ:** TradingView Advanced Widget, HTML5 Canvas High-Precision Renderer
* **Dữ liệu & API:** Binance 24hr Ticker Stream, CoinGecko Live Market API, DexScreener RPC

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### Yêu Cầu Môi Trường:
* **Node.js:** Phiên bản 18.x trở lên
* **npm:** Đi kèm Node.js

### 1. Tải Mã Nguồn Về Máy:
```bash
git clone https://github.com/<your-username>/crypto-radar-pro.git
cd crypto-radar-pro
```

### 2. Cài Đặt Thư Viện Phụ Thuộc:
```bash
npm install
```

### 3. Chạy Ở Chế Độ Web App (Vite Dev Server):
```bash
npm run dev
```
Truy cập trình duyệt: `http://localhost:5173`

### 4. Chạy Ở Chế Độ Windows Desktop App (Electron Dev):
```bash
npm run electron:dev
```

### 5. Đóng Gói Ứng Dụng Windows Độc Lập (.EXE):
```bash
npm run build
node scripts/build-exe.cjs
```
File thực thi `.exe` sẽ được tạo trong thư mục:
```text
release/Meme Coin Radar/Meme Coin Radar.exe
```

---

## 📁 Cấu Trúc Thư Mục (Project Structure)

```text
crypto-radar-pro/
├── electron/                   # Mã nguồn tiến trình chính Electron (Main Process)
│   ├── dev.cjs                 # Loader môi trường phát triển
│   ├── main.cjs                # Cấu hình cửa sổ Desktop, IPC, Native Window
│   └── preload.cjs             # Preload script bảo mật ngữ cảnh
├── public/                     # Tài nguyên tĩnh (Favicon, Logo, Assets)
├── scripts/                    # Scripts đóng gói và tự động hóa dữ liệu
│   ├── build-exe.cjs           # Script đóng gói Portable Windows EXE
│   └── ...
├── src/                        # Toàn bộ mã nguồn ứng dụng (Frontend)
│   ├── adapters/               # Bộ điều hợp kết nối API CEX/DEX
│   ├── components/             # Các Component giao diện (Modal, Charts, Tables)
│   │   ├── CoinDetailModal.jsx # Modal chi tiết phân tích chuyên sâu
│   │   ├── TradingViewSuperChart.jsx # Widget Siêu Đồ Thị TradingView
│   │   └── ...
│   ├── data/                   # Bộ dữ liệu thị trường & danh mục thẩm định
│   ├── modules/                # Các Engine xử lý lõi (Core Business Engines)
│   │   ├── holdAccumulationEngine.ts # Thuật toán xếp hạng Safe Hold & DCA
│   │   ├── whaleInstitutionalEngine.ts # Engine phân tích ví tỷ đô & giá vốn quỹ
│   │   ├── liveMarketEngine.ts # Đồng bộ giá trực tiếp Binance/CoinGecko
│   │   └── scoringEngine.ts    # Thuật toán tính điểm cơ hội
│   ├── views/                  # Màn hình chính (OverviewView, SuperChartView...)
│   ├── App.jsx                 # Điều phối Root Component
│   └── main.jsx                # Điểm khởi chạy React
├── package.json                # Cấu hình dự án và dependencies
├── vite.config.js              # Cấu hình Vite bundler
├── LICENSE                     # Giấy phép mã nguồn mở MIT
└── README.md                   # Tài liệu hướng dẫn dự án
```

---

## 🤝 Đóng Góp Phát Triển (Contributing)

Mọi đóng góp từ cộng đồng đều được chào đón:
1. Fork dự án
2. Tạo nhánh tính năng mới (`git checkout -b feature/tinh-nang-moi`)
3. Commit các thay đổi (`git commit -m 'Thêm tính năng phân tích mới'`)
4. Đẩy lên remote (`git push origin feature/tinh-nang-moi`)
5. Mở một **Pull Request**

---

## 💖 Ủng Hộ Nhà Phát Triển (Donate / Support)

Nếu công cụ mã nguồn mở này hữu ích cho quá trình phân tích thị trường và quản trị vốn của bạn, bạn có thể ủng hộ tác giả để duy trì server và chi phí cập nhật dữ liệu on-chain:

* **Mạng Lưới (Network):** TRON / TRX (TRC20)
* **Đồng Tiền:** USDT (Tether USD)
* **Địa Chỉ Ví USDT (TRC20):**
  ```text
  TEC5upqc42siEWdTQFgn7pBasGVY86dVpj
  ```

---

## 📄 Giấy Phép (License)

Dự án này được phát hành dưới giấy phép mã nguồn mở **MIT License**. Bạn có toàn quyền sử dụng, sửa đổi và phân phối theo quy định của giấy phép.
