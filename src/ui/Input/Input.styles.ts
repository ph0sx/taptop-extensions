export const styles = `
* {
  box-sizing: border-box;
}
/* TODO УБРАТЬ ПОТОМ ПРИДУМАТЬ ДРУГОЙ СПОСОБ СДЕЛАТЬ BORDER BOX компонентам */
/* TODO ПРИДУМАТЬ КАК СБРОСИТЬ СТИЛИ ВЕБ КОМПОНЕНТАМ */

/* COMMON WRAPPER */
.ttg-input-wrapper {
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ======== LABEL ============ */

/* LABEL GROUP */
.ttg-input-wrapper label {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* REQUIRED ICON */
.ttg-input-required {
  display: none;
  color: var(--red, #ff2b71);
}

/* ======== INPUT ============ */

/* INPUT GROUP */
.ttg-input-field {
  position: relative;
  min-height: 52px;
  padding: 16px 12px 16px 16px;
  border-radius: 10px;
  background: var(--grey-100, #f5f5f5);
  border: 1px solid transparent;
  transition: border-color 0.3s ease;
  color: var(--grey-900, #666);
}

/* INPUT ELEMENT */
.ttg-input-control {
  outline: none;
  border: none;
  background: transparent;
  padding: 0;
  width: 100%;
  height: 20px; /* соответствует line-height */
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.28px;
  color: inherit;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

/* INPUT PLACEHOLDER */
.ttg-input-control::placeholder {
  color: var(--grey-500, #a9a9a9);
}

/* ======== ERROR ============ */

/* ERROR GROUP */
.ttg-input-error {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ERROR TEXT */
.ttg-input-error-text {
  color: var(--critical, #ff2b71);
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.28px;
}

/* ======== STATE ============ */

/* 1. hover */
.ttg-input-field:hover {
  border: 1px solid var(--grey-300, #d5d5d5);
}

/* 2. focus */
.ttg-input-field:focus-within {
  border: 1px solid var(--black, #333);
  color: var(--black, #333) !important;
}

/* 3. error */
.ttg-input-wrapper.error .ttg-input-field {
  border: 1px solid var(--critical, #ff2b71);
}

/* Скрываем блок ошибки по умолчанию */
.ttg-input-error {
  display: none;
  gap: 4px;
}

/* Показываем блок ошибки при наличии класса error */
.ttg-input-wrapper.error .ttg-input-error {
  display: flex;
}

`;
