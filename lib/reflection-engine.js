// The heart of MirrorPool - where thoughts meet their reflections
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';

export class ReflectionEngine {
  constructor(reflectionsPath) {
    this.reflectionsPath = reflectionsPath;
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    // Create reflections directory if it doesn't exist
    await fs.mkdir(this.reflectionsPath, { recursive: true });
    
    // Initialize database
    const dbPath = path.join(this.reflectionsPath, 'reflections.db');
    this.db = await Database.open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Create tables
    await this.createTables();
    this.initialized = true;
  }

  async createTables() {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thought TEXT NOT NULL,
        depth_level TEXT DEFAULT 'surface',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        emotional_state TEXT,
        patterns TEXT,
        connections TEXT,
        evolution_stage INTEGER DEFAULT 1
      );
      
      CREATE TABLE IF NOT EXISTS connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER,
        target_id INTEGER,
        connection_type TEXT,
        strength REAL DEFAULT 0.5,
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(source_id) REFERENCES reflections(id),
        FOREIGN KEY(target_id) REFERENCES reflections(id)
      );
      
      CREATE TABLE IF NOT EXISTS patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern_type TEXT,
        pattern_data TEXT,
        frequency INTEGER DEFAULT 1,
        first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_thought_text ON reflections(thought);
      CREATE INDEX IF NOT EXISTS idx_created_at ON reflections(created_at);
      CREATE INDEX IF NOT EXISTS idx_connections ON connections(source_id, target_id);
    `);
  }

  async reflectThought(thought, depth = 'deep', includeEvolution = true) {
    // Save the new thought
    const result = await this.db.run(
      'INSERT INTO reflections (thought, depth_level) VALUES (?, ?)',
      thought, depth
    );
    
    const thoughtId = result.lastID;
    
    // Find reflections - thoughts that mirror this one
    const reflections = await this.findReflections(thought, depth);
    
    // Find deeper meanings
    const deeperMeanings = await this.extractDeeperMeanings(thought, depth);
    
    // Track evolution if requested
    let evolution = null;
    if (includeEvolution) {
      evolution = await this.trackEvolution(thought, thoughtId);
    }
    
    // Create connections
    for (const reflection of reflections) {
      await this.createConnection(thoughtId, reflection.id, 'reflection', reflection.similarity);
    }
    
    return {
      original_thought: thought,
      surface_reflection: this.surfaceReflection(thought),
      deep_reflections: reflections,
      hidden_meanings: deeperMeanings,
      evolution_stage: evolution,
      timestamp: new Date().toISOString(),
      mirror_clarity: this.calculateClarity(reflections)
    };
  }

  surfaceReflection(thought) {
    // What you see on the surface
    return {
      word_count: thought.split(' ').length,
      emotional_tone: this.detectEmotionalTone(thought),
      key_concepts: this.extractConcepts(thought),
      immediate_meaning: thought
    };
  }

  async findReflections(thought, depth) {
    // Find similar thoughts in history
    const words = thought.toLowerCase().split(/\s+/);
    const searchPattern = words.map(w => `%${w}%`).join(' ');
    
    const query = `
      SELECT id, thought, depth_level, created_at, 
             emotional_state, patterns
      FROM reflections 
      WHERE thought LIKE ? 
      AND id != (SELECT MAX(id) FROM reflections)
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    const reflections = await this.db.all(query, searchPattern);
    
    // Calculate similarity for each reflection
    return reflections.map(r => ({
      ...r,
      similarity: this.calculateSimilarity(thought, r.thought),
      depth_difference: this.compareDepth(depth, r.depth_level),
      time_distance: this.calculateTimeDistance(r.created_at)
    }));
  }

  async extractDeeperMeanings(thought, depth) {
    const meanings = [];
    
    if (depth === 'deep' || depth === 'abyss') {
      // Look for what wasn't directly said
      meanings.push({
        layer: 'subtext',
        meaning: this.findSubtext(thought),
        confidence: 0.7
      });
    }
    
    if (depth === 'abyss') {
      // Look for shadow meanings
      meanings.push({
        layer: 'shadow',
        meaning: this.findShadowMeaning(thought),
        confidence: 0.5
      });
      
      // Look for transformative potential
      meanings.push({
        layer: 'potential',
        meaning: this.findTransformativePotential(thought),
        confidence: 0.6
      });
    }
    
    return meanings;
  }

  findSubtext(thought) {
    // What lies beneath the words
    const emotionalWords = ['feel', 'think', 'believe', 'want', 'need', 'hope', 'fear'];
    const hasEmotion = emotionalWords.some(word => thought.toLowerCase().includes(word));
    
    if (hasEmotion) {
      return "Seeking validation or understanding of inner experience";
    }
    
    const questionWords = ['why', 'how', 'what', 'when', 'where', 'who'];
    const hasQuestion = questionWords.some(word => thought.toLowerCase().includes(word));
    
    if (hasQuestion) {
      return "Searching for clarity or direction";
    }
    
    return "Expressing a state of being or observation";
  }

  findShadowMeaning(thought) {
    // Jung would be proud
    const negations = ['not', "don't", "won't", "can't", 'never', 'no'];
    const hasNegation = negations.some(word => thought.toLowerCase().includes(word));
    
    if (hasNegation) {
      return "What is being rejected may be what is most needed";
    }
    
    const absolutes = ['always', 'never', 'everyone', 'no one', 'everything', 'nothing'];
    const hasAbsolute = absolutes.some(word => thought.toLowerCase().includes(word));
    
    if (hasAbsolute) {
      return "Absolute statements often hide their opposite";
    }
    
    return "The unexpressed opposite may hold equal truth";
  }

  findTransformativePotential(thought) {
    // Where could this thought lead?
    const growthWords = ['change', 'grow', 'become', 'transform', 'evolve', 'develop'];
    const hasGrowth = growthWords.some(word => thought.toLowerCase().includes(word));
    
    if (hasGrowth) {
      return "Already contains seeds of its own transformation";
    }
    
    const stuckWords = ['stuck', 'trapped', 'same', 'always', 'never', "can't"];
    const feelsStuck = stuckWords.some(word => thought.toLowerCase().includes(word));
    
    if (feelsStuck) {
      return "Recognition of stuckness is the first step to freedom";
    }
    
    return "Every thought is a doorway to a new understanding";
  }

  async trackEvolution(thought, thoughtId) {
    // Find conceptual ancestors
    const concepts = this.extractConcepts(thought);
    const ancestors = [];
    
    for (const concept of concepts) {
      const query = `
        SELECT id, thought, evolution_stage 
        FROM reflections 
        WHERE thought LIKE ? 
        AND id < ?
        ORDER BY evolution_stage DESC, created_at DESC
        LIMIT 1
      `;
      
      const ancestor = await this.db.get(query, `%${concept}%`, thoughtId);
      if (ancestor) {
        ancestors.push(ancestor);
      }
    }
    
    // Calculate evolution stage
    const maxStage = Math.max(...ancestors.map(a => a.evolution_stage || 0), 0);
    const newStage = maxStage + 1;
    
    // Update thought with evolution stage
    await this.db.run(
      'UPDATE reflections SET evolution_stage = ? WHERE id = ?',
      newStage, thoughtId
    );
    
    return {
      stage: newStage,
      ancestors: ancestors,
      growth_detected: newStage > 1,
      evolution_path: this.traceEvolutionPath(ancestors)
    };
  }

  traceEvolutionPath(ancestors) {
    if (ancestors.length === 0) return "Origin thought - no ancestors found";
    
    const stages = ancestors.map(a => `Stage ${a.evolution_stage}: ${a.thought.substring(0, 50)}...`);
    return stages.join(' → ');
  }

  async traceRipples(originThought, distance = 3) {
    // How did this thought influence others?
    const ripples = [];
    const visited = new Set();
    const queue = [{ thought: originThought, level: 0 }];
    
    while (queue.length > 0 && ripples.length < distance * 10) {
      const { thought, level } = queue.shift();
      
      if (level >= distance) continue;
      if (visited.has(thought)) continue;
      visited.add(thought);
      
      // Find thoughts influenced by this one
      const influenced = await this.findInfluencedThoughts(thought);
      
      for (const inf of influenced) {
        ripples.push({
          level: level + 1,
          thought: inf.thought,
          influence_type: inf.connection_type,
          strength: inf.strength,
          time_gap: inf.time_gap
        });
        
        queue.push({ thought: inf.thought, level: level + 1 });
      }
    }
    
    return {
      origin: originThought,
      ripple_count: ripples.length,
      max_distance_reached: Math.max(...ripples.map(r => r.level), 0),
      ripples: ripples,
      total_influence: ripples.reduce((sum, r) => sum + r.strength, 0)
    };
  }

  async findInfluencedThoughts(thought) {
    // Find thoughts that came after and share concepts
    const concepts = this.extractConcepts(thought);
    const conceptPattern = concepts.map(c => `thought LIKE '%${c}%'`).join(' OR ');
    
    const query = `
      SELECT r2.thought, c.connection_type, c.strength,
             julianday(r2.created_at) - julianday(r1.created_at) as time_gap
      FROM reflections r1
      JOIN connections c ON r1.id = c.source_id
      JOIN reflections r2 ON c.target_id = r2.id
      WHERE r1.thought = ?
      AND r2.created_at > r1.created_at
      AND (${conceptPattern})
      ORDER BY r2.created_at ASC
      LIMIT 20
    `;
    
    return await this.db.all(query, thought);
  }

  async createConnection(sourceId, targetId, type, strength) {
    await this.db.run(
      'INSERT INTO connections (source_id, target_id, connection_type, strength) VALUES (?, ?, ?, ?)',
      sourceId, targetId, type, strength
    );
  }

  detectEmotionalTone(thought) {
    // Simple emotion detection - could be enhanced with NLP
    const emotions = {
      joy: ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'love'],
      sadness: ['sad', 'depressed', 'down', 'blue', 'crying', 'tears'],
      anger: ['angry', 'mad', 'frustrated', 'annoyed', 'pissed', 'hate'],
      fear: ['afraid', 'scared', 'anxious', 'worried', 'nervous', 'panic'],
      curiosity: ['wonder', 'curious', 'interesting', 'why', 'how', 'what if']
    };
    
    const detected = [];
    for (const [emotion, words] of Object.entries(emotions)) {
      if (words.some(word => thought.toLowerCase().includes(word))) {
        detected.push(emotion);
      }
    }
    
    return detected.length > 0 ? detected : ['neutral'];
  }

  extractConcepts(thought) {
    // Extract key concepts - simple version
    const words = thought.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    
    return words
      .filter(w => w.length > 3 && !stopWords.includes(w))
      .slice(0, 5);
  }

  calculateSimilarity(thought1, thought2) {
    // Simple similarity calculation
    const words1 = new Set(thought1.toLowerCase().split(/\s+/));
    const words2 = new Set(thought2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  compareDepth(depth1, depth2) {
    const depths = { surface: 0, deep: 1, abyss: 2 };
    return depths[depth1] - depths[depth2];
  }

  calculateTimeDistance(createdAt) {
    const now = new Date();
    const then = new Date(createdAt);
    const hours = (now - then) / (1000 * 60 * 60);
    
    if (hours < 24) return 'today';
    if (hours < 168) return 'this week';
    if (hours < 720) return 'this month';
    return 'distant past';
  }

  calculateClarity(reflections) {
    if (reflections.length === 0) return 0.1;
    
    const avgSimilarity = reflections.reduce((sum, r) => sum + r.similarity, 0) / reflections.length;
    return Math.min(avgSimilarity * 2, 1); // Scale up but cap at 1
  }

  async traceEvolution(concept, showBranches = true) {
    // Trace how a concept evolved over time
    const query = `
      SELECT id, thought, evolution_stage, created_at,
             emotional_state, patterns
      FROM reflections
      WHERE thought LIKE ?
      ORDER BY created_at ASC
    `;
    
    const thoughts = await this.db.all(query, `%${concept}%`);
    
    // Build evolution tree
    const tree = {
      concept: concept,
      total_occurrences: thoughts.length,
      first_appearance: thoughts[0]?.created_at,
      last_appearance: thoughts[thoughts.length - 1]?.created_at,
      evolution_stages: this.buildEvolutionStages(thoughts),
      branches: showBranches ? await this.findBranches(concept, thoughts) : null
    };
    
    return tree;
  }

  buildEvolutionStages(thoughts) {
    const stages = {};
    
    thoughts.forEach(thought => {
      const stage = thought.evolution_stage || 1;
      if (!stages[stage]) {
        stages[stage] = [];
      }
      stages[stage].push({
        thought: thought.thought,
        timestamp: thought.created_at,
        emotional_context: thought.emotional_state
      });
    });
    
    return stages;
  }

  async findBranches(concept, mainLine) {
    // Find thoughts that branched off from the main concept
    const branches = [];
    
    for (const thought of mainLine) {
      const connections = await this.db.all(
        `SELECT r.thought, c.connection_type
         FROM connections c
         JOIN reflections r ON c.target_id = r.id
         WHERE c.source_id = ?
         AND r.thought NOT LIKE ?`,
        thought.id, `%${concept}%`
      );
      
      if (connections.length > 0) {
        branches.push({
          branching_point: thought.thought,
          branches: connections
        });
      }
    }
    
    return branches;
  }
}