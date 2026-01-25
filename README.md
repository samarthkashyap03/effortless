# Effortless — Proof of Human Work

Effortless is a privacy-first verification platform that proves how a piece of work was created, without ever storing or reading its content.
It generates cryptographic certificates that bind a finished document to an authentic human creation process — allowing anyone to independently verify the work later.

Effortless focuses on process, not output.

## 🔍 What Problem Does This Solve?

AI-generated content has made it difficult to trust whether a piece of writing or code was genuinely produced by a human.
Traditional detectors guess based on text patterns and often produce false positives.

Effortless takes a different approach:

**Instead of analyzing what was written, Effortless verifies how it was written.**

## 🧠 How It Works (High Level)

A user writes inside Effortless’s secure editor.

Effortless observes behavioral signals such as:
- typing rhythm
- pauses and focus intervals
- revision and editing patterns
  (never the text itself).

When the session ends:
1. the document is exported as a PDF to the user
2. a cryptographic hash (SHA-256) of that document is generated
3. That hash is embedded into a verification certificate.

Anyone can later verify that:
- the document matches the certificate
- the document was produced during an authentic human writing session

**Effortless never stores document content.**

## ✅ What Effortless Proves

- The work was created through a natural, human-like writing process
- The verification certificate is bound to this exact document
- Any modification to the document invalidates the certificate

## ❌ What Effortless Does NOT Do

- ❌ Store document text
- ❌ Log raw keystrokes
- ❌ Capture clipboard contents
- ❌ Record screens or background activity
- ❌ Analyze writing quality or meaning
- ❌ Claim originality or absence of AI assistance

Effortless provides process evidence, not judgment.

## 🚀 Key Features

- **Privacy-First Verification**: Zero-knowledge architecture ensures content never leaves the user’s device.
- **Behavioral Signal Analysis**: Uses timing, pauses, and revision patterns that are difficult to fake.
- **Document-Bound Certificates**: Verification certificates are cryptographically linked to the exported document.
- **Independent Verification**: Third parties can verify authenticity without an Effortless account.
- **Modern Dashboard**: Clean, distraction-free UI for managing sessions and reports.
- **Secure Architecture**: Built on Supabase with strict Row Level Security (RLS).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + tailwindcss-animate
- **UI Components**: shadcn/ui 
- **Animations**: Framer Motion
- **Editor**: Tiptap

### State & Data
- **Data Fetching**: TanStack Query
- **Database & Auth**: Supabase
- **Forms & Validation**: React Hook Form + Zod

### Testing & Quality
- **Unit Testing**: Vitest
- **E2E Testing**: Playwright
- **Linting**: ESLint

## 📂 Project Structure

```bash
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn primitives
│   └── ...              # Feature-specific components
├── pages/               # Route-level pages
│   ├── Auth.tsx
│   ├── Sessions.tsx
│   ├── WritingSession.tsx
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── integrations/        # External services (Supabase)
└── App.tsx              # Application entry + routing
```

## 🏁 Getting Started

### Prerequisites
- Node.js v18+
- npm, yarn, or bun

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd effortless
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:8080` (or similar).

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |

## ⚠️ Important Notes

- Certificates are tied to a specific exported document
- Any change to the document after verification invalidates the certificate
- Users are responsible for storing their documents and certificates

## 📄 License

This repository is provided for demonstration and evaluation purposes.
All rights reserved.