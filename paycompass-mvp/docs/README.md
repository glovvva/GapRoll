# PayCompass Pro - Documentation Index

**Version:** 2.0  
**Last Updated:** 2026-02-03

---

## 📚 Documentation Structure

This folder contains the complete technical documentation for PayCompass Pro. Each document serves a specific purpose and audience.

---

### 1. **PRD.md** - Product Requirements Document
**Audience:** Product Team, Stakeholders, New Developers  
**Purpose:** Defines WHAT we're building and WHY

**Key Sections:**
- Executive Summary (business case)
- Core Modules (Data Vault, Art. 16, EVG Engine, Solio Solver, B2B Equalizer)
- User Personas (HR Manager, CFO, Legal Officer)
- Technical Requirements (performance, security, scalability)
- Roadmap (MVP → EU Compliance → AI → Enterprise)
- Competitive Landscape (vs. Syndio, Pequity, Pave)

**When to read:** Before starting any new feature to ensure alignment with product vision.

---

### 2. **TECH_STACK.md** - Technology Choices & Dependencies
**Audience:** Developers, DevOps, Technical Leads  
**Purpose:** Documents HOW we build (tech stack, APIs, architecture)

**Key Sections:**
- Frontend Framework (Streamlit - correct API usage)
- Backend & Database (Supabase, PostgreSQL, RLS policies)
- Data Visualization (Plotly configuration)
- Authentication (Streamlit Session State + Supabase Auth)
- AI Integration (LangChain + OpenAI GPT-4o)
- PDF Generation (ReportLab templates)
- Deployment (local dev vs. production)

**When to read:** Before adding new dependencies or integrating external services.

---

### 3. **FRONTEND_GUIDELINES.md** - UI/UX Standards & Best Practices
**Audience:** Frontend Developers, Designers, AI Agents  
**Purpose:** Ensures visual consistency and accessibility

**Key Sections:**
- Design Philosophy (High-Trust Financial aesthetic)
- Color System (dark mode palette, WCAG compliance)
- Typography (Inter + JetBrains Mono, type scale)
- Streamlit Component Styling (CSS overrides, correct APIs)
- Layout & Spacing (grid system, responsive design)
- Interactive Elements (buttons, inputs, data tables)
- Charts & Visualizations (Plotly styling, color consistency)
- Accessibility (contrast ratios, keyboard navigation)
- Common Pitfalls & Solutions (black screen, invisible text, etc.)

**When to read:** Before creating any UI components or modifying styles.

---

### 4. **BACKEND_STRUCTURE.md** - Database Schema & Multi-Tenancy
**Audience:** Backend Developers, Database Administrators  
**Purpose:** Documents data model and security architecture

**Key Sections:**
- Multi-Tenancy Strategy (RLS implementation)
- Database Schema (tables: users, organizations, projects, employees)
- RLS Policies (data isolation enforcement)
- Database Functions (Python wrappers in db_manager.py)
- Data Migration Strategy (Supabase migrations)
- Performance Optimization (indexes, query patterns)
- Security Best Practices (SQL injection prevention, env vars)

**When to read:** Before modifying database schema or adding new tables.

---

### 5. **LESSONS.md** - Critical Mistakes & Solutions
**Audience:** ALL Developers, AI Agents (MANDATORY READING)  
**Purpose:** Prevent repeating past mistakes (debugging handbook)

**Structure:**
- 🔴 **CRITICAL LESSONS** (5 must-read lessons - cost: hours of debugging)
  - Lesson #1: Never use `st.stop()` before rendering content
  - Lesson #2: Always explicitly set text color in dark mode
  - Lesson #3: Use `use_container_width=True` (not deprecated API)
  - Lesson #4: Always check `os.path.exists()` before loading files
  - Lesson #5: Use `st.session_state` for navigation (not URL params)
- ⚠️ **HIGH-PRIORITY LESSONS** (15+ lessons - common pitfalls)
- 📊 **DATA PROCESSING LESSONS** (Pandas best practices)
- 🎨 **UI/UX LESSONS** (Streamlit component patterns)
- 🔐 **SECURITY LESSONS** (RODO, RLS, authentication)
- 📈 **PERFORMANCE LESSONS** (caching, batch operations)
- 🐛 **DEBUGGING LESSONS** (diagnostic techniques)

**When to read:** 
- **BEFORE touching any code** (read CRITICAL LESSONS at minimum)
- When encountering a bug (search by symptom)
- After fixing a bug (add new lesson to prevent recurrence)

---

## 🔗 Related Files (Root Directory)

### **graphrag.md** (Root Folder)
**Audience:** AI Agents, New Developers  
**Purpose:** Knowledge graph showing relationships between docs, code, and features

**Key Sections:**
- Document Hierarchy (how docs relate to code files)
- Code Module Relationships (app.py → logic.py → db_manager.py)
- Feature → Code Mapping (which function implements which feature)
- Data Flow Architecture (sequence diagrams)
- UI Component Tree (Streamlit widget hierarchy)
- Critical File Sections (line ranges for fast navigation)
- Common Debugging Paths (symptom → solution)

**When to read:** 
- When new to the codebase (understand structure quickly)
- When debugging (find relevant code/docs fast)
- When adding features (understand impact on other modules)

---

### **progress.txt** (Root Folder)
**Audience:** Product Team, Developers, Stakeholders  
**Purpose:** High-level project status and milestone tracking

**Key Sections:**
- Phase 1: MVP & Context Engineering (✅ COMPLETED)
- Phase 2: EU Compliance (🔄 IN PROGRESS - 60% complete)
- Phase 3: AI + Automation (📅 PLANNED)
- Phase 4: Enterprise Features (📅 PLANNED)
- Known Issues & Tech Debt
- Metrics & KPIs
- Changelog (major milestones)
- Next Session Agenda

**When to read:**
- Daily standup / sprint planning
- When prioritizing tasks
- When reporting to stakeholders

---

## 📋 Quick Reference: Which Doc to Read When

| Scenario | Recommended Document | Priority |
|----------|----------------------|----------|
| Starting new feature | PRD.md → graphrag.md → TECH_STACK.md | High |
| Fixing UI bug | LESSONS.md → FRONTEND_GUIDELINES.md | Critical |
| Debugging data issue | LESSONS.md → TECH_STACK.md (Pandas section) | High |
| Adding new database table | BACKEND_STRUCTURE.md | High |
| Modifying styles | FRONTEND_GUIDELINES.md | Medium |
| Understanding project status | progress.txt | Low |
| Onboarding new developer | README.md (this file) → LESSONS.md → graphrag.md | Critical |
| AI agent code generation | LESSONS.md → FRONTEND_GUIDELINES.md → TECH_STACK.md | Critical |

---

## 🚀 Getting Started (New Developer Onboarding)

**Day 1: Context & Architecture**
1. Read this `README.md` (you are here!)
2. Read `PRD.md` - Understand what we're building
3. Read `graphrag.md` - Understand codebase structure
4. Skim `progress.txt` - Understand current phase

**Day 2: Technical Deep Dive**
1. Read `TECH_STACK.md` - Understand technology choices
2. Read `BACKEND_STRUCTURE.md` - Understand data model
3. Set up local environment (follow TECH_STACK.md instructions)
4. Run app locally, explore UI

**Day 3: Standards & Best Practices**
1. **READ ENTIRE `LESSONS.md`** (especially CRITICAL LESSONS) ⚠️ MANDATORY
2. Read `FRONTEND_GUIDELINES.md` - Understand UI patterns
3. Review `styles.py` to see CSS overrides in practice
4. Make first small contribution (fix typo, improve comment)

**Week 2: First Feature**
1. Pick small task from `progress.txt` "Next Session Agenda"
2. Reference relevant docs (use table above)
3. Create branch, implement, test
4. Code review (checklist in FRONTEND_GUIDELINES.md Section 11)
5. Merge & update `progress.txt`

---

## 🤖 AI Agent Guidelines

**Before generating code:**
1. Search `LESSONS.md` for related symptoms/patterns (avoid known pitfalls)
2. Check `FRONTEND_GUIDELINES.md` for correct API usage (e.g., `use_container_width`)
3. Reference `graphrag.md` to understand which file to modify

**When generating code:**
1. Follow patterns from `TECH_STACK.md` (e.g., Plotly config, Pandas operations)
2. Apply color system from `FRONTEND_GUIDELINES.md` (use variables)
3. Use type hints (see `TECH_STACK.md` Section 11)

**After generating code:**
1. Cite lesson/doc section in explanation (e.g., "Per Lesson #4, added os.path.exists() check")
2. Run through code review checklist (`FRONTEND_GUIDELINES.md` Section 11)
3. Update `graphrag.md` if new relationships added

---

## 📝 Document Maintenance

**Who updates what:**
- `PRD.md`: Product Owner (feature spec changes)
- `TECH_STACK.md`: Tech Lead (new dependencies, architecture changes)
- `FRONTEND_GUIDELINES.md`: Frontend Lead (new UI patterns, style updates)
- `BACKEND_STRUCTURE.md`: Backend Lead (schema changes, new tables)
- `LESSONS.md`: ALL Developers + AI Agents (when bug discovered/fixed)
- `graphrag.md`: ALL Developers (when code structure changes)
- `progress.txt`: Product Owner + Lead Developer (daily/weekly)

**Review Schedule:**
- Weekly: `progress.txt`, `LESSONS.md` (active development phase)
- Monthly: All other docs (ensure accuracy)
- Quarterly: Major revision (after phase completion)

---

## 🔗 External Resources

**Official Documentation:**
- [Streamlit Docs](https://docs.streamlit.io/)
- [Supabase Docs](https://supabase.com/docs)
- [Plotly Python](https://plotly.com/python/)
- [Pandas User Guide](https://pandas.pydata.org/docs/user_guide/)

**EU Directive:**
- [Directive 2023/970 (Official Text)](https://eur-lex.europa.eu/eli/dir/2023/970/oj)
- [Art. 4: Equal Value Groups](https://eur-lex.europa.eu/eli/dir/2023/970/oj#d1e1206-1-1)
- [Art. 16: Reporting Obligations](https://eur-lex.europa.eu/eli/dir/2023/970/oj#d1e1832-1-1)

**Design Resources:**
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Inter Font](https://rsms.me/inter/)
- [JetBrains Mono Font](https://www.jetbrains.com/lp/mono/)

---

**Document Owner:** Engineering Team  
**Contributors:** All Developers, AI Agents  
**Last Review:** 2026-02-03  
**Next Review:** 2026-03-01
