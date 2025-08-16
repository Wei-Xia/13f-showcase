# 13F Portfolio Disclosure Website

A professional website for displaying quarterly 13F disclosure reports for hedge funds, showcasing portfolio holdings and assets under management (AUM) growth.

## Features

- **Portfolio Allocation**: Interactive pie chart showing current holdings distribution
- **AUM Growth**: Line chart displaying historical assets under management 
- **Detailed Holdings**: Complete table of all portfolio positions
- **Professional Design**: Clean, modern interface optimized for investors
- **Responsive**: Works perfectly on desktop, tablet, and mobile devices

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization library
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 13f-showcase
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Updating Data

### Quarterly Holdings Data

To update the portfolio holdings for a new quarter:

1. Open `/data/holdings.json`
2. Replace the content with your new holdings data in this format:

```json
[
  {
    "symbol": "AAPL",
    "company": "Apple Inc.",
    "shares": 1500000,
    "marketValue": 285000000,
    "percentage": 28.5
  },
  {
    "symbol": "GOOGL", 
    "company": "Alphabet Inc.",
    "shares": 800000,
    "marketValue": 185000000,
    "percentage": 18.5
  }
]
```

**Required fields:**
- `symbol`: Stock ticker symbol
- `company`: Full company name
- `shares`: Number of shares held
- `marketValue`: Total market value in USD
- `percentage`: Percentage of total portfolio

### AUM History Data

To update the assets under management history:

1. Open `/data/aum.json`
2. Add the new quarter's data to the array:

```json
[
  {
    "quarter": "Q1 2024",
    "date": "2024-03-31", 
    "aum": 985000000
  },
  {
    "quarter": "Q2 2024",
    "date": "2024-06-30",
    "aum": 1000000000
  }
]
```

**Required fields:**
- `quarter`: Quarter label (e.g., "Q1 2024")
- `date`: End date of quarter (YYYY-MM-DD format)
- `aum`: Assets under management in USD

### Data Validation

Make sure:
- All percentages in holdings.json add up to 100%
- Market values are consistent with shares and current prices
- AUM data is in chronological order
- Date formats follow YYYY-MM-DD pattern

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings

### Other Platforms

The site can be deployed on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Customization

### Styling

- Modify Tailwind classes in components for design changes
- Update colors in `/components/HoldingsPieChart.tsx` for chart colors
- Customize layout in `/app/page.tsx`

### Branding

- Update company name and branding in `/app/page.tsx`
- Add logo by replacing content in header section
- Modify metadata in `/app/layout.tsx`

## File Structure

```
├── app/
│   ├── layout.tsx          # Root layout and metadata
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── HoldingsPieChart.tsx    # Portfolio pie chart
│   ├── AUMLineChart.tsx        # AUM growth chart  
│   └── HoldingsTable.tsx       # Detailed holdings table
├── data/
│   ├── holdings.json       # Current portfolio data
│   └── aum.json           # AUM history data
├── types/
│   └── index.ts           # TypeScript definitions
└── README.md
```

## Support

For technical issues or questions about updating the data, please refer to this documentation or contact your development team.
