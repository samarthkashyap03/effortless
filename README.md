# Effortless — Proof of Human Work

I built Effortless after noticing how difficult it has become to distinguish between content created by a person and content generated entirely by AI.

Most existing solutions try to analyze the final output and decide whether it "looks AI-generated." The problem is that these approaches are often unreliable and can produce false positives.

Instead of focusing on the content itself, I wanted to explore a different question:

**Can we verify the process behind a piece of work without ever seeing or storing the work itself?**

Effortless is my attempt at solving that problem.

The application generates a cryptographic certificate that links a finished document to a real writing session. Rather than analyzing the text, it observes non-content signals such as writing activity, editing behavior, and revision patterns. The document remains private and is never stored by the platform.

## The Idea

When a user writes inside the editor, Effortless collects behavioral signals that indicate a genuine writing process.

Examples include:

* Writing rhythm
* Pause patterns
* Editing and revision behavior
* Session activity over time

Importantly, the application does **not** store the document text, raw keystrokes, clipboard contents, or screen recordings.

Once the writing session is complete:

1. The document is exported as a PDF.
2. A SHA-256 hash is generated from the exported file.
3. A verification certificate is created and bound to that hash.

Because the certificate is tied to the exact document hash, any modification to the document will invalidate the verification.

## What I Learned

This project gave me hands-on experience with:

* Designing privacy-first systems that minimize data collection
* Applying cryptographic hashing for document verification
* Building rich text editing experiences with Tiptap
* Implementing authentication and secure data access with Supabase
* Working with Row Level Security (RLS)
* Testing React applications using Vitest and Playwright
* Building modern TypeScript applications with a strong focus on developer experience

## Challenges

One of the biggest challenges was balancing verification with privacy.

Many verification systems become more accurate by collecting more information. I wanted to explore how much confidence could be achieved while collecting as little information as possible.

Another challenge was designing a workflow that produces useful verification evidence without storing document content or requiring users to trust a centralized reviewer.

## Tech Stack

**Frontend**

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Tiptap
* shadcn/ui

**Backend & Data**

* Supabase
* PostgreSQL
* Supabase Authentication
* Row Level Security (RLS)

## Disclaimer

Effortless does not prove originality, authorship, or the absence of AI assistance.

It simply provides evidence that a document was produced through a recorded writing process and that the document has not been modified since verification.
