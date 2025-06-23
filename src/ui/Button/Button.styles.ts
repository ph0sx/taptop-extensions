export const buttonStyles = `
  .ttg-button {
    width: 100%;
    padding: 14px 24px 14px 20px;
    gap: 10px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    color: var(--ttg-color-text-white);
    text-align: center;
    font-family: var(--ttg-font-family);
    font-size: var(--ttg-text-size-m);
    font-weight: var(--ttg-font-weight-medium);
    line-height: var(--ttg-text-line-height-m);
    letter-spacing: -0.32px;
  }
  
  .ttg-button--primary {
    background: var(--ttg-color-bg-blue-base);
  }
  
  .ttg-button--primary:hover {
    background: var(--ttg-color-bg-blue-dark);
  }
  
  .ttg-button--primary:focus {
    background: var(--ttg-color-bg-blue-darker);
    outline: none;
  }
  
  .ttg-button--primary:disabled {
    background: var(--ttg-color-bg-gray-100);
    cursor: not-allowed;
  }
  
  /* Secondary Button */
  .ttg-button--secondary {
    border: 1px dashed var(--ttg-color-bg-blue-base);
    background: var(--ttg-color-bg-blue-lighter);
    color: var(--ttg-color-text-blue-base);
  }
  
  .ttg-button--secondary:hover {
    border: 1px dashed var(--ttg-color-bg-blue-base);
    background: #D7E9FE;
  }
  
  .ttg-button--secondary:focus {
    border: 1px dashed var(--ttg-color-bg-blue-base);
    background: linear-gradient(0deg, #D7E9FE 0%, #D7E9FE 100%), #FFF;
    outline: none;
  }
  
  .ttg-button--secondary:disabled {
    border: 1px dashed var(--ttg-color-bg-gray-300);
    background: var(--ttg-color-bg-gray-100);
    color: var(--ttg-color-text-gray-500);
    cursor: not-allowed;
  }
  
  /* Tertiary Button */
  .ttg-button--tertiary {
    background: var(--ttg-color-bg-black);
    color: var(--ttg-color-text-white);
  }
  
  .ttg-button--tertiary:hover {
    background: var(--ttg-color-bg-gray-900);
  }
  
  .ttg-button--tertiary:focus {
    background: var(--ttg-color-bg-gray-900);
    outline: none;
  }
  
  .ttg-button--tertiary:disabled {
    background: var(--ttg-color-bg-gray-100);
    color: var(--ttg-color-text-gray-500);
    cursor: not-allowed;
  }
`;
