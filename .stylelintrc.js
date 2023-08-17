module.exports = {
  extends: ['stylelint-config-spaceninja', 'stylelint-config-prettier'],
  // 1. This rule doesn't understand some print styles.
  rules: {
    'scss/at-rule-no-unknown': null, // 1
    'selector-pseudo-element-no-unknown': null, // 1
  },
};
