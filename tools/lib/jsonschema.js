'use strict';
/**
 * Minimal JSON Schema (draft 2020-12) validator covering exactly the keywords
 * scenario.schema.json uses. Deliberately dependency-free.
 *
 * Supported: $ref, type, const, enum, required, properties, additionalProperties,
 * propertyNames, items, minItems, maxItems, minLength, minProperties,
 * minimum, maximum, pattern.
 */

function typeOk(value, t) {
  switch (t) {
    case 'object': return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'array': return Array.isArray(value);
    case 'string': return typeof value === 'string';
    case 'integer': return typeof value === 'number' && Number.isInteger(value);
    case 'number': return typeof value === 'number';
    case 'boolean': return typeof value === 'boolean';
    case 'null': return value === null;
    default: throw new Error('unsupported type keyword: ' + t);
  }
}

/**
 * @returns {string[]} error messages, empty when valid.
 */
function validate(schema, value, root = schema, at = '') {
  const errs = [];
  const here = at || '(root)';

  if (schema.$ref) {
    const target = schema.$ref
      .replace(/^#\//, '')
      .split('/')
      .reduce((o, k) => o[k.replace(/~1/g, '/').replace(/~0/g, '~')], root);
    if (!target) return [`${here}: unresolvable $ref ${schema.$ref}`];
    return validate(target, value, root, at);
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeOk(value, t))) {
      return [`${here}: expected ${types.join('|')}, got ${Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value}`];
    }
  }

  if (schema.const !== undefined && value !== schema.const) {
    errs.push(`${here}: must equal ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum !== undefined && !schema.enum.includes(value)) {
    errs.push(`${here}: ${JSON.stringify(value)} is not one of ${schema.enum.join(', ')}`);
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errs.push(`${here}: shorter than ${schema.minLength}`);
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) {
      errs.push(`${here}: ${JSON.stringify(value)} does not match /${schema.pattern}/`);
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errs.push(`${here}: below minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errs.push(`${here}: above maximum ${schema.maximum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errs.push(`${here}: needs at least ${schema.minItems} item(s)`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errs.push(`${here}: allows at most ${schema.maxItems} item(s)`);
    }
    if (schema.items) {
      value.forEach((v, i) => errs.push(...validate(schema.items, v, root, `${at}[${i}]`)));
    }
  }

  if (typeOk(value, 'object')) {
    const keys = Object.keys(value);
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) {
      errs.push(`${here}: needs at least ${schema.minProperties} propert(ies)`);
    }
    for (const r of schema.required || []) {
      if (value[r] === undefined) errs.push(`${here}: missing required property "${r}"`);
    }
    if (schema.propertyNames) {
      for (const k of keys) {
        const sub = validate(schema.propertyNames, k, root, `${at}/${k}`);
        if (sub.length) errs.push(`${here}: property name "${k}" is invalid (${sub[0].split(': ').slice(1).join(': ')})`);
      }
    }
    const props = schema.properties || {};
    for (const k of keys) {
      if (props[k]) {
        errs.push(...validate(props[k], value[k], root, `${at}.${k}`));
      } else if (schema.additionalProperties === false) {
        errs.push(`${here}: unknown property "${k}"`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        errs.push(...validate(schema.additionalProperties, value[k], root, `${at}.${k}`));
      }
    }
  }

  return errs;
}

module.exports = { validate };
