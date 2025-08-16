# 13F Showcase Data Structure

## Overview
This document describes the data structure used in the 13F Portfolio Disclosure website.

## File Structures

### holdings.json
Contains quarterly snapshots of portfolio holdings with AUM data for audit and historical reference.

```json
[
  {
    "quarter": "Q1 2025",
    "date": "2025-03-31",
    "aum": 69395,
    "holdings": [
      {
        "symbol": "VOO",
        "company": "Vanguard S&P 500 ETF",
        "shares": 110,
        "marketValue": 56650,
        "percentage": 81.67
      }
    ]
  }
]
```

### transactions.json
Contains quarterly trading activities (price information removed for privacy).

```json
[
  {
    "quarter": "Q1 2025",
    "date": "2025-03-31",
    "transactions": [
      {
        "action": "buy",
        "symbol": "QQQM",
        "company": "Invesco NASDAQ 100 ETF",
        "shares": 30
      }
    ]
  }
]
```

## Data Consolidation

**Previous Structure:**
- holdings.json (portfolio positions)
- aum.json (assets under management)
- transactions.json (trading activity)

**Current Structure:**
- holdings.json (consolidated: positions + AUM per quarter)
- transactions.json (trading activity)

## Benefits of Consolidated Structure

- **Data Consistency**: AUM and holdings are always in sync
- **Simplified Maintenance**: Single file per quarter update
- **Audit Trail**: Complete quarterly snapshot in one place
- **Data Integrity**: Prevents AUM/holdings mismatches

## Privacy Protection

- **No Price Information**: Transaction prices and total values are not stored or displayed
- **Snapshot Only**: Only quarterly end positions are disclosed
- **13F Compliant**: Follows institutional disclosure standards

## Data Updates

1. Update holdings.json with new quarterly snapshot including:
   - Quarter and date information
   - AUM for the quarter
   - Complete holdings list with market values and percentages
2. Add new quarter to transactions.json (without prices)
3. Ensure AUM matches sum of holding market values

## Audit Trail

The consolidated quarterly structure provides:
- Position changes over time
- AUM growth tracking
- Portfolio evolution
- Compliance verification
- Complete quarterly snapshots for regulatory review
