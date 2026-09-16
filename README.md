# Text-to-SQL UI

A minimal React interface for testing a fine-tuned GPT-2 Text-to-SQL pipeline. Users can input custom relational schemas, define primary/foreign keys, and generate SQLite queries with automated query-plan validation.

🔗 **Live Demo:** [https://text-to-sql-web-chi.vercel.app](https://text-to-sql-web-chi.vercel.app)  
🤗 **Model Backend:** [https://huggingface.co/spaces/mazoner11/text-to-sql-backend](https://huggingface.co/spaces/mazoner11/text-to-sql-backend)

---

## How It Works

1. **Schema Input:** Users define tables, columns, and foreign keys (or load pre-evaluated Spider benchmark templates).
2. **Inference:** Submits the prompt to a Hugging Face Space running custom GPT-2 weights on ZeroGPU via Gradio SSE queues.
3. **Execution Check:** Displays the predicted SQL alongside an in-memory SQLite compilation status (`✓ Compiles` vs `x Failed`).

---

## Local Development

```bash
npm install
npm run dev