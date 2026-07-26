import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, "../../public/content");

// Check if engine is available
let engine = null;
try {
  // Try to load engine from the built bundle
  const enginePath = path.resolve(__dirname, "../../public/engine.js");
  const engineCode = readFileSync(enginePath, 'utf8');
  
  // Create a simple sandbox to execute the engine
  const sandbox = { __yhqEngine: null };
  
  // Execute the engine code in a function context
  const func = new Function('window', 'global', 'globalThis', engineCode);
  func(sandbox, sandbox, sandbox);
  
  engine = sandbox.__yhqEngine;
  
  if (engine) {
    console.log('✅ Scenario engine loaded successfully, version:', engine.version);
  }
} catch (error) {
  console.warn('⚠️ Could not load scenario engine:', error.message);
  console.warn('   Scenario simulation will not be available');
}

/**
 * List all available scenarios
 */
export async function listScenarios({ topic } = {}) {
  try {
    const files = readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.json'))
      .sort();

    const scenarios = [];
    
    for (const file of files) {
      try {
        const content = readFileSync(path.join(CONTENT_DIR, file), 'utf8');
        const data = JSON.parse(content);
        
        // Filter by topic if specified
        if (topic && data.topic !== topic) {
          continue;
        }
        
        scenarios.push({
          id: file.replace('.json', ''),
          topic: data.topic || 'general',
          title: data.title || data.question?.text?.uz || data.question?.text || 'Untitled',
          type: data.scene?.type || 'intersection',
          actors: data.actors?.length || 0,
        });
      } catch (err) {
        console.warn(`Skipping invalid scenario file ${file}:`, err.message);
      }
    }

    return scenarios;
  } catch (error) {
    console.error('Error listing scenarios:', error);
    return [];
  }
}

/**
 * Get a specific scenario by ID
 */
export async function getScenario(id) {
  try {
    const filePath = path.join(CONTENT_DIR, `${id}.json`);
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error getting scenario ${id}:`, error.message);
    return null;
  }
}

/**
 * Get scenario info (duration, options metadata)
 */
export async function getScenarioInfo(id) {
  try {
    const scenario = await getScenario(id);
    if (!scenario) return null;

    let info = {
      duration: 5, // default duration in seconds
      options: {},
      warnings: [],
    };

    // If engine is available, get detailed info
    if (engine && engine.sceneInfo) {
      try {
        const engineInfo = engine.sceneInfo(JSON.stringify(scenario));
        if (engineInfo && !engineInfo.error) {
          info = {
            duration: engineInfo.duration || 5,
            options: engineInfo.options || {},
            warnings: engineInfo.warnings || [],
          };
        }
      } catch (err) {
        console.warn(`Engine sceneInfo failed for ${id}:`, err.message);
      }
    } else {
      // Fallback: basic info without engine
      if (scenario.question?.options) {
        for (const opt of scenario.question.options) {
          info.options[opt.id] = {
            clean: opt.id === scenario.question.correct,
            type: opt.id === scenario.question.correct ? null : 'unknown',
            duration: 3,
          };
        }
      }
    }

    return info;
  } catch (error) {
    console.error(`Error getting scenario info ${id}:`, error.message);
    return null;
  }
}

/**
 * Get frame data for specific time and option
 */
export async function getFrame(id, time, optionId = null) {
  try {
    const scenario = await getScenario(id);
    if (!scenario) return null;

    let frame = {
      ops: [],
      canvas: 1000,
    };

    // If engine is available, get real frame
    if (engine) {
      try {
        if (optionId) {
          // Get frame for specific option (user's choice)
          if (engine.optionFrame) {
            frame = engine.optionFrame(JSON.stringify(scenario), optionId, time);
          }
        } else {
          // Get frame for correct answer
          if (engine.buildFrame) {
            frame = engine.buildFrame(JSON.stringify(scenario), time);
          }
        }

        if (frame && frame.error) {
          console.warn(`Engine frame error for ${id} at ${time}:`, frame.error);
          frame = { ops: [], canvas: 1000 };
        }
      } catch (err) {
        console.warn(`Engine frame failed for ${id} at ${time}:`, err.message);
        frame = { ops: [], canvas: 1000 };
      }
    } else {
      // Fallback: static scene without engine
      if (engine && engine.buildScene) {
        try {
          frame = engine.buildScene(JSON.stringify(scenario));
        } catch (err) {
          console.warn(`Engine buildScene failed for ${id}:`, err.message);
        }
      }
    }

    // Add outcome info if this was an option frame
    if (optionId && scenario.question) {
      const isCorrect = optionId === scenario.question.correct;
      frame.outcome = isCorrect ? 'safe' : 'collision';
      frame.isCorrect = isCorrect;
    }

    return frame;
  } catch (error) {
    console.error(`Error getting frame for ${id} at ${time}:`, error.message);
    return null;
  }
}