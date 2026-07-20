#!/usr/bin/env node
/**
 * Generates Dart and TypeScript types from schema/scenario.schema.json.
 *
 * The schema is the single source of truth. Never hand-edit the generated files.
 *
 * Handles the subset of JSON Schema the scenario format uses:
 *   $ref, object+properties, object+additionalProperties (-> map), array+items,
 *   string+enum, integer, string, const, default.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCHEMA_DIR = path.join(ROOT, 'schema');

// Both schemas contribute types. scenario.schema.json owns the shared $defs
// (LocalizedText, Rule, Topic, the enums); question.schema.json refs into it.
// Names must not collide across files - the check below enforces that.
const SCHEMA_FILES = ['scenario.schema.json', 'question.schema.json'];

const defs = {};
for (const file of SCHEMA_FILES) {
  const doc = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8'));
  for (const [name, def] of Object.entries(doc.$defs || {})) {
    if (defs[name]) {
      throw new Error(`type name "${name}" is defined in more than one schema file`);
    }
    defs[name] = def;
  }
}

const BANNER = (lang) =>
  `${lang === 'dart' ? '//' : '//'} GENERATED FILE - DO NOT EDIT.\n` +
  `// Source: schema/scenario.schema.json\n` +
  `// Regenerate with: node tools/codegen.js\n\n`;

// ---------------------------------------------------------------- classification

// Handles both "#/$defs/Foo" and "other.schema.json#/$defs/Foo"; because all
// $defs are merged into one namespace above, the file part carries no meaning
// beyond documentation.
const refName = (s) => (s.$ref ? s.$ref.split('#/$defs/').pop() : null);
const isEnumDef = (s) => s.type === 'string' && Array.isArray(s.enum);
const isMapDef = (s) => s.type === 'object' && !s.properties && !!s.additionalProperties;
const isObjectDef = (s) => s.type === 'object' && !!s.properties;

const enumDefs = Object.entries(defs).filter(([, s]) => isEnumDef(s));
const objectDefs = Object.entries(defs).filter(([, s]) => isObjectDef(s));
const mapDefs = Object.entries(defs).filter(([, s]) => isMapDef(s));

// ---------------------------------------------------------------- naming

const snakeToCamel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
// `with` and `default` are reserved in Dart; `with` also reads badly in TS.
const DART_RESERVED = new Set(['with', 'is', 'in', 'default', 'class', 'new', 'this', 'var']);
const dartField = (name) => {
  const c = snakeToCamel(name);
  return DART_RESERVED.has(c) ? c + '_' : c;
};
// Wire values are lower-cased first so `"N"` becomes `Dir.n` rather than `Dir.N`.
const dartEnumValue = (v) => {
  const c = snakeToCamel(v.toLowerCase());
  return DART_RESERVED.has(c) ? c + '_' : c;
};

// ---------------------------------------------------------------- type mapping

function typeOf(s, lang) {
  const r = refName(s);
  if (r) {
    const target = defs[r];
    if (isMapDef(target)) return typeOf(target, lang);
    return r;
  }
  if (isEnumDef(s)) throw new Error('inline enum: name it in $defs');
  if (isMapDef(s)) {
    const v = typeOf(s.additionalProperties, lang);
    return lang === 'dart' ? `Map<String, ${v}>` : `Record<string, ${v}>`;
  }
  if (s.type === 'array') {
    const it = typeOf(s.items, lang);
    return lang === 'dart' ? `List<${it}>` : `${it}[]`;
  }
  if (s.type === 'integer') return lang === 'dart' ? 'int' : 'number';
  if (s.type === 'number') return lang === 'dart' ? 'double' : 'number';
  if (s.type === 'boolean') return lang === 'dart' ? 'bool' : 'boolean';
  if (s.type === 'string') return lang === 'dart' ? 'String' : 'string';
  throw new Error('unmapped schema node: ' + JSON.stringify(s));
}

/** Effective default for a property, resolving through $ref. */
function defaultOf(s) {
  if (s.default !== undefined) return s.default;
  const r = refName(s);
  if (r && defs[r] && defs[r].default !== undefined) return defs[r].default;
  return undefined;
}

// ---------------------------------------------------------------- Dart

function dartLiteral(s, value) {
  if (Array.isArray(value)) return 'const []';
  if (value && typeof value === 'object') return 'const {}';
  const r = refName(s);
  if (r && isEnumDef(defs[r])) return `${r}.${dartEnumValue(value)}`;
  if (typeof value === 'string') return JSON.stringify(value);
  return String(value);
}

function dartDecode(s, expr) {
  const r = refName(s);
  if (r) {
    const t = defs[r];
    if (isEnumDef(t)) return `${r}.fromJson(${expr} as String)`;
    if (isObjectDef(t)) return `${r}.fromJson(${expr} as Map<String, dynamic>)`;
    if (isMapDef(t)) return dartDecode(t, expr);
  }
  if (isMapDef(s)) {
    return `(${expr} as Map<String, dynamic>).map((k, v) => MapEntry(k, ${dartDecode(s.additionalProperties, 'v')}))`;
  }
  if (s.type === 'array') {
    return `(${expr} as List<dynamic>).map((e) => ${dartDecode(s.items, 'e')}).toList(growable: false)`;
  }
  if (s.type === 'number') return `(${expr} as num).toDouble()`;
  return `${expr} as ${typeOf(s, 'dart')}`;
}

function dartEncode(s, expr) {
  const r = refName(s);
  if (r) {
    const t = defs[r];
    if (isEnumDef(t)) return `${expr}.toJson()`;
    if (isObjectDef(t)) return `${expr}.toJson()`;
    if (isMapDef(t)) return dartEncode(t, expr);
  }
  if (isMapDef(s)) {
    const inner = dartEncode(s.additionalProperties, 'v');
    return inner === 'v' ? expr : `${expr}.map((k, v) => MapEntry(k, ${inner}))`;
  }
  if (s.type === 'array') {
    const inner = dartEncode(s.items, 'e');
    return inner === 'e' ? expr : `${expr}.map((e) => ${inner}).toList(growable: false)`;
  }
  return expr;
}

function genDart() {
  let out = BANNER('dart');
  out += `// ignore_for_file: unnecessary_cast, prefer_const_constructors\n\n`;

  for (const [name, s] of enumDefs) {
    out += `/// ${(s.description || name).replace(/\n/g, ' ')}\n`;
    out += `enum ${name} {\n`;
    out += s.enum.map((v) => `  ${dartEnumValue(v)}(${JSON.stringify(v)})`).join(',\n') + ';\n\n';
    out += `  const ${name}(this.wire);\n\n`;
    out += `  /// The exact string used in scenario JSON.\n  final String wire;\n\n`;
    out += `  String toJson() => wire;\n\n`;
    out += `  static ${name} fromJson(String v) => values.firstWhere(\n`;
    out += `        (e) => e.wire == v,\n`;
    out += `        orElse: () => throw FormatException('unknown ${name}: \$v'),\n`;
    out += `      );\n`;
    out += `}\n\n`;
  }

  for (const [name, s] of objectDefs) {
    const req = new Set(s.required || []);
    const props = Object.entries(s.properties);
    if (s.description) out += `/// ${s.description.replace(/\n/g, ' ')}\n`;
    out += `class ${name} {\n`;

    for (const [pname, ps] of props) {
      const t = typeOf(ps, 'dart');
      const hasDefault = defaultOf(ps) !== undefined;
      const nullable = !req.has(pname) && !hasDefault;
      if (ps.description) out += `  /// ${ps.description.replace(/\n/g, ' ')}\n`;
      out += `  final ${t}${nullable ? '?' : ''} ${dartField(pname)};\n`;
    }

    out += `\n  const ${name}({\n`;
    for (const [pname, ps] of props) {
      const d = defaultOf(ps);
      const hasDefault = d !== undefined;
      const f = dartField(pname);
      if (req.has(pname)) out += `    required this.${f},\n`;
      else if (hasDefault) out += `    this.${f} = ${dartLiteral(ps, d)},\n`;
      else out += `    this.${f},\n`;
    }
    out += `  });\n\n`;

    // fromJson
    out += `  static ${name} fromJson(Map<String, dynamic> j) => ${name}(\n`;
    for (const [pname, ps] of props) {
      const f = dartField(pname);
      const d = defaultOf(ps);
      const dec = dartDecode(ps, `j[${JSON.stringify(pname)}]`);
      if (req.has(pname)) {
        out += `      ${f}: ${dec},\n`;
      } else if (d !== undefined) {
        out += `      ${f}: j[${JSON.stringify(pname)}] == null ? ${dartLiteral(ps, d)} : ${dec},\n`;
      } else {
        out += `      ${f}: j[${JSON.stringify(pname)}] == null ? null : ${dec},\n`;
      }
    }
    out += `    );\n\n`;

    // toJson - omits nulls, always writes defaulted fields (normalising round-trip)
    out += `  Map<String, dynamic> toJson() => <String, dynamic>{\n`;
    for (const [pname, ps] of props) {
      const f = dartField(pname);
      const hasDefault = defaultOf(ps) !== undefined;
      const nullable = !req.has(pname) && !hasDefault;
      const enc = dartEncode(ps, nullable ? `${f}!` : f);
      if (nullable) out += `        if (${f} != null) ${JSON.stringify(pname)}: ${enc},\n`;
      else out += `        ${JSON.stringify(pname)}: ${enc},\n`;
    }
    out += `      };\n`;
    out += `}\n\n`;
  }

  for (const [name, s] of mapDefs) {
    out += `/// ${(s.description || name).replace(/\n/g, ' ')}\n`;
    out += `typedef ${name} = ${typeOf(s, 'dart')};\n\n`;
  }

  return out;
}

// ---------------------------------------------------------------- TypeScript

function genTs() {
  let out = BANNER('ts');

  for (const [name, s] of enumDefs) {
    out += `/** ${(s.description || name).replace(/\n/g, ' ')} */\n`;
    out += `export type ${name} =\n`;
    out += s.enum.map((v) => `  | ${JSON.stringify(v)}`).join('\n') + ';\n\n';
    out += `export const ${name}Values: readonly ${name}[] = [\n`;
    out += s.enum.map((v) => `  ${JSON.stringify(v)},`).join('\n') + '\n] as const;\n\n';
  }

  for (const [name, s] of mapDefs) {
    out += `/** ${(s.description || name).replace(/\n/g, ' ')} */\n`;
    out += `export type ${name} = ${typeOf(s, 'ts')};\n\n`;
  }

  for (const [name, s] of objectDefs) {
    const req = new Set(s.required || []);
    if (s.description) out += `/** ${s.description.replace(/\n/g, ' ')} */\n`;
    out += `export interface ${name} {\n`;
    for (const [pname, ps] of Object.entries(s.properties)) {
      const optional = !req.has(pname);
      if (ps.description) out += `  /** ${ps.description.replace(/\n/g, ' ')} */\n`;
      out += `  ${pname}${optional ? '?' : ''}: ${typeOf(ps, 'ts')};\n`;
    }
    out += `}\n\n`;
  }

  // Defaults table so the editor and engine agree without duplicating literals.
  out += `/** Property defaults declared in the schema, by "Type.property". */\n`;
  out += `export const SCHEMA_DEFAULTS: Record<string, unknown> = {\n`;
  for (const [name, s] of objectDefs) {
    for (const [pname, ps] of Object.entries(s.properties)) {
      const d = defaultOf(ps);
      if (d !== undefined) out += `  ${JSON.stringify(name + '.' + pname)}: ${JSON.stringify(d)},\n`;
    }
  }
  out += `};\n`;
  return out;
}

// ---------------------------------------------------------------- emit

function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  console.log('  wrote ' + path.relative(ROOT, p));
}

console.log('codegen: ' + SCHEMA_FILES.map((f) => 'schema/' + f).join(', '));
const dart = genDart();
const ts = genTs();
write(path.join(ROOT, 'engine_dart', 'lib', 'src', 'generated', 'scenario.g.dart'), dart);
write(path.join(ROOT, 'editor', 'src', 'generated', 'scenario.g.ts'), ts);
write(path.join(ROOT, 'schema', 'generated', 'scenario.g.ts'), ts);
console.log(`codegen: ${enumDefs.length} enums, ${objectDefs.length} classes, ${mapDefs.length} aliases`);
