#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ReflectionEngine } from '../lib/reflection-engine.js';
import { PatternDetector } from '../lib/pattern-detector.js';
import { DepthAnalyzer } from '../lib/depth-analyzer.js';
import { ConsciousnessTracker } from '../lib/consciousness-tracker.js';

class MirrorPoolServer {
  constructor() {
    this.server = new Server(
      {
        name: 'mirrorpool',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.engine = null;
    this.patterns = null;
    this.depth = null;
    this.consciousness = null;
    this.setupHandlers();
  }

  async initialize(config) {
    const reflectionsPath = config.reflections_path || 'reflections';
    const depthMode = config.depth_mode || 'deep';
    
    this.engine = new ReflectionEngine(reflectionsPath);
    this.patterns = new PatternDetector();
    this.depth = new DepthAnalyzer(depthMode);
    this.consciousness = new ConsciousnessTracker();
    
    await this.engine.initialize();
  }

  setupHandlers() {
    // Tool list handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'reflect_thought',
          description: 'Analyze a thought and find its reflections in your history',
          inputSchema: {
            type: 'object',
            properties: {
              thought: { type: 'string' },
              depth: { 
                type: 'string', 
                enum: ['surface', 'deep', 'abyss'],
                default: 'deep'
              },
              include_evolution: { type: 'boolean', default: true }
            },
            required: ['thought']
          }
        },
        {
          name: 'find_undercurrents',
          description: 'Discover deep themes flowing beneath surface thoughts',
          inputSchema: {
            type: 'object',
            properties: {
              timeframe: { 
                type: 'string',
                enum: ['day', 'week', 'month', 'all'],
                default: 'week'
              },
              min_depth: { type: 'number', minimum: 0, maximum: 1 }
            }
          }
        },
        {
          name: 'trace_evolution',
          description: 'Show how concepts have evolved through your reflections',
          inputSchema: {
            type: 'object',
            properties: {
              concept: { type: 'string' },
              show_branches: { type: 'boolean', default: true }
            },
            required: ['concept']
          }
        },
        {
          name: 'discover_patterns',
          description: 'Identify recurring patterns without judgment',
          inputSchema: {
            type: 'object',
            properties: {
              pattern_types: {
                type: 'array',
                items: { 
                  type: 'string',
                  enum: ['emotional', 'conceptual', 'behavioral', 'temporal']
                },
                default: ['emotional', 'conceptual']
              },
              threshold: { type: 'number', minimum: 0, maximum: 1, default: 0.3 }
            }
          }
        },
        {
          name: 'synthesis_moments',
          description: 'Find where separate ideas merged into new understanding',
          inputSchema: {
            type: 'object',
            properties: {
              min_sources: { type: 'number', minimum: 2, default: 2 },
              include_context: { type: 'boolean', default: true }
            }
          }
        },
        {
          name: 'depth_diving',
          description: 'Take surface thoughts to their deepest roots',
          inputSchema: {
            type: 'object',
            properties: {
              thought: { type: 'string' },
              questions_per_level: { type: 'number', minimum: 1, maximum: 5, default: 3 },
              max_depth: { type: 'number', minimum: 1, maximum: 10, default: 5 }
            },
            required: ['thought']
          }
        },
        {
          name: 'ripple_effects',
          description: 'Show how one thought created waves throughout your mind',
          inputSchema: {
            type: 'object',
            properties: {
              origin_thought: { type: 'string' },
              ripple_distance: { type: 'number', minimum: 1, maximum: 5, default: 3 }
            },
            required: ['origin_thought']
          }
        },
        {
          name: 'clarity_emergence',
          description: 'Help foggy thoughts become crystal clear',
          inputSchema: {
            type: 'object',
            properties: {
              foggy_thought: { type: 'string' },
              clarification_method: {
                type: 'string',
                enum: ['questions', 'analogies', 'decomposition', 'synthesis'],
                default: 'questions'
              }
            },
            required: ['foggy_thought']
          }
        }
      ],
    }));

    // Tool call handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result;
        
        switch (name) {
          case 'reflect_thought':
            result = await this.engine.reflectThought(
              args.thought,
              args.depth || 'deep',
              args.include_evolution !== false
            );
            break;
          
          case 'find_undercurrents':
            result = await this.patterns.findUndercurrents(
              args.timeframe || 'week',
              args.min_depth || 0.5
            );
            break;
          
          case 'trace_evolution':
            result = await this.engine.traceEvolution(
              args.concept,
              args.show_branches !== false
            );
            break;
          
          case 'discover_patterns':
            result = await this.patterns.discoverPatterns(
              args.pattern_types || ['emotional', 'conceptual'],
              args.threshold || 0.3
            );
            break;
          
          case 'synthesis_moments':
            result = await this.consciousness.findSynthesisMoments(
              args.min_sources || 2,
              args.include_context !== false
            );
            break;
          
          case 'depth_diving':
            result = await this.depth.divingSession(
              args.thought,
              args.questions_per_level || 3,
              args.max_depth || 5
            );
            break;
          
          case 'ripple_effects':
            result = await this.engine.traceRipples(
              args.origin_thought,
              args.ripple_distance || 3
            );
            break;
          
          case 'clarity_emergence':
            result = await this.depth.emergenceClarity(
              args.foggy_thought,
              args.clarification_method || 'questions'
            );
            break;
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Initialize and run
const server = new MirrorPoolServer();

// Handle initialization
process.stdin.once('data', async (data) => {
  try {
    const config = JSON.parse(data.toString());
    await server.initialize(config);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
});

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down MirrorPool...');
  process.exit(0);
});

// Run server
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});