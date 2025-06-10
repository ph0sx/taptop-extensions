// src/components/cookie/CookieGenerator.styles.ts

export const styles = `
:host {
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
}
.generator-form {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-control {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
label {
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}
.gen-btn {
  padding: 10px 15px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}
.gen-btn:hover {
  background-color: #0056b3;
}
.output-area {
  margin-top: 24px;
}
.code-output {
  display: block;
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Courier New', Courier, monospace;
  color: #333;
}
`;
