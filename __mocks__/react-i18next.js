const React = require('react');
const reactI18next = require('react-i18next');

const hasChildren = (node) => node && (node.children || (node.props && node.props.children));

const getChildren = (node) => (node && node.children ? node.children : node.props && node.props.children);

const renderNodes = (reactNodes) => {
  if (typeof reactNodes === 'string') {
    return reactNodes;
  }

  return Object.keys(reactNodes).map((key, i) => {
    const child = reactNodes[key];
    const isElement = React.isValidElement(child);

    if (typeof child === 'string') {
      return child;
    }
    if (hasChildren(child)) {
      const inner = renderNodes(getChildren(child));
      return React.cloneElement(child, { ...child.props, key: i }, inner);
    }
    if (typeof child === 'object' && !isElement) {
      return Object.keys(child).reduce((str, childKey) => `${str}${child[childKey]}`, '');
    }

    return child;
  });
};

const useMock = [(key) => key, {}];
useMock.t = (key, defaultValue, options = {}) => {
  let translatedString = defaultValue || key;
  Object.entries(options).forEach(([k, v]) => {
    translatedString = translatedString.replace(new RegExp(`{{${k}}}`, 'g'), v);
  });

  return translatedString;
};

useMock.i18n = { language: 'en_US' };

module.exports = {
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  Trans: ({ children }) => (Array.isArray(children) ? renderNodes(children) : renderNodes([children])),
  Translation: ({ children }) => children((k) => k, { i18n: {} }),
  useTranslation: () => useMock,
  // mock if needed
  I18nextProvider: reactI18next.I18nextProvider,
  initReactI18next: reactI18next.initReactI18next,
  setDefaults: reactI18next.setDefaults,
  getDefaults: reactI18next.getDefaults,
  setI18n: reactI18next.setI18n,
  getI18n: reactI18next.getI18n,
};
