# ANALYSIS & SOLUTION PROPOSAL DOCUMENT  
## Expense Lookup Support System, Budget Group/Sub-item Suggestion, and Reimbursement Report Export  
### Selected technology approach: **Option A — Next.js + Supabase + OpenAI API**

---

## 1. Project Overview

### 1.1. Background
In the reimbursement/payment preparation process, users usually have to:
- manually look up the correct **budget group / sub-item code**
- compare organization information with the original supporting document
- determine the correct spending content
- compile information and send it to the accounting department for reimbursement

The current manual process often causes:
- wasted lookup time
- errors in organization name, address, or tax code
- difficulty identifying the correct budget code when the expense description is vague
- difficulty preparing reports quickly and consistently

### 1.2. System Objectives
Build a web application that:
- requires first-time users to register and log in before using the system
- validates organization information against source data uploaded by the admin
- allows users to enter expense descriptions in natural language
- analyzes the description and suggests:
  - budget group
  - budget sub-item
  - expense content
  - amount
- displays results in a visual and user-friendly way, not as a rigid Excel-style table
- allows users to export a report for submission to the accounting department

### 1.3. Competition Demo Objective
Since the system is intended for **one-time use in a competition/demo**, the main goal is to:
- run stably
- have a modern and attractive interface
- clearly demonstrate practical value
- include AI support
- have a clear business workflow
- avoid unnecessary production-level complexity

---

## 2. Project Scope

### 2.1. Included scope
- User registration / login
- Organization information input and validation
- Admin upload of source files (Excel/PDF)
- Parsing Excel files into normalized JSON and storing them in the database
- Natural-language expense description analysis
- Similarity-based matching with master budget data
- Suggesting budget group / sub-item / expense content / amount
- Saving search history
- Basic report export

### 2.2. Out of MVP scope for the competition
- Multi-level approval workflow
- Deep role/permission system
- Advanced learning from user feedback
- Model fine-tuning
- Complex OCR for low-quality scanned documents
- Realtime features / advanced notifications
- Integration with digital signatures or internal financial systems

---

## 3. System Users

### 3.1. User
A person who enters expense descriptions to look up budget codes and prepare reimbursement reports.

### 3.2. Admin
A person who manages master/reference data:
- uploads Excel/PDF files
- updates the master budget catalog
- checks imported data
- manages the source data used by the system

> For the demo phase, only 2 roles are needed: **User** and **Admin**.

---

## 4. Core Business Problems

The system solves 2 main problems:

### 4.1. Organization information validation
After logging in, the user enters:
- Organization name
- Address
- Tax code

The system compares these fields with the source data uploaded by the admin.

If the data does not match:
- the system indicates where the mismatch is
- points out which field is wrong
- asks the user to correct it

If the data matches:
- the user may continue to the expense description analysis step

### 4.2. Budget group / sub-item suggestion from natural-language input
The user enters a description such as:
> “This week I guided probationary staff and received an allowance of 100,000.”

The system analyzes the input and suggests:
- budget group: `6100`
- sub-item: `6113`
- matched content: `Allowance for guiding probationary staff`
- amount: `100000`

---

## 5. Detailed Business Requirements

### 5.1. Registration / Login
#### User stories
- As a new user, I want to register an account so I can use the system.
- As an existing user, I want to log in and continue my work.
- As a user, I want to log out after use.

#### Requirements
- register with email + password
- log in with email + password
- maintain login session
- provide a basic profile page

---

### 5.2. Organization information input and validation
#### Input data
- Organization name
- Address
- Tax code

#### Validation source
- master data uploaded by the admin

#### Processing requirements
- normalize data before matching:
  - trim extra spaces
  - standardize letter casing
  - remove Vietnamese accents for near-match comparison if needed
  - remove unnecessary special characters
- compare using multiple levels:
  - exact match
  - fuzzy match
- return results as:
  - exact match
  - near match
  - no match

#### Example feedback
- “Tax code does not match”
- “Organization name is close but missing the phrase ‘- DAK LAK’”
- “Address does not fully match; missing ‘Dray Bhăng Commune’”

---

### 5.3. Admin source file upload
#### Supported file types
- Excel (`.xls`, `.xlsx`) — main source for structured parsing
- PDF — reference / manual comparison / demonstration

#### Requirements
- admin uploads a source file
- system parses Excel
- system creates normalized JSON
- system stores data in the database
- each upload creates a version
- one version is marked as the active version

#### Important note
- The system should not read Excel directly every time a user performs a search
- The correct flow is:

```text
Excel upload -> Parse -> Normalized JSON -> Store in DB -> Search / Matching
```

---

### 5.4. Expense description input
The user enters a natural-language description.

Examples:
- “received an allowance for guiding trainees, 100k”
- “got paid for guiding probationary staff”
- “received extra support for supervising new staff”
- “received an additional responsibility allowance”

#### Requirements
- provide a large textarea for description input
- allow the amount to be embedded in the text
- the system should extract:
  - main keywords
  - context
  - amount
  - estimated expense type

---

### 5.5. Budget group / sub-item suggestion
#### Requirements
The system must:
- not rely only on exact keywords
- detect similarity when the description is general or phrased differently
- return the top matching results
- provide a confidence level
- explain briefly why the suggestion was selected

#### Returned result
- budget group code
- budget sub-item code
- expense content
- extracted amount
- confidence score
- explanation

#### Example
```json
{
  "group_code": "6100",
  "sub_code": "6113",
  "matched_content": "Allowance for guiding probationary staff",
  "amount": 100000,
  "confidence": 0.93,
  "reason": "The description contains a phrase close to 'guiding probationary staff', so sub-item 6113 is prioritized."
}
```

---

### 5.6. Report export
#### Objective
Allow users to compile analyzed expense items into a report for the accounting department.

#### Requirements
- save results selected by the user
- allow multiple expense items to be added to one report
- export a basic PDF or Excel report
- report content includes:
  - organization information
  - list of expense items
  - budget group
  - budget sub-item
  - expense content
  - amount
  - created date

---

## 6. Data Challenges and Normalization Strategy

### 6.1. Why not work directly with Excel
Excel files often contain:
- merged cells
- multi-level headers
- comment rows
- blank cells whose meaning depends on the row above
- inconsistent structure

This makes Excel inconvenient for:
- backend processing
- frontend rendering
- AI pipelines
- database queries

### 6.2. Correct approach
- Excel is used by the admin for maintenance and upload
- JSON is used as the normalized intermediate layer
- Database is the main operational data source

### 6.3. Standard data flow
```text
Admin uploads Excel
-> system parses the file
-> creates raw JSON
-> normalizes into structured JSON
-> stores in PostgreSQL
-> supports search / matching / reporting
```

---

## 7. JSON Structure Design

### 7.1. Raw import JSON
Used to preserve data close to the Excel structure for parsing/debugging.

```json
{
  "row_index": 42,
  "code": "6113",
  "content": "Responsibility allowance by profession or work. (Allowance for guiding probationary staff, accounting responsibility allowance, ...)",
  "parent_group": "6100",
  "parent_group_title": "Salary allowances"
}
```

### 7.2. Normalized JSON
Used by the actual system.

```json
{
  "group_code": "6100",
  "group_title": "Salary allowances",
  "sub_code": "6113",
  "sub_title": "Responsibility allowance by profession or work",
  "examples": [
    "Allowance for guiding probationary staff",
    "Accounting responsibility allowance"
  ],
  "keywords": [
    "guiding probationary staff",
    "guiding trainees",
    "supervising probationary staff",
    "guidance responsibility",
    "responsibility allowance"
  ],
  "negative_keywords": [
    "hazardous",
    "union",
    "party work"
  ],
  "source_file": "MLNS_KB Tinh.xls",
  "source_row": 42,
  "version": 1,
  "is_active": true
}
```

---

## 8. Matching Strategy to Maximize Accuracy

This is the most important part of the system.

### 8.1. Problem
Users will not always enter wording identical to the master data.
They may:
- describe the expense in a long sentence
- use informal language
- abbreviate words
- make spelling mistakes
- provide vague descriptions

### 8.2. Solution
Use a **Hybrid Matching** model with 4 layers:

#### (1) Exact match
Match exact keywords after normalization.

#### (2) Fuzzy match
Handle:
- spelling mistakes
- missing words
- accent-free text

#### (3) Synonym expansion
Expand equivalent words/phrases.

Example:
- “guide” ~ “mentor” ~ “train” ~ “instruct”
- “probationary staff” ~ “trainee” ~ “new staff”

#### (4) Semantic matching
Find similarity in meaning, not only in wording.

---

### 8.3. Description processing workflow
```text
User input
-> text normalization
-> amount extraction
-> keyword expansion
-> retrieve candidates using keyword/fuzzy search
-> rerank using AI or semantic scoring
-> return top 1 / top 3 results
```

### 8.4. Suggested scoring formula
A practical formula can be:

```text
Total Score =
35% keyword/fuzzy match
35% semantic similarity
20% business rules
10% historical/manual priority
```

> For the demo phase, `historical/manual priority` may be skipped if time is limited.

---

### 8.5. Confidence levels
#### Very high confidence
- confidence >= 85%
- show the main result prominently

#### Moderately close
- confidence from 60% to 84%
- show top 3 results for the user to choose

#### Ambiguous
- confidence < 60%
- do not guess blindly
- ask the user to provide more information

---

## 9. The Role of AI in the System

### 9.1. What AI should do
AI should support:
- understanding natural-language descriptions
- extracting keywords
- rewriting/normalizing the description
- helping detect similar expense meanings
- explaining why a result was selected
- suggesting clarification when the description is vague

### 9.2. What AI should not do
The system should not give the entire decision to AI in a blind way such as:
> “Here is the user description, guess the correct budget code.”

That approach is risky and hard to control.

### 9.3. Proper AI usage
The better approach is:
- the DB/search layer first retrieves candidate items
- AI helps rerank and explain them

---

## 10. Selected Technology Solution for the Competition

### 10.1. Why Option A was chosen
Because this project is for **a one-time competition/demo**, the priorities are:
- fast development
- fewer bugs
- easy demo preparation
- attractive UI
- quick AI integration

### 10.2. Technology stack
#### Frontend + Backend
- **Next.js**
- **TypeScript**

#### UI
- **Tailwind CSS**
- **shadcn/ui**
- **lucide-react**

#### Forms & validation
- **react-hook-form**
- **zod**

#### Database / Auth / Storage
- **Supabase**
  - Supabase Auth
  - Supabase PostgreSQL
  - Supabase Storage

#### File processing
- **xlsx** for Excel
- a basic PDF text parsing library if needed

#### AI
- **OpenAI API**

#### Utilities
- `date-fns`
- `clsx`
- `tailwind-merge`

---

## 11. Why Option A Fits Best

### Advantages
- one Next.js project is enough
- APIs can be implemented directly inside the same project
- Supabase already provides auth + DB + storage
- fast to deploy
- suitable for a modern web demo
- avoids spending time building a separate backend

### Not necessary for the competition
- a separate NestJS backend
- microservices
- background queues
- complex vector databases
- production-level infrastructure

---

## 12. Proposed System Architecture

```text
[User / Admin]
      |
      v
[Next.js Web App]
      |
      +-- UI (Tailwind + shadcn/ui)
      +-- API Routes / Server Actions
      |
      v
[Supabase]
      |
      +-- Auth
      +-- PostgreSQL
      +-- Storage
      |
      v
[OpenAI API]
```

### Main processing flow
```text
User login
-> enter organization information
-> validation API compares with master data
-> user enters expense description
-> analyze API processes text + finds candidates + calls AI support
-> returns results to UI
-> user confirms/selects
-> save history
-> export report
```

---

## 13. Suggested Project Folder Structure

```text
src/
  app/
    (auth)/
      login/
      register/
    dashboard/
      page.tsx
    profile/
      page.tsx
    analyze/
      page.tsx
    reports/
      page.tsx
    admin/
      upload-master/
        page.tsx
      master-items/
        page.tsx
    api/
      validate-org/
        route.ts
      analyze-description/
        route.ts
      upload-master-file/
        route.ts
      export-report/
        route.ts

  components/
    common/
    forms/
    cards/
    layout/
    analysis/

  lib/
    supabase/
    excel/
    parser/
    matching/
    ai/
    utils/

  types/
  hooks/
```

---

## 14. Screen Design

### 14.1. Registration page
- Email
- Password
- Confirm password
- Register button

### 14.2. Login page
- Email
- Password
- Login button

### 14.3. Dashboard page
- system summary
- button to enter analysis screen
- recent reports list

### 14.4. Organization information page
- Organization name
- Address
- Tax code
- “Validate” button
- statuses:
  - Exact match
  - Near match
  - No match

### 14.5. Expense analysis page
#### Left column
- Organization information card
- Description textarea
- “Analyze” button

#### Right column
- Best-match result card
- Alternative result cards
- Budget group / sub-item badges
- System explanation section
- Buttons:
  - Select this result
  - Add to report

### 14.6. Admin file upload page
- Select Excel/PDF file
- Upload
- Preview parsed results
- “Publish version” button

### 14.7. Report page
- list of selected expense items
- total amount
- Export PDF / Excel button

---

## 15. UI Requirements
The user wants the interface to be **visual, engaging, and not rigid like a table**, so the UI should be:
- bright
- modern
- card-based
- rich with icons, badges, and highlights
- clearly structured

### Suggested result display
Instead of using a table, use cards such as:

#### Best result
- Badge `6100`
- Badge `6113`
- Expense title
- Short explanation line
- Amount line
- Progress bar or confidence badge such as `93%`

#### Alternative results
- 2 smaller cards below for comparison

---

## 16. Proposed Database Schema

### 16.1. users
- id
- email
- full_name
- role
- created_at

### 16.2. organization_profiles
- id
- user_id
- unit_name
- address
- tax_code
- validation_status
- matched_version_id
- created_at
- updated_at

### 16.3. master_document_versions
- id
- file_name
- file_type
- storage_path
- version_no
- uploaded_by
- uploaded_at
- is_active
- checksum

### 16.4. master_item_groups
- id
- version_id
- group_code
- group_title

### 16.5. master_items
- id
- version_id
- group_id
- sub_code
- sub_title
- description
- normalized_text
- source_row
- is_active

### 16.6. master_item_keywords
- id
- item_id
- keyword
- keyword_normalized
- keyword_type

### 16.7. analysis_requests
- id
- user_id
- organization_profile_id
- raw_description
- normalized_description
- extracted_amount
- top_result_json
- selected_item_id
- confidence
- created_at

### 16.8. reports
- id
- user_id
- report_code
- report_name
- total_amount
- status
- exported_file_path
- created_at

### 16.9. report_items
- id
- report_id
- analysis_request_id
- amount
- note

---

## 17. Minimum Supabase Tables for the MVP
If you want to simplify further for the competition, the minimum set is:
- users
- organization_profiles
- master_document_versions
- master_items
- master_item_keywords
- analysis_requests
- reports
- report_items

> `master_item_groups` can be skipped initially if you prefer speed, since `group_code` and `group_title` may be stored directly in `master_items`.

---

## 18. Proposed APIs

### 18.1. POST /api/validate-org
#### Input
```json
{
  "unit_name": "PEOPLE'S PROCURACY OF REGION 5 - DAK LAK",
  "address": "Administrative Center Area, Dray Bhăng Commune - Dak Lak Province - VIETNAM",
  "tax_code": "6000930278"
}
```

#### Output
```json
{
  "is_match": true,
  "score": 0.97,
  "field_results": {
    "unit_name": { "matched": true, "score": 0.95 },
    "address": { "matched": true, "score": 0.94 },
    "tax_code": { "matched": true, "score": 1.0 }
  }
}
```

---

### 18.2. POST /api/upload-master-file
#### Function
- receive Excel/PDF file
- parse the file
- save a version
- generate normalized data

---

### 18.3. POST /api/analyze-description
#### Input
```json
{
  "description": "This week I guided probationary staff and received 100,000",
  "organization_profile_id": "..."
}
```

#### Output
```json
{
  "amount": 100000,
  "results": [
    {
      "group_code": "6100",
      "sub_code": "6113",
      "title": "Responsibility allowance by profession or work",
      "matched_content": "Allowance for guiding probationary staff",
      "confidence": 0.93,
      "reason": "The description is close in meaning to guiding probationary staff."
    }
  ]
}
```

---

### 18.4. POST /api/export-report
#### Function
- generate report file
- store file in storage
- return downloadable link

---

## 19. Excel Import Algorithm

### 19.1. Input
An Excel file containing:
- group code
- sub-item code
- expense content
- notes
- examples

### 19.2. Process
```text
Step 1. Read the file with xlsx
Step 2. Identify the main data sheet
Step 3. Iterate through each row
Step 4. Determine whether a row is a group item or a sub-item
Step 5. Inherit group_code/group_title for child rows when necessary
Step 6. Parse description, examples, and notes
Step 7. Create raw JSON
Step 8. Normalize into structured JSON
Step 9. Save to DB
```

### 19.3. Import validation
- code must not be empty
- no duplicate records within the same version
- each record must have content
- group_code/sub_code must follow valid format
- log parsing errors for admin review

---

## 20. Organization Validation Algorithm

### 20.1. Processing steps
```text
Receive input
-> normalize each field
-> exact match for tax code
-> fuzzy match for organization name
-> fuzzy/token match for address
-> compute score per field
-> return field-specific feedback
```

### 20.2. Suggested rules
- Tax code:
  - exact or nearly exact match only
- Organization name:
  - fuzzy score >= 0.9 can be treated as near match
- Address:
  - compare by tokens / address components

---

## 21. Expense Description Analysis Algorithm

### 21.1. Pipeline
```text
Input description
-> normalize
-> extract amount
-> extract key phrases
-> expand synonyms
-> query keyword/fuzzy matches
-> get top candidates
-> call AI for reranking / explanation
-> return top 1 or top 3
```

### 21.2. Detailed steps
#### Step 1: Normalize
- lowercase
- remove accents if needed for comparison
- standardize spaces
- standardize monetary expressions

#### Step 2: Extract amount
Examples:
- `100k` -> `100000`
- `100,000 VND` -> `100000`

#### Step 3: Extract key phrases
For the sentence:
> “received an allowance for guiding trainees, 100k”

Extract:
- `allowance`
- `guiding`
- `trainees`

#### Step 4: Expand synonyms
Examples:
- `guiding` -> `mentoring`, `training`, `instructing`
- `trainee` -> `probationary staff`, `new staff`

#### Step 5: Candidate retrieval
- keyword search
- fuzzy search
- merge results

#### Step 6: AI reranking
AI receives:
- user description
- top candidate items
- instruction to choose the most appropriate candidate

#### Step 7: Return result
- top 1 if confidence is very high
- top 3 if confidence is moderate

---

## 22. Suggested AI Prompt
Example backend prompt to the model:

```text
You are a system that supports administrative expense classification.
Tasks:
1. Read the user description.
2. Compare it with the candidate list already retrieved by the system.
3. Choose the most suitable candidate.
4. Explain briefly why it was selected.
5. Do not create any code outside the candidate list.

User description:
"This week I guided probationary staff and received 100,000."

Candidate list:
1. 6100 - 6113 - Responsibility allowance by profession or work - example: Allowance for guiding probationary staff
2. 6100 - 6107 - Hazardous allowance
3. 6100 - 6123 - Party/union/social organization allowance

Return JSON with:
- best_candidate_index
- confidence
- reason
```

---

## 23. MVP Development Plan

### Phase 1 — Foundation setup
- create Next.js project
- configure Tailwind
- configure Supabase
- build auth
- build base layout and routing

### Phase 2 — Master data
- build admin upload page
- parse Excel with `xlsx`
- normalize data
- save to DB
- show import preview

### Phase 3 — Organization validation
- build organization form
- implement matching logic
- show field-level feedback

### Phase 4 — Expense description analysis
- build description textarea
- implement amount parsing
- retrieve candidates
- call AI for reranking
- display attractive result cards

### Phase 5 — Reporting
- allow user to select results
- save report
- export a simple file

### Phase 6 — Demo polishing
- improve UI
- fix bugs
- prepare sample data
- prepare demo scenario

---

## 24. Suggested Competition Demo Scenario

### Scenario 1 — New user flow
1. Register account
2. Log in
3. Enter organization name, address, and tax code
4. System confirms the data matches

### Scenario 2 — Clear expense description
1. Enter:
   > “This week I guided probationary staff and received 100,000.”
2. The system returns:
   - 6100
   - 6113
   - Allowance for guiding probationary staff
   - 100000

### Scenario 3 — General description
1. Enter:
   > “received extra support for supervising new staff”
2. The system returns the top 3 closest results
3. The user chooses the most suitable one

### Scenario 4 — Report export
1. The user adds selected items into a report
2. Clicks export
3. Downloads the report to send to accounting

---

## 25. Risks and Mitigation

### 25.1. Risk: Excel parsing errors
**Cause:**
- merged cells
- inconsistent format

**Mitigation:**
- implement import preview
- log parsing errors by row
- standardize around one primary sheet template

### 25.2. Risk: User enters overly vague descriptions
**Mitigation:**
- do not guess blindly
- return top 3 results
- ask for more detail

### 25.3. Risk: AI suggestions are not accurate enough
**Mitigation:**
- do not let AI invent codes outside retrieved candidates
- use AI only for reranking candidate results

### 25.4. Risk: Not enough time to complete everything
**Mitigation:**
Prioritize:
1. Auth
2. Excel upload
3. Data parsing
4. Organization validation
5. Description analysis
6. Result UI
7. Basic export

---

## 26. Required Libraries

### Frontend / Next.js
- next
- react
- react-dom
- typescript

### UI
- tailwindcss
- shadcn/ui
- lucide-react
- clsx
- tailwind-merge

### Forms
- react-hook-form
- zod
- @hookform/resolvers

### Supabase
- @supabase/supabase-js
- @supabase/ssr

### File parsing
- xlsx

### PDF (if needed)
- pdf-parse or another basic text extraction library

### AI
- openai

### Utilities
- date-fns
- uuid

---

## 27. Suggested `.env` Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

---

## 28. Final Solution Summary

### Selected solution
**Option A:**
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- xlsx
- OpenAI API

### Why this option was chosen
- best fit for a competition project
- quick to build
- attractive UI
- lower complexity
- easy AI integration
- professional enough for presentation

### Architectural mindset
- Excel is the **input source**
- JSON is the **normalization layer**
- PostgreSQL is the **operational data layer**
- AI is the **support layer for understanding descriptions and improving accuracy**
- UI is the **experience layer that makes the system visual and easy to use**

---

## 29. Conclusion

This is a very suitable competition project because it includes:
- a real-world problem
- real data
- clear inefficiencies in the current manual process
- a digitization solution
- meaningful AI support
- strong practical value

The MVP should focus on 3 main values:
1. **Reduce manual lookup time**
2. **Reduce errors in validation and budget code selection**
3. **Support fast report export for accounting**

If implemented according to this document, the demo will be:
- logically sound from a business perspective
- visually strong in UI
- smart enough to make a strong impression
- realistic to complete within competition time

---

## 30. Immediate To-Do List
1. Create a Next.js + Tailwind + shadcn/ui project
2. Create a Supabase project
3. Design the minimum DB tables
4. Build auth
5. Build the admin Excel upload page
6. Implement Excel -> JSON -> DB parser
7. Build the organization validation form
8. Build the description analysis screen
9. Implement the `analyze-description` API
10. Implement basic report export
11. Prepare polished demo data
12. Prepare presentation/demo scenario

---

**End of document.**
