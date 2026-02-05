# Notion Database Keyword Cleanup Workflow

## Overview
**Problem**: 1500+ record Notion database of consulting ideas has keywords added via Gemini workflow = messy data that needs standardization and sorting.

**Goal**: Standardize keywords, clean up data structure, make the database searchable and useful for Front Porch Analytics consulting business.

---

## Why Automated Processing is Ideal for This

### Advantages
- **Cost Effective**: Processing large datasets manually would be time-consuming
- **Large Dataset**: 1500+ records would be tedious to process manually
- **Consistency**: Automated processing ensures uniform standards
- **Privacy**: Consulting ideas stay local (confidential business data)
- **Batch Processing**: Can process records in chunks

---

## Phase 1: Data Export & Analysis

### 1. Export the Database
**From Notion**:
1. Open the Notion database
2. Click "..." menu → Export
3. Format: CSV or JSON (CSV is easier to work with)
4. Save to workspace

**Expected Fields**:
- Title/Name
- Description
- Keywords (likely comma-separated or multi-select)
- Created date
- Last edited
- Any other custom properties

### 2. Analyze the Current State
Create a quick analysis script to understand:
- Number of records
- Keyword formats (comma-separated, multi-select, single tags?)
- Duplicate keywords
- Common patterns in the mess
- Empty fields
- Data quality issues

```javascript
// Example analysis (can be done with Node.js or Python)
// Load CSV, parse keywords, identify patterns
```

---

## Phase 2: Define Standardization Rules

### Keyword Standards
Decide on consistent format:

**Option 1: Flat List (Comma-Separated)**
```
AI, Automation, CRM, Lead Generation, Email Marketing
```

**Option 2: Multi-Select Tags**
```
["AI", "Automation", "CRM", "Lead Generation", "Email Marketing"]
```

**Option 3: Hierarchical (Categories)**
```
Technology: AI, Automation
Marketing: Lead Generation, Email Marketing
CRM: Zoho, HubSpot, Salesforce
```

**Recommendation**: Start with Option 1 (simple flat list) for first pass. Can upgrade to Option 2 or 3 later if needed.

### Standardization Rules
1. **Case normalization**: All lowercase or Title Case (choose one)
2. **Whitespace**: Remove extra spaces, consistent separators
3. **Plurals**: Decide on singular or plural (e.g., "CRM" vs "CRMs")
4. **Spelling**: Fix common typos
5. **Synonyms**: Map similar terms to standard version
   - "Email Marketing" and "Email" → "Email Marketing"
   - "AI" and "Artificial Intelligence" → "AI"
6. **Minimum length**: Filter out meaningless single-character keywords

---

## Phase 3: Build the Cleanup Pipeline

### Approach A: Script-Based Processing (Recommended)

#### Tools Needed
- **Scripting language**: Node.js or Python for CSV processing
- **Text processing libraries**: For keyword normalization
- **Rule-based approach**: Standardization based on defined rules

#### Process Flow

```
CSV Export → Chunk Data → Script Normalization → Merge → Validation → Final CSV
```

#### Step-by-Step

**1. Chunk the Data**
Split 1500+ records into manageable batches (e.g., 50-100 records per chunk)
- Reason: Easier to process and validate in smaller batches
- Allows progress tracking
- Can resume if process fails

**2. Design the Processing Rules**

```
You are a data cleaning assistant. Your task is to standardize keywords in consulting ideas.

INPUT FORMAT:
Record ID | Title | Raw Keywords

TASK:
1. Extract all keywords from "Raw Keywords"
2. Normalize them according to these rules:
   - Use Title Case (first letter capital)
   - Remove duplicates
   - Fix spacing
   - Map synonyms to standard terms:
     * AI/Artificial Intelligence → AI
     * Email/Email Marketing → Email Marketing
     * CRM/Zoho/HubSpot → CRM (unless specific CRM is important)
   - Remove meaningless single-character tags
   - Keep only relevant, meaningful keywords
3. Return cleaned keywords as comma-separated list

OUTPUT FORMAT:
Record ID | Cleaned Keywords

Example:
INPUT: 123 | Marketing automation ideas | ai, artificial intelligence, CRM, email, email marketing
OUTPUT: 123 | AI, CRM, Email Marketing
```

**3. Process Chunks**

```javascript
// Pseudocode
const chunks = splitIntoChunks(records, 50);
const cleanedRecords = [];

for (const chunk of chunks) {
  const processed = processChunk(chunk);
  cleanedRecords.push(...processed);
  console.log(`Processed chunk ${chunkIndex}/${chunks.length}`);
}
```

**4. Merge & Validate**
- Combine all cleaned chunks
- Check for any missing records
- Validate keyword consistency across dataset
- Generate statistics (before/after comparison)

**5. Generate Final CSV**
- Cleaned data ready for re-import to Notion

---

### Approach B: Notion API + Direct Update

**Advantage**: Updates Notion directly, no export/import needed

**Tools Needed**:
- Notion API token
- Notion database ID
- Node.js script with notion-client

**Process**:
1. Fetch all records via API
2. Process keywords with script-based normalization
3. Update each record's keyword field via API
4. Handle rate limiting (Notion has API limits)

**Caveat**: More complex setup, but cleaner end result

---

## Phase 4: Implementation Plan

### Quick Start (1-2 hours)
1. **Export CSV** from Notion (10 min)
2. **Analyze** the data (20 min)
3. **Define rules** - write down standardization rules (10 min)
4. **Prototype** - test processing script on 10 records (30 min)
5. **Iterate** - refine script based on results (30 min)

### Full Implementation (3-5 hours)
1. **Script** the chunking process (1 hour)
2. **Process** all 1500+ records (2-3 hours, can run overnight)
3. **Validate** results (30 min)
4. **Fix** any issues found (30 min)
5. **Import** back to Notion (10 min)

### Timeline Options

**Option A: One Sprint (Same Day)**
- Start in morning
- Run processing while doing other work
- Complete by evening
- **Pros**: Done quickly
- **Cons**: Long uninterrupted focus needed

**Option B: Distributed Over Days**
- Export and analyze Day 1 (30 min)
- Prototype and refine Day 2 (1 hour)
- Run overnight Day 2-3 (no user effort)
- Validate and import Day 3 (1 hour)
- **Pros**: Less stressful
- **Cons**: Takes longer

**Recommendation**: Option B for Troy's ADHD workflow. Small, manageable chunks.

---

## Phase 5: Quality Assurance

### Validation Checks
1. **Record Count**: Ensure 1500+ → 1500+ (no data loss)
2. **Empty Keywords**: Identify records with no keywords after cleanup
3. **Outliers**: Check records with unusual keyword counts (too many or too few)
4. **Sample Review**: Manually review 50-100 random records
5. **Search Test**: Try searching for common keywords in Notion after import

### Metrics to Track
- Before: Average keywords per record, unique keyword count
- After: Average keywords per record, unique keyword count
- Reduction in duplicate keywords
- Most common keywords (before/after)
- Records with no keywords (may need manual attention)

---

## Phase 6: Ongoing Maintenance

### Prevention of Future Mess
1. **Document the standardization rules** in TOOLS.md
2. **Create input template** for adding new ideas
3. **Periodic cleanup schedule** (e.g., quarterly check)
4. **Consider validation rules** in Notion (if possible)

### Tools to Keep Handy
- Save the cleanup script in workspace
- Document the processing rules that worked best
- Keep record of synonyms mapping decisions

---

## Example Processing Rules for Testing

```
Task: Clean up keywords for a consulting ideas database.

Input:
Title: Automate lead follow-up emails
Raw Keywords: ai, artificial intelligence, crm, zoho, email automation, lead gen, sales

Rules:
1. Use Title Case
2. Remove duplicates
3. Standardize synonyms:
   - AI, Artificial Intelligence → AI
   - CRM, Zoho, HubSpot, Salesforce → CRM
   - Email, Email Automation → Email Automation
   - Lead Gen, Lead Generation → Lead Generation
4. Remove single-letter keywords
5. Keep only meaningful, relevant keywords

Output: Cleaned keywords as comma-separated list
```

Expected output:
```
AI, CRM, Email Automation, Lead Generation, Sales
```

---

## Success Criteria

✓ All 1500+ records processed
✓ No data lost
✓ Keywords standardized (consistent case, spacing)
✓ Duplicates removed
✓ Synonyms consolidated
✓ Searchable and useful database
✓ Time investment: 3-5 hours total

---

## Next Steps

1. [ ] Export CSV from Notion consulting ideas database
2. [ ] Analyze current keyword formats and mess
3. [ ] Define standardization rules
4. [ ] Test processing script on 10 sample records
5. [ ] Build chunking script
6. [ ] Process all records (overnight batch)
7. [ ] Validate results
8. [ ] Import cleaned CSV back to Notion
9. [ ] Document process for future reference

---

*Created: Feb 2, 2026*
*Updated: Feb 4, 2026*
*Status: Ready to execute - export and analyze needed*