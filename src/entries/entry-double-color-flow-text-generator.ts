import '../utils/global-styles';
import DoubleColorFlowTextGenerator from '../components/animations/DoubleColorFlowTextGenerator.js';

// Регистрируем веб-компонент
if (!customElements.get('double-color-flow-text-generator')) {
  customElements.define('double-color-flow-text-generator', DoubleColorFlowTextGenerator);
}

export default DoubleColorFlowTextGenerator;
