export const template = `
  <div class="ttg-checkbox-group-wrapper">
    <label>
      <span class="ttg-checkbox-group-label">Checkbox Group Label</span>
      <span class="ttg-checkbox-group-required">*</span>
      <ttg-question tooltip="" style="display: none; height: 16px;"></ttg-question>
    </label>
    <div class="ttg-checkbox-group-items vertical">
      <slot></slot>
    </div>
    <div class="ttg-checkbox-group-error">
      <svg class="ttg-checkbox-group-error-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 10C2.5 5.85787 5.85787 2.5 10 2.5C14.1422 2.5 17.5 5.85787 17.5 10C17.5 14.1422 14.1422 17.5 10 17.5C5.85787 17.5 2.5 14.1422 2.5 10ZM10 5.98837C10.289 5.98837 10.5233 6.22264 10.5233 6.51163V10.6977C10.5233 10.9867 10.289 11.2209 10 11.2209C9.71102 11.2209 9.47674 10.9867 9.47674 10.6977V6.51163C9.47674 6.22264 9.71102 5.98837 10 5.98837ZM10.3959 13.8378C10.5893 13.623 10.5718 13.2921 10.357 13.0988C10.1422 12.9055 9.81135 12.9228 9.61802 13.1377L9.61105 13.1454C9.41772 13.3602 9.43516 13.691 9.64998 13.8844C9.86479 14.0777 10.1956 14.0603 10.389 13.8455L10.3959 13.8378Z" fill="#FF2B71"/>
      </svg>
      <span class="ttg-checkbox-group-error-text">Произошла ошибка</span>
    </div>
  </div>
`;
