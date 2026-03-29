\"use client\";

import { useMemo, useState } from \"react\";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(\"\");
  const [extractedText, setExtractedText] = useState(\"\");

  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE || \"http://localhost:8000\",
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(\"Select a PDF or TXT file first.\");
      return;
    }
    setError(\"\");
    setExtractedText(\"\");
    setIsUploading(true);

    const formData = new FormData();
    formData.append(\"file\", selectedFile);

    try {
      const response = await fetch(`${apiBase}/analyze/upload`, {
        method: \"POST\",
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message =
          payload?.detail || \"Upload failed. Please try another file.\";
        throw new Error(message);
      }

      const payload = await response.json();
      setExtractedText(payload.raw_text || \"\");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : \"Unexpected upload error.\";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="page">
      <section className="hero">
        <h1>Smart CV Optimizer</h1>
        <p>Upload your CV to extract clean text for the optimizer.</p>
        <div className="upload-card">
          <label className="file-input">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] || null)
              }
            />
            <span>
              {selectedFile ? selectedFile.name : \"Choose PDF or TXT file\"}
            </span>
          </label>
          <button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? \"Extracting...\" : \"Upload & Extract\"}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </div>
        {extractedText ? (
          <div className="result">
            <h2>Extracted Text</h2>
            <textarea readOnly value={extractedText} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
