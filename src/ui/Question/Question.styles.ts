export const styles = `
/* 1. Главный контейнер */
.ttg-question-container {
  position: relative; /* Это ключ к позиционированию тултипа! */
  display: inline-block;
  cursor: help;
  height: 16px;
}

/* 2. Стили для иконки */
.ttg-question-icon {
  color: #2c2c2c;
  transition: fill 0.2s ease;
}

.ttg-question-icon path {
  fill: #D5D5D5;
  transition: fill 0.2s ease;
}

.ttg-question-container:hover .ttg-question-icon path {
  fill: #333333;
}

/* 3. Стили для самого тултипа (текста) */
.ttg-question-tooltip {
  /* Изначально скрываем */
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s;

  width: 280px;
  background-color: #f8f8f8;
  color: #616161;

  padding: 12px;

  border-radius: 12px;
  border: 1px solid var(--grey-300, #d5d5d5);
  background: var(--white, #fff);
  box-shadow:
    0px 12px 24px 0px rgba(138, 143, 147, 0.12),
    0px 1px 2px 0px rgba(228, 229, 231, 0.24);

  /* Позиционирование относительно контейнера */
  position: absolute;
  z-index: 1;
  bottom: 6.5px;
  right: -14px;
  transform: translateY(-50%);
}

/* 4.  Стрелочка*/
.ttg-question-tooltip::after {
  content: '';
  position: absolute;

  top: 100%;
  right: 16px;
  transform: translate(-50%, -2px);
  background-position: center;
  background-size: cover;

  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxOCAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjU3ODEgOS4xMTEzM0M5LjU5NjI1IDkuOTEyMTIgOC4xNDc3MSA5Ljg1NDU5IDcuMjMyNDIgOC45Mzk0NUwxLjc5Mjk3IDMuNUwxNi4yMDcgMy41TDEwLjc2NzYgOC45Mzk0NUwxMC41NzgxIDkuMTExMzNaIiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjRDVENUQ1Ii8+CjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSI0IiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K');

  width: 12px;
  height: 6px;
}

/* 5. Показываем тултип при наведении на контейнер */
.ttg-question-container:hover .ttg-question-tooltip {
  visibility: visible;
  opacity: 1;
}
`;
