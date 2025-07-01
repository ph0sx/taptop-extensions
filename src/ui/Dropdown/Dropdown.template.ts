export const template = `
    <div class="ttg-dropdown-wrapper">
        <label>
          <span class="ttg-dropdown-label">Выберите опцию</span>
          <span class="ttg-dropdown-required">*</span>
          <ttg-question tooltip="" style="display: none; height: 16px;"></ttg-question>
        </label>
        <div class="ttg-dropdown-field">
          <select class="ttg-dropdown-control">
            <option value="">Выберите опцию</option>
          </select>
          <svg class="ttg-dropdown-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15.8337 7.5L10.0003 13.3333L4.16699 7.5" stroke="#A9A9A9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="ttg-dropdown-error">
          <svg class="ttg-dropdown-error-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 10C2.5 5.85787 5.85787 2.5 10 2.5C14.1422 2.5 17.5 5.85787 17.5 10C17.5 14.1422 14.1422 17.5 10 17.5C5.85787 17.5 2.5 14.1422 2.5 10ZM10 5.98837C10.289 5.98837 10.5233 6.22264 10.5233 6.51163V10.6977C10.5233 10.9867 10.289 11.2209 10 11.2209C9.71102 11.2209 9.47674 10.9867 9.47674 10.6977V6.51163C9.47674 6.22264 9.71102 5.98837 10 5.98837ZM10.3959 13.8378C10.5893 13.623 10.5718 13.2921 10.357 13.0988C10.1422 12.9055 9.81135 12.9228 9.61802 13.1377L9.61105 13.1454C9.41772 13.3602 9.43516 13.691 9.64998 13.8844C9.86479 14.0777 10.1956 14.0603 10.389 13.8455L10.3959 13.8378Z" fill="#FF2B71"/>
          </svg>
          <span class="ttg-dropdown-error-text">Произошла ошибка</span>
        </div>
      </div>
    </div>
`;
