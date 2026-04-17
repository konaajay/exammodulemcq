import React, { useState, useEffect } from "react";

const QuestionForm = ({ type, onAdd, initialData, onCancel }) => {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [options, setOptions] = useState(initialData?.options || [
    { text: "", image: null },
    { text: "", image: null },
    { text: "", image: null },
    { text: "", image: null }
  ]);
  const [correctOption, setCorrectOption] = useState(initialData?.correctOption !== undefined ? initialData.correctOption : null);
  const [marks, setMarks] = useState(initialData?.marks || (type === 'coding' ? 10 : 5));
  const [image, setImage] = useState(initialData?.image || null);
  const [referenceAnswer, setReferenceAnswer] = useState(initialData?.referenceAnswer || "");
  const [evaluationGuidelines, setEvaluationGuidelines] = useState(initialData?.evaluationGuidelines || "");
  const [showBulkOptions, setShowBulkOptions] = useState(false);

  // Coding Specific State
  const [codeLanguage, setCodeLanguage] = useState(initialData?.language || "javascript");
  const [starterCode, setStarterCode] = useState(initialData?.starterCode || "// Write your solution here...");
  const [testCases, setTestCases] = useState(initialData?.testCases || []);

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || "");
      setOptions(initialData.options || [
        { text: "", image: null },
        { text: "", image: null },
        { text: "", image: null },
        { text: "", image: null }
      ]);
      setCorrectOption(initialData.correctOption !== undefined ? initialData.correctOption : null);
      setMarks(initialData.marks || (type === 'coding' ? 10 : 5));
      setImage(initialData.image || null);
      setReferenceAnswer(initialData.referenceAnswer || "");
      setEvaluationGuidelines(initialData.evaluationGuidelines || "");
      setCodeLanguage(initialData.language || "javascript");
      setStarterCode(initialData.starterCode || "// Write your solution here...");
      setTestCases(initialData.testCases || []);
    }
  }, [initialData, type]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!question.trim()) return;

    let payload = { type, question, image, marks: parseInt(marks) || 0 };

    if (type === "quiz") {
      if (correctOption === null && options.some(o => o.text.trim() !== "")) {
        // Validation
      }
      payload.options = options.map(opt => ({
        text: opt.text,
        image: opt.image
      }));
      payload.correctOption = correctOption;
    } else if (type === "coding") {
      payload.language = codeLanguage;
      payload.starterCode = starterCode;
      payload.testCases = testCases;
    } else if (["short", "long", "abacus"].includes(type)) {
      payload.referenceAnswer = referenceAnswer;
      payload.evaluationGuidelines = evaluationGuidelines;
    }

    onAdd(payload);

    // reset form
    setQuestion("");
    setOptions([
      { text: "", image: null },
      { text: "", image: null },
      { text: "", image: null },
      { text: "", image: null }
    ]);
    setCorrectOption(null);
    setMarks(type === 'coding' ? 10 : 5);
    setImage(null);
    setReferenceAnswer("");
    setEvaluationGuidelines("");
    setStarterCode("// Write your solution here...");
    setTestCases([]);
  };

  return (
    <div className="bg-white p-4">
      {/* Header with Type and Marks */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span className={`badge rounded-pill px-3 py-2 ${type === 'quiz' ? 'bg-primary bg-opacity-10 text-primary' :
            type === 'coding' ? 'bg-dark text-white' :
              type === 'abacus' ? 'bg-danger bg-opacity-10 text-danger' :
                type === 'short' ? 'bg-info bg-opacity-10 text-info' :
                  'bg-warning bg-opacity-10 text-dark'
            }`}>
            <i className={`bi ${type === 'quiz' ? 'bi-list-ul' :
              type === 'coding' ? 'bi-code-slash' :
                type === 'abacus' ? 'bi-calculator' :
                  type === 'short' ? 'bi-text-paragraph' : 'bi-journal-text'
              } me-2`}></i>
            {type === 'quiz' ? 'Multiple Choice' : type === 'coding' ? 'Coding Challenge' : type === 'abacus' ? 'Abacus / Mental Math' : type === 'short' ? 'Short Answer' : 'Long Essay'}
          </span>
        </div>
        <div className="d-flex align-items-center">
          <label className="text-muted small fw-bold me-2 text-uppercase ls-1">Marks:</label>
          <input
            type="number"
            min="1"
            className="form-control form-control-sm text-center fw-bold border-0 bg-light text-primary"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            style={{ width: "60px" }}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label text-muted small fw-bold text-uppercase ls-1">Question Text</label>
        <textarea
          className="form-control border-1 bg-light bg-opacity-10 shadow-none focus-ring p-3"
          style={{ resize: "none", borderRadius: '12px', border: '1px solid #dee2e6' }}
          rows="3"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Enter your ${type === 'quiz' ? 'choice' : ''} question here...`}
        ></textarea>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="form-label text-muted small fw-bold text-uppercase ls-1 d-flex justify-content-between">
          <span>Attachment <span className="text-secondary fw-normal text-capitalize">(Optional)</span></span>
          {image && <button onClick={() => setImage(null)} className="btn btn-link p-0 text-danger small text-decoration-none">Remove</button>}
        </label>

        {!image ? (
          <div className="position-relative">
            <input
              type="file"
              accept="image/*"
              className="form-control opacity-0 position-absolute w-100 h-100"
              style={{ cursor: "pointer", zIndex: 5 }}
              onChange={handleImageChange}
            />
            <div className="border border-dashed border-2 rounded-3 p-4 text-center bg-light bg-opacity-50 transition-all hover-bg-light">
              <i className="bi bi-cloud-upload text-primary fs-3 mb-2 d-block"></i>
              <span className="text-muted small fw-medium">Drop image here or click to upload reference</span>
            </div>
          </div>
        ) : (
          <div className="position-relative border rounded-3 overflow-hidden bg-light text-center p-2 shadow-sm">
            <img src={image} alt="Preview" style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain", borderRadius: '4px' }} />
          </div>
        )}
      </div>

      {/* Options for Quiz */}
      {type === "quiz" && (
        <div className="mb-4 animate-fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase ls-1 mb-0">
              Answer Options
            </label>
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className={`btn btn-sm ${showBulkOptions ? 'btn-primary' : 'btn-outline-primary'} py-0 px-2 rounded-pill`}
                onClick={() => setShowBulkOptions(!showBulkOptions)}
              >
                <i className={`bi ${showBulkOptions ? 'bi-list-ul' : 'bi-textarea-t'} me-1`}></i>
                {showBulkOptions ? 'Individual View' : 'Bulk Add Options'}
              </button>
              {!showBulkOptions && (
                <button 
                  type="button" 
                  className="btn btn-outline-success btn-sm py-0 px-2 rounded-pill"
                  onClick={() => setOptions([...options, { text: "", image: null }])}
                >
                  <i className="bi bi-plus-lg me-1"></i> Add Option
                </button>
              )}
            </div>
          </div>

          <p className="text-muted fw-normal mb-3 text-capitalize small">
            {showBulkOptions 
              ? "Paste your options here, one per line. We'll automatically convert them to choices." 
              : "(Select the radio button for the correct answer)"}
          </p>

          {showBulkOptions ? (
            <textarea
              className="form-control border-1 bg-light bg-opacity-10 shadow-none p-3 font-monospace small"
              style={{ borderRadius: '12px', minHeight: '150px' }}
              placeholder="Option A&#10;Option B&#10;Option C..."
              value={options.map(o => o.text).join('\n')}
              onChange={(e) => {
                const lines = e.target.value.split('\n');
                setOptions(lines.map(line => ({ text: line, image: null })));
              }}
            ></textarea>
          ) : (
            <div className="vstack gap-3">
              {options.map((opt, i) => (
                <div key={i} className={`card border-2 transition-all ${correctOption === i ? 'border-success bg-success bg-opacity-10 shadow-sm' : 'border-light bg-light bg-opacity-50'}`}>
                  <div className="card-body p-2 d-flex align-items-start gap-2">
                    <div className="form-check mt-2 ms-1">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="correctOption"
                        checked={correctOption === i}
                        onChange={() => setCorrectOption(i)}
                        style={{ cursor: "pointer", width: '1.2rem', height: '1.2rem' }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex gap-2">
                        <input
                          className="form-control border-0 bg-transparent fw-medium"
                          placeholder={`Option ${i + 1}`}
                          value={opt.text}
                          onChange={(e) => {
                            const copy = [...options];
                            copy[i].text = e.target.value;
                            setOptions(copy);
                          }}
                        />
                        {options.length > 2 && (
                          <button 
                            type="button" 
                            className="btn btn-link text-danger p-0 pt-1 text-decoration-none"
                            onClick={() => {
                              const copy = options.filter((_, idx) => idx !== i);
                              setOptions(copy);
                              if (correctOption === i) setCorrectOption(null);
                              else if (correctOption > i) setCorrectOption(prev => prev - 1);
                            }}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}
                      </div>

                      {/* Image Attachment for Option */}
                      <div className="mt-2 px-1">
                        {!opt.image ? (
                          <div className="position-relative d-inline-block">
                            <input
                              type="file"
                              accept="image/*"
                              className="position-absolute w-100 h-100 opacity-0"
                              style={{ cursor: 'pointer', zIndex: 2 }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const copy = [...options];
                                    copy[i].image = reader.result;
                                    setOptions(copy);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <button className="btn btn-sm btn-outline-secondary border-0 py-1 px-2 d-flex align-items-center gap-1">
                              <i className="bi bi-image small"></i>
                              <span style={{ fontSize: '0.75rem' }}>Add Image</span>
                            </button>
                          </div>
                        ) : (
                          <div className="position-relative d-inline-block border rounded bg-white p-1 shadow-sm">
                            <img src={opt.image} alt="Option" style={{ maxHeight: "80px", maxWidth: "120px", display: 'block' }} />
                            <button
                              onClick={() => {
                                const copy = [...options];
                                copy[i].image = null;
                                setOptions(copy);
                              }}
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                              style={{ width: '18px', height: '18px', transform: 'translate(40%, -40%)', borderRadius: '50%' }}
                            >
                              <i className="bi bi-x small"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coding Question Specifics */}
      {type === "coding" && (
        <div className="mb-4 animate-fade-in">
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase ls-1">Target Language</label>
            <select className="form-select border-0 bg-light shadow-sm" value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)}>
              <option value="javascript">JavaScript / Node.js</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="html">HTML / CSS</option>
              <option value="sql">SQL</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="all">Any / Pseudo-code</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase ls-1">Starter Code / Template</label>
            <textarea
              className="form-control font-monospace small bg-dark text-light border-0"
              rows="6"
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              spellCheck="false"
            ></textarea>
            <div className="form-text small">This code will be presented to the student as a starting point.</div>
          </div>

          {/* Test Cases Section */}
          <div className="mb-3">
            <label className="form-label text-muted small fw-bold text-uppercase ls-1 d-flex justify-content-between align-items-center">
              Test Cases
              <button
                type="button"
                className="btn btn-sm btn-outline-primary py-0"
                onClick={() => setTestCases([...testCases, { input: "", output: "" }])}
              >
                <i className="bi bi-plus"></i> Add Case
              </button>
            </label>
            <div className="vstack gap-2">
              {testCases.map((tc, idx) => (
                <div key={idx} className="d-flex gap-2">
                  <div className="flex-grow-1">
                    <input
                      className="form-control form-control-sm font-monospace bg-light"
                      placeholder="Input (e.g. 5, 10)"
                      value={tc.input}
                      onChange={(e) => {
                        const copy = [...testCases];
                        copy[idx].input = e.target.value;
                        setTestCases(copy);
                      }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <input
                      className="form-control form-control-sm font-monospace bg-light"
                      placeholder="Expected Output (e.g. 15)"
                      value={tc.output}
                      onChange={(e) => {
                        const copy = [...testCases];
                        copy[idx].output = e.target.value;
                        setTestCases(copy);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${tc.isHidden ? 'btn-secondary text-white' : 'btn-outline-secondary'}`}
                    title={tc.isHidden ? "Hidden from students" : "Visible to students"}
                    onClick={() => {
                      const copy = [...testCases];
                      copy[idx].isHidden = !copy[idx].isHidden;
                      setTestCases(copy);
                    }}
                    style={{ width: '36px' }}
                  >
                    <i className={tc.isHidden ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))}
                    style={{ width: '36px' }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
              {testCases.length === 0 && (
                <div className="text-muted small fst-italic text-center py-2 border border-dashed rounded">
                  No test cases added.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reference Answer for Evaluation */}
      {(type === "short" || type === "long" || type === "abacus") && (
        <div className="mb-4 animate-fade-in">
          <div className="card border-0 bg-primary bg-opacity-5 rounded-4 p-4 border border-primary border-opacity-10">
            <div className="mb-3">
              <label className="form-label text-primary small fw-bold text-uppercase ls-1 d-flex align-items-center">
                <i className="bi bi-shield-check me-2"></i>
                {type === 'abacus' ? 'Correct Numeric Answer' : 'Reference Answer (Model Solution)'}
              </label>
              {type === 'abacus' ? (
                <input
                  type="number"
                  className="form-control border-1 shadow-none fw-bold text-primary p-3"
                  style={{ borderRadius: '12px' }}
                  value={referenceAnswer}
                  onChange={(e) => setReferenceAnswer(e.target.value)}
                  placeholder="Enter correct result..."
                />
              ) : (
                <textarea
                  className="form-control border-1 shadow-none p-3"
                  style={{ borderRadius: '12px', minHeight: '120px' }}
                  rows="4"
                  value={referenceAnswer}
                  onChange={(e) => setReferenceAnswer(e.target.value)}
                  placeholder="Enter the expected answer or key points for automated/manual evaluation..."
                ></textarea>
              )}
            </div>

            <div className="mb-0">
              <label className="form-label text-muted small fw-bold text-uppercase ls-1 d-flex align-items-center">
                <i className="bi bi-journal-text me-2"></i>
                Evaluation Guidelines <span className="text-secondary fw-normal ms-1 fs-xs">(AI Training Context)</span>
              </label>
              <textarea
                className="form-control border-1 shadow-none p-3"
                style={{ borderRadius: '12px', fontSize: '0.9rem' }}
                rows="2"
                value={evaluationGuidelines}
                onChange={(e) => setEvaluationGuidelines(e.target.value)}
                placeholder="e.g. Award full marks if student includes 'X' keyword..."
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2 mt-4">
        {initialData && (
          <button
            type="button"
            className="btn btn-outline-secondary px-4 py-3 fw-bold rounded-pill"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          className={`btn btn-${initialData ? 'success' : 'primary'} flex-grow-1 py-3 fw-bold rounded-pill shadow-sm transition-all hover-translate-y d-flex align-items-center justify-content-center`}
          onClick={handleAdd}
          disabled={!question.trim() || (type === 'quiz' && (correctOption === null || !options[correctOption]?.text?.trim()))}
        >
          <i className={initialData ? "bi bi-check-circle me-2 fs-5" : "bi bi-plus-circle-fill me-2 fs-5"}></i>
          {initialData ? "Update Question" : "Add to Exam Paper"}
        </button>
      </div>

      <style>{`
        .ls-1 { letter-spacing: 0.5px; }
        .fs-xs { font-size: 0.7rem; }
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
        .focus-ring:focus { box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15); border-color: #0d6efd; }
        .hover-translate-y:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

export default QuestionForm;
