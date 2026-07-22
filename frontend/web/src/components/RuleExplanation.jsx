import React from 'react';

export function RuleExplanation({ ruleCode, ruleText, lang }) {
  if (!ruleText) return null;

  const text = ruleText[lang] || ruleText['uz'] || '';

  return (
    <div className="rule-box">
      {ruleCode && <div className="rule-code">YHQ {ruleCode}-band:</div>}
      <div>{text}</div>
    </div>
  );
}
