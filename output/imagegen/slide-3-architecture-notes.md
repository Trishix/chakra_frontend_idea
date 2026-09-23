# Technical architecture companion

## Status and evidence
The active entrypoint is index.html. It loads React 18, React DOM, History 5, React Router 6.3.0, Babel Standalone 6 and Tailwind through CDN scripts. It uses MemoryRouter, component state, inline sample records and a custom SVG graph. Its graph filters, inspector and JSON export share the same node/edge dataset. Camera results and review controls demonstrate the workflow; they do not implement a video search service or production evidence handling.

The older src/ application and README describe a different frontend. Do not attribute its localStorage persistence, PDF reports or React Flow renderer to the active index.html. The technical architecture question bank describes the proposed backend.

## Technology inventory
| Status | Technologies | Role |
| --- | --- | --- |
| Active page | HTML, CSS, JavaScript, JSX | Page structure, styling and interaction |
| Active page | React 18, React DOM | Render views and manage component state |
| Active page | React Router 6.3.0, History 5, MemoryRouter | In-memory navigation |
| Active page | Babel Standalone 6 | Browser JSX compilation |
| Active page | Tailwind CDN, Forms, Container Queries | Utility styles and plugins requested by the page |
| Active page | SVG, browser Blob/Object URL APIs | Connection graph, pan/zoom and JSON download |
| Active page | IBM Plex Sans, JetBrains Mono, Material Symbols | Typography and icons |
| Tooling | Node.js, npm, Vite 7, TypeScript 5.9, @vitejs/plugin-react | Development and build configuration |
| Older frontend | React 19, React DOM 19, @xyflow/react (React Flow) | Earlier app and graph renderer |
| Older frontend | @radix-ui/react-dialog, @phosphor-icons/react | Dialogs and icons |
| Older frontend | jsPDF, @fontsource/ibm-plex-sans | PDF generation and bundled font |
| Development | Vitest, @playwright/test, React type packages | Unit/browser tests and type checking |
| Proposed | Python, FastAPI, ETL | Ingestion workers and application gateway |
| Proposed | OCR, multilingual NLP/NER, relation extraction, entity resolution | Extract and reconcile source details; model selections remain open |
| Proposed | LLMs, GraphRAG | Retrieve scoped evidence and produce source-linked answers |
| Proposed | Graphiti, Neo4j | Temporal graph construction and relationship storage |
| Proposed | PostgreSQL, object storage | Metadata, workflow records and original files |
| Proposed addition | Video segmentation, visual descriptions, OCR, embeddings, vector index | Semantic video retrieval; Twelve Labs and LanceDB proposed in the Canva deck |
| Proposed deployment | Docker, approved on-prem infrastructure | Package and operate services |

GraphRAG, OCR, ETL and NER name techniques or service functions, not specific installed products.

## Records pipeline
1. An investigator imports authorized files or records through approved adapters: CCTNS/ICJS exports, FIR PDFs, statements, CDRs, payments, registries and permitted OSINT.
2. Ingestion validates inputs, hashes originals and records source ID, case ID, officer/origin, timestamp and access scope. Originals remain separate from derived results.
3. Extraction workers read text or run OCR, extract entities and relations, and retain references to source fragments.
4. Entity resolution proposes matches using identifiers and context. Ambiguous matches require review.
5. Graphiti and Neo4j form the proposed temporal relationship layer. PostgreSQL holds metadata and workflow records; object storage holds originals.
6. FastAPI applies scope checks to retrieval. Analytics and GraphRAG return evidence paths, not unsupported identity or guilt claims.

## Semantic video lake — proposed addition
This subsystem is absent from the current implementation.

Ingestion stores original camera footage with a hash, camera identifier, recording time, location, case scope and retention metadata. Workers create timestamped segments and keyframes. Derived descriptions, visible-text OCR and embeddings support search.

Store originals and derived media in object storage, segment metadata in PostgreSQL, embeddings in a vector index and evidence relationships in Neo4j. Keep these linked by stable source and segment identifiers. Preserve original timestamps and record clock/timezone uncertainty when available.

For retrieval, FastAPI checks case access, combines a text query with camera/location/time filters, and searches only authorized segments. Results include the clip, source identifier, start/end time and match explanation. Semantic similarity suggests relevance; it does not establish identity.

An investigator watches a result and attaches the segment to a lead. Camera search opens the clip; Timeline places it alongside calls/payments; the graph links the segment to a camera, source recording and candidate vehicle/event. Review records the investigator's decision and reason.

The existing Canva page names Twelve Labs and LanceDB as proposed video technologies; retain them as proposed. OCR engine and queue implementation remain unselected. The slide must not imply a specific vendor or live streaming implementation.

## Evidence graph
Active sample graph categories: Person, Phone, Account, Vehicle, Case and Camera. Proposed additions include aliases, devices, organizations, addresses, locations, events, documents, modus-operandi patterns and video segments.

Relations include source ID, case ID, timestamp/time range, recorded-versus-suggested status, confidence when applicable, and access scope. Solid edges represent recorded relationships; dashed amber edges represent suggested relationships. A confidence value is not a probability of guilt.

## Investigator workflow
Case overview → Case connections → Camera search → Timeline → Review.

The reviewer opens supporting sources, records a reason, and approves or rejects the lead. Approved leads can enter a source-linked report. Corrections enter a review queue and version history; they do not trigger automatic retraining. Proposed audit events record the actor, action, scope, time and result.

## Proposed controls
Case-scoped RBAC/ABAC, field masking, encryption in transit/at rest, provenance, audit history, retention controls, watermarked exports and supervisor review for sensitive joins. These are engineering requirements, not implemented security guarantees or legal certifications.

## Evaluation plan
The supplied reference proposes a synthetic corpus of 500 FIRs, 2,000 people, 100,000 CDR events, 20,000 transactions and 8–10 planted networks. These are targets, not generated datasets or achieved results.

Candidate evaluation resources from the reference: IndicNER, Enron-style communication graphs, Elliptic-style transaction graphs and synthetic covert networks. Confirm availability, licensing and relevance before use; these are not installed dependencies.

Measure NER F1; entity-resolution precision/recall/F1; case-link Precision@K and Recall@K; false positives; provenance coverage; graph latency at 100,000 and 1,000,000 edges; reviewer overrides; and language/subgroup errors. For the video branch, evaluate retrieval Precision@K/Recall@K, temporal segment relevance, source/time-range correctness and search latency on labeled clips. Do not publish numeric claims without measurements.

## Presentation checks
Omit the product name; retain dotGitIgnore and the supplied SIH branding. Separate active, older and proposed technologies. Check pipeline direction, readable labels, source-linked video retrieval and explicit human review. The slide is an architecture proposal grounded in repo inspection, not evidence that the proposed services run.


## Video documentation checked
- Twelve Labs clip embeddings and time ranges: https://docs.twelvelabs.io/docs/guides/create-embeddings/at-scale/video
- LanceDB metadata-filtered vector search: https://docs.lancedb.com/search/filtering

The slide proposes using these capabilities together; the repository does not implement this integration. External model processing needs an approved deployment arrangement; the on-prem proposal does not establish that Twelve Labs runs on-prem.
