import { EventEmitter } from 'events';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

class ReflectionEngine extends EventEmitter {
  constructor(reflectionsPath = 'reflections') {
    super();
    this.reflectionsPath = reflectionsPath;
    this.reflections = new Map();
    this.connections = new Map();
    this.timeline = [];
  }

  async initialize() {
    try {
      await mkdir(this.reflectionsPath, { recursive: true });
      await this.loadExistingReflections();
      this.emit('initialized', { count: this.reflections.size });
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async reflectThought(thought, depth = 'deep', includeEvolution = true) {
    const timestamp = new Date().toISOString();
    const thoughtHash = this.generateHash(thought);
    
    const reflection = {
      id: thoughtHash,
      original: thought,
      depth: depth,
      timestamp: timestamp,
      mirrors: [],
      resonance: 0,
      evolution: includeEvolution ? [] : null
    };

    // Find echoes in existing reflections
    const echoes = await this.findEchoes(thought, depth);
    reflection.mirrors = echoes;
    
    // Calculate resonance based on mirror depth and connections
    reflection.resonance = this.calculateResonance(echoes, depth);
    
    // Trace evolution if requested
    if (includeEvolution) {
      reflection.evolution = await this.traceThoughtEvolution(thought);
    }
    
    // Store the reflection
    this.reflections.set(thoughtHash, reflection);
    this.timeline.push({ timestamp, id: thoughtHash, type: 'reflection' });
    
    // Save to disk
    await this.saveReflection(reflection);
    
    return {
      reflection,
      insights: this.generateInsights(reflection),
      questions: this.generateDeeperQuestions(thought, depth)
    };
  }

  async findEchoes(thought, depth) {
    const echoes = [];
    const keywords = this.extractKeywords(thought);
    
    for (const [id, reflection] of this.reflections) {
      const similarity = this.calculateSimilarity(thought, reflection.original);
      const keywordMatch = this.keywordOverlap(keywords, reflection.keywords || []);
      
      if (similarity > 0.3 || keywordMatch > 0.4) {
        echoes.push({
          id: id,
          similarity: similarity,
          keywordMatch: keywordMatch,
          original: reflection.original,
          timestamp: reflection.timestamp,
          resonance: reflection.resonance || 0
        });
      }
    }
    
    // Sort by combined score
    echoes.sort((a, b) => {
      const scoreA = (a.similarity * 0.6) + (a.keywordMatch * 0.4);
      const scoreB = (b.similarity * 0.6) + (b.keywordMatch * 0.4);
      return scoreB - scoreA;
    });
    
    // Limit based on depth
    const limits = { surface: 3, deep: 7, abyss: 15 };
    return echoes.slice(0, limits[depth] || 7);
  }

  async traceEvolution(concept, showBranches = true) {
    const evolution = {
      concept: concept,
      origin: null,
      timeline: [],
      branches: showBranches ? [] : null,
      transformations: []
    };
    
    // Find all reflections containing the concept
    const relatedReflections = [];
    for (const [id, reflection] of this.reflections) {
      if (this.containsConcept(reflection.original, concept)) {
        relatedReflections.push({ id, reflection, timestamp: new Date(reflection.timestamp) });
      }
    }
    
    // Sort by timestamp
    relatedReflections.sort((a, b) => a.timestamp - b.timestamp);
    
    if (relatedReflections.length > 0) {
      evolution.origin = {
        id: relatedReflections[0].id,
        thought: relatedReflections[0].reflection.original,
        timestamp: relatedReflections[0].reflection.timestamp
      };
      
      // Build timeline
      for (let i = 0; i < relatedReflections.length; i++) {
        const current = relatedReflections[i];
        const previous = i > 0 ? relatedReflections[i-1] : null;
        
        const timelineEntry = {
          id: current.id,
          thought: current.reflection.original,
          timestamp: current.reflection.timestamp,
          transformation: previous ? this.identifyTransformation(previous.reflection.original, current.reflection.original) : 'origin'
        };
        
        evolution.timeline.push(timelineEntry);
        
        if (timelineEntry.transformation !== 'continuation') {
          evolution.transformations.push(timelineEntry.transformation);
        }
      }
      
      // Find branches if requested
      if (showBranches) {
        evolution.branches = this.findConceptBranches(relatedReflections, concept);
      }
    }
    
    return evolution;
  }

  async traceRipples(originThought, rippleDistance = 3) {
    const ripples = {
      origin: originThought,
      waves: [],
      totalImpact: 0,
      affectedThoughts: []
    };
    
    const originHash = this.generateHash(originThought);
    const visited = new Set([originHash]);
    let currentWave = [originHash];
    
    for (let distance = 1; distance <= rippleDistance && currentWave.length > 0; distance++) {
      const nextWave = [];
      const waveData = {
        distance: distance,
        thoughts: [],
        strength: 1 / distance
      };
      
      for (const thoughtId of currentWave) {
        const connections = this.connections.get(thoughtId) || [];
        
        for (const connectedId of connections) {
          if (!visited.has(connectedId)) {
            visited.add(connectedId);
            nextWave.push(connectedId);
            
            const reflection = this.reflections.get(connectedId);
            if (reflection) {
              waveData.thoughts.push({
                id: connectedId,
                thought: reflection.original,
                resonance: reflection.resonance * waveData.strength
              });
              
              ripples.affectedThoughts.push(reflection.original);
            }
          }
        }
      }
      
      if (waveData.thoughts.length > 0) {
        ripples.waves.push(waveData);
        ripples.totalImpact += waveData.thoughts.reduce((sum, t) => sum + t.resonance, 0);
      }
      
      currentWave = nextWave;
    }
    
    return ripples;
  }

  // Helper methods
  generateHash(text) {
    return createHash('sha256').update(text).digest('hex').substring(0, 16);
  }

  calculateSimilarity(text1, text2) {
    // Simple cosine similarity implementation
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const allWords = [...new Set([...words1, ...words2])];
    
    const vector1 = allWords.map(word => words1.includes(word) ? 1 : 0);
    const vector2 = allWords.map(word => words2.includes(word) ? 1 : 0);
    
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
    
    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  extractKeywords(text) {
    // Simple keyword extraction
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  keywordOverlap(keywords1, keywords2) {
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = [...set1].filter(x => set2.has(x));
    const union = new Set([...set1, ...set2]);
    return union.size > 0 ? intersection.length / union.size : 0;
  }

  calculateResonance(echoes, depth) {
    if (echoes.length === 0) return 0;
    
    const depthMultipliers = { surface: 0.5, deep: 1.0, abyss: 1.5 };
    const multiplier = depthMultipliers[depth] || 1.0;
    
    const avgSimilarity = echoes.reduce((sum, echo) => sum + echo.similarity, 0) / echoes.length;
    const connectionBonus = Math.min(echoes.length * 0.1, 0.5);
    
    return Math.min((avgSimilarity + connectionBonus) * multiplier, 1.0);
  }

  generateInsights(reflection) {
    const insights = [];
    
    if (reflection.resonance > 0.7) {
      insights.push({
        type: 'strong_pattern',
        message: 'This thought resonates deeply with your reflection history',
        confidence: reflection.resonance
      });
    }
    
    if (reflection.mirrors.length > 5) {
      insights.push({
        type: 'recurring_theme',
        message: 'This appears to be a central theme in your reflections',
        connections: reflection.mirrors.length
      });
    }
    
    if (reflection.evolution && reflection.evolution.length > 3) {
      insights.push({
        type: 'evolving_concept',
        message: 'This concept has undergone significant evolution',
        stages: reflection.evolution.length
      });
    }
    
    return insights;
  }

  generateDeeperQuestions(thought, currentDepth) {
    const questions = [];
    
    // Surface questions
    questions.push(`What immediate feeling does "${thought}" evoke?`);
    questions.push(`What's the simplest truth within this thought?`);
    
    // Deep questions
    if (currentDepth !== 'surface') {
      questions.push(`What assumption underlies "${thought}"?`);
      questions.push(`If this thought were a question, what would it ask?`);
    }
    
    // Abyss questions
    if (currentDepth === 'abyss') {
      questions.push(`What does this thought fear to acknowledge?`);
      questions.push(`Where does this thought meet the ineffable?`);
      questions.push(`What would remain if this thought dissolved?`);
    }
    
    return questions;
  }

  containsConcept(text, concept) {
    const normalizedText = text.toLowerCase();
    const normalizedConcept = concept.toLowerCase();
    
    // Check for exact match
    if (normalizedText.includes(normalizedConcept)) return true;
    
    // Check for word-based match
    const conceptWords = normalizedConcept.split(/\s+/);
    return conceptWords.every(word => normalizedText.includes(word));
  }

  identifyTransformation(previousThought, currentThought) {
    const similarity = this.calculateSimilarity(previousThought, currentThought);
    
    if (similarity > 0.8) return 'continuation';
    if (similarity > 0.5) return 'evolution';
    if (similarity > 0.3) return 'divergence';
    return 'leap';
  }

  findConceptBranches(reflections, concept) {
    // Implementation for finding conceptual branches
    const branches = [];
    // ... complex branching logic ...
    return branches;
  }

  async loadExistingReflections() {
    // Load reflections from disk
    try {
      // Implementation depends on storage format
    } catch (error) {
      console.log('No existing reflections found, starting fresh');
    }
  }

  async saveReflection(reflection) {
    const filename = `${reflection.id}.json`;
    const filepath = join(this.reflectionsPath, filename);
    await writeFile(filepath, JSON.stringify(reflection, null, 2));
  }

  async traceThoughtEvolution(thought) {
    // Simplified implementation
    return [];
  }
}

export { ReflectionEngine };