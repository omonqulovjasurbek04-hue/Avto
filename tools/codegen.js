#!/usr/bin/env node
// Codegen: generate TypeScript and Dart types from schema JSON.
// Usage: node tools/codegen.js

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCHEMA_DIR = path.join(ROOT, "schema");

function generateTS(schemaPath) {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  let output = "// Auto-generated from schema. Do not edit.\n\n";

  function walkDefs(defs, prefix) {
    for (const [name, def] of Object.entries(defs)) {
      if (def.type === "object" && def.properties) {
        output += `export interface ${prefix}${name} {\n`;
        for (const [propName, propDef] of Object.entries(def.properties)) {
          const required = def.required?.includes(propName);
          const optMarker = required ? "" : "?";
          const tsType = jsonTypeToTS(propDef);
          output += `  ${propName}${optMarker}: ${tsType};\n`;
        }
        output += `}\n\n`;
      }
      if (def.enum) {
        output += `export type ${prefix}${name} = ${def.enum.map((e) => `"${e}"`).join(" | ")};\n\n`;
      }
      if (def.$ref) {
        const refName = def.$ref.split("/").pop();
        output += `export type ${prefix}${name} = ${prefix}${refName};\n\n`;
      }
    }
  }

  walkDefs(schema.$defs || {}, "");
  return output;
}

function jsonTypeToTS(prop) {
  if (prop.$ref) {
    const name = prop.$ref.split("/").pop();
    return name;
  }
  if (prop.type === "string" && prop.enum) {
    return prop.enum.map((e) => `"${e}"`).join(" | ");
  }
  if (prop.type === "string") return "string";
  if (prop.type === "integer" || prop.type === "number") return "number";
  if (prop.type === "boolean") return "boolean";
  if (prop.type === "array" && prop.items) return `${jsonTypeToTS(prop.items)}[]`;
  if (prop.type === "object" && prop.additionalProperties) {
    return `{ [key: string]: ${jsonTypeToTS(prop.additionalProperties)} }`;
  }
  return "any";
}

function main() {
  const files = readdirSync(SCHEMA_DIR).filter((f) => f.endsWith(".schema.json"));

  const TS_OUT = path.join(SCHEMA_DIR, "generated");
  if (!existsSync(TS_OUT)) mkdirSync(TS_OUT, { recursive: true });

  for (const file of files) {
    const ts = generateTS(path.join(SCHEMA_DIR, file));
    const outName = file.replace(".schema.json", ".g.ts");
    writeFileSync(path.join(TS_OUT, outName), ts, "utf8");
    console.log(`Generated: ${TS_OUT}/${outName}`);
  }

  console.log("Codegen complete.");
}

main();
