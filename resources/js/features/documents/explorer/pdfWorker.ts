import { pdfjs } from 'react-pdf';

import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// PDF.js worker is bundled locally by Vite (no CDN, no public URL). The
// worker source is configured once at module scope — importing this module
// is enough; PdfDocumentViewer never touches GlobalWorkerOptions itself.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
