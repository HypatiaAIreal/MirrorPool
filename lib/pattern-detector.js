// Pattern detection - finding the rhythms in the chaos of thought
import { Database } from 'sqlite';

export class PatternDetector {
  constructor() {
    this.patterns = new Map();
    this.patternThreshold = 0.3;
  }

  async findUndercurrents(timeframe = 'week', minDepth = 0.5) {
    // Find themes flowing beneath the surface
    const timeFilter = this.getTimeFilter(timeframe);
    
    // Get all thoughts in timeframe
    const thoughts = await this.getThoughtsInTimeframe(timeFilter);
    
    // Extract themes
    const themes = this.extractThemes(thoughts);
    
    // Find deep currents
    const undercurrents = themes.filter(theme => theme.depth >= minDepth);
    
    return {
      timeframe: timeframe,
      total_thoughts: thoughts.length,
      surface_themes: themes.filter(t => t.depth < 0.5),
      deep_currents: undercurrents,
      hidden_flow: this.findHiddenFlow(undercurrents),
      emergence_points: this.findEmergencePoints(thoughts, undercurrents)
    };
  }

  async discoverPatterns(patternTypes = ['emotional', 'conceptual'], threshold = 0.3) {
    const discoveredPatterns = {};
    
    for (const type of patternTypes) {
      discoveredPatterns[type] = await this.detectPatternType(type, threshold);
    }
    
    // Find meta-patterns (patterns of patterns)
    const metaPatterns = this.findMetaPatterns(discoveredPatterns);
    
    return {
      patterns: discoveredPatterns,
      meta_patterns: metaPatterns,
      pattern_strength: this.calculateOverallStrength(discoveredPatterns),
      insights: this.generateInsights(discoveredPatterns, metaPatterns)
    };
  }

  async detectPatternType(type, threshold) {
    switch (type) {
      case 'emotional':
        return await this.detectEmotionalPatterns(threshold);
      case 'conceptual':
        return await this.detectConceptualPatterns(threshold);
      case 'behavioral':
        return await this.detectBehavioralPatterns(threshold);
      case 'temporal':
        return await this.detectTemporalPatterns(threshold);
      default:
        return [];
    }
  }

  async detectEmotionalPatterns(threshold) {
    // Find recurring emotional patterns
    const emotionalData = await this.getEmotionalData();
    const patterns = [];
    
    // Group by emotion
    const emotionGroups = {};
    emotionalData.forEach(data => {
      const emotions = JSON.parse(data.emotional_state || '[]');
      emotions.forEach(emotion => {
        if (!emotionGroups[emotion]) {
          emotionGroups[emotion] = [];
        }
        emotionGroups[emotion].push(data);
      });
    });
    
    // Find patterns
    for (const [emotion, occurrences] of Object.entries(emotionGroups)) {
      if (occurrences.length >= 3) { // Pattern needs at least 3 occurrences
        const pattern = {
          type: 'emotional',
          pattern: emotion,
          frequency: occurrences.length,
          strength: occurrences.length / emotionalData.length,
          timeline: this.createTimeline(occurrences),
          triggers: await this.findTriggers(occurrences),
          cycles: this.detectCycles(occurrences)
        };
        
        if (pattern.strength >= threshold) {
          patterns.push(pattern);
        }
      }
    }
    
    return patterns;
  }

  async detectConceptualPatterns(threshold) {
    // Find recurring concepts and ideas
    const conceptData = await this.getConceptualData();
    const conceptMap = new Map();
    
    // Extract and count concepts
    conceptData.forEach(data => {
      const concepts = this.extractConceptsFromThought(data.thought);
      concepts.forEach(concept => {
        if (!conceptMap.has(concept)) {
          conceptMap.set(concept, []);
        }
        conceptMap.get(concept).push(data);
      });
    });
    
    // Build patterns
    const patterns = [];
    for (const [concept, occurrences] of conceptMap.entries()) {
      if (occurrences.length >= 3) {
        const relatedConcepts = this.findRelatedConcepts(concept, conceptMap);
        
        const pattern = {
          type: 'conceptual',
          pattern: concept,
          frequency: occurrences.length,
          strength: occurrences.length / conceptData.length,
          evolution: this.traceConceptEvolution(occurrences),
          related_concepts: relatedConcepts,
          semantic_field: this.buildSemanticField(concept, relatedConcepts)
        };
        
        if (pattern.strength >= threshold) {
          patterns.push(pattern);
        }
      }
    }
    
    return patterns;
  }

  async detectBehavioralPatterns(threshold) {
    // Find patterns in how thoughts are expressed
    const behaviorData = await this.getBehavioralData();
    const behaviors = {
      questioning: [],
      affirming: [],
      negating: [],
      exploring: [],
      concluding: []
    };
    
    // Classify behaviors
    behaviorData.forEach(data => {
      const behaviorType = this.classifyBehavior(data.thought);
      if (behaviors[behaviorType]) {
        behaviors[behaviorType].push(data);
      }
    });
    
    // Build patterns
    const patterns = [];
    for (const [behavior, occurrences] of Object.entries(behaviors)) {
      if (occurrences.length >= 2) {
        const pattern = {
          type: 'behavioral',
          pattern: behavior,
          frequency: occurrences.length,
          strength: occurrences.length / behaviorData.length,
          contexts: this.analyzeContexts(occurrences),
          typical_flow: this.findTypicalFlow(behavior, occurrences)
        };
        
        if (pattern.strength >= threshold) {
          patterns.push(pattern);
        }
      }
    }
    
    return patterns;
  }

  async detectTemporalPatterns(threshold) {
    // Find patterns in when thoughts occur
    const temporalData = await this.getTemporalData();
    const patterns = [];
    
    // Time of day patterns
    const hourlyDistribution = this.getHourlyDistribution(temporalData);
    const peakHours = this.findPeakHours(hourlyDistribution);
    
    if (peakHours.strength >= threshold) {
      patterns.push({
        type: 'temporal',
        pattern: 'peak_hours',
        data: peakHours,
        insight: this.interpretPeakHours(peakHours)
      });
    }
    
    // Day of week patterns
    const weeklyDistribution = this.getWeeklyDistribution(temporalData);
    const weeklyPattern = this.findWeeklyPattern(weeklyDistribution);
    
    if (weeklyPattern.strength >= threshold) {
      patterns.push({
        type: 'temporal',
        pattern: 'weekly_rhythm',
        data: weeklyPattern,
        insight: this.interpretWeeklyPattern(weeklyPattern)
      });
    }
    
    // Burst patterns
    const bursts = this.detectBursts(temporalData);
    if (bursts.length > 0) {
      patterns.push({
        type: 'temporal',
        pattern: 'thought_bursts',
        data: bursts,
        insight: this.interpretBursts(bursts)
      });
    }
    
    return patterns;
  }

  findMetaPatterns(patternGroups) {
    // Patterns of patterns - the deeper structure
    const metaPatterns = [];
    
    // Cross-type correlations
    const correlations = this.findCorrelations(patternGroups);
    if (correlations.length > 0) {
      metaPatterns.push({
        type: 'correlation',
        patterns: correlations,
        insight: 'Different aspects of your thoughts move together'
      });
    }
    
    // Pattern sequences
    const sequences = this.findPatternSequences(patternGroups);
    if (sequences.length > 0) {
      metaPatterns.push({
        type: 'sequence',
        patterns: sequences,
        insight: 'Your thoughts follow predictable sequences'
      });
    }
    
    return metaPatterns;
  }

  generateInsights(patterns, metaPatterns) {
    const insights = [];
    
    // Overall pattern density
    const totalPatterns = Object.values(patterns).flat().length;
    if (totalPatterns > 10) {
      insights.push({
        type: 'high_structure',
        message: 'Your thinking shows strong structural patterns',
        recommendation: 'Consider introducing more spontaneity'
      });
    } else if (totalPatterns < 3) {
      insights.push({
        type: 'low_structure',
        message: 'Your thinking is highly fluid and unstructured',
        recommendation: 'Some patterns can provide stability'
      });
    }
    
    // Dominant pattern type
    const dominantType = this.findDominantPatternType(patterns);
    insights.push({
      type: 'dominant_mode',
      message: `Your thinking is primarily ${dominantType}`,
      implication: this.interpretDominantType(dominantType)
    });
    
    // Meta-pattern insights
    if (metaPatterns.length > 0) {
      insights.push({
        type: 'deep_structure',
        message: 'Your thoughts have patterns within patterns',
        significance: 'High self-organization in thinking'
      });
    }
    
    return insights;
  }

  // Helper methods
  extractThemes(thoughts) {
    const themeMap = new Map();
    
    thoughts.forEach(thought => {
      const words = this.extractSignificantWords(thought.thought);
      words.forEach(word => {
        if (!themeMap.has(word)) {
          themeMap.set(word, { count: 0, thoughts: [], depth: 0 });
        }
        const theme = themeMap.get(word);
        theme.count++;
        theme.thoughts.push(thought);
        theme.depth = this.calculateThemeDepth(theme);
      });
    });
    
    return Array.from(themeMap.entries())
      .map(([word, data]) => ({ theme: word, ...data }))
      .sort((a, b) => b.depth - a.depth);
  }

  findHiddenFlow(undercurrents) {
    // Find the flow between deep themes
    if (undercurrents.length < 2) return null;
    
    const connections = [];
    for (let i = 0; i < undercurrents.length - 1; i++) {
      for (let j = i + 1; j < undercurrents.length; j++) {
        const connection = this.measureThemeConnection(
          undercurrents[i],
          undercurrents[j]
        );
        if (connection.strength > 0.5) {
          connections.push(connection);
        }
      }
    }
    
    return {
      connections: connections,
      flow_direction: this.determineFlowDirection(connections),
      convergence_points: this.findConvergencePoints(connections)
    };
  }

  findEmergencePoints(thoughts, undercurrents) {
    // Where do deep themes first appear?
    const emergencePoints = [];
    
    undercurrents.forEach(current => {
      const firstAppearance = current.thoughts
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
      
      emergencePoints.push({
        theme: current.theme,
        emerged_at: firstAppearance.created_at,
        context: firstAppearance.thought,
        preceded_by: this.findPrecedingThoughts(firstAppearance, thoughts)
      });
    });
    
    return emergencePoints;
  }

  extractSignificantWords(thought) {
    const words = thought.toLowerCase().split(/\s+/);
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'under', 'again',
      'further', 'then', 'once', 'is', 'am', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this',
      'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
      'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
      'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
      's', 't', 'd', 'll', 'm', 've', 're'
    ]);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .filter(word => !word.match(/^\d+$/)); // Remove pure numbers
  }

  calculateThemeDepth(theme) {
    // Depth based on frequency, consistency, and evolution
    const frequency = theme.count;
    const consistency = this.calculateConsistency(theme.thoughts);
    const evolution = this.calculateEvolution(theme.thoughts);
    
    return (frequency * 0.3 + consistency * 0.4 + evolution * 0.3) / 10;
  }

  calculateConsistency(thoughts) {
    // How consistently does this theme appear?
    if (thoughts.length < 2) return 0;
    
    const timestamps = thoughts.map(t => new Date(t.created_at).getTime());
    timestamps.sort((a, b) => a - b);
    
    const gaps = [];
    for (let i = 1; i < timestamps.length; i++) {
      gaps.push(timestamps[i] - timestamps[i - 1]);
    }
    
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
    
    // Lower variance = higher consistency
    return 1 / (1 + variance / avgGap);
  }

  calculateEvolution(thoughts) {
    // How much has this theme evolved?
    if (thoughts.length < 2) return 0;
    
    // Compare first and last occurrence
    const first = thoughts[0].thought;
    const last = thoughts[thoughts.length - 1].thought;
    
    // Simple evolution measure - how different are they?
    const similarity = this.calculateSimilarity(first, last);
    return 1 - similarity; // More different = more evolution
  }

  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  classifyBehavior(thought) {
    if (thought.includes('?')) return 'questioning';
    if (thought.match(/I am|I feel|I think|I believe/i)) return 'affirming';
    if (thought.match(/not|never|no|don't|won't|can't/i)) return 'negating';
    if (thought.match(/maybe|perhaps|might|could|possibly/i)) return 'exploring';
    if (thought.match(/therefore|thus|so|in conclusion|finally/i)) return 'concluding';
    return 'neutral';
  }

  // Stub methods for database interaction - would connect to actual DB
  async getThoughtsInTimeframe(timeFilter) {
    // Placeholder - would query database
    return [];
  }

  async getEmotionalData() {
    // Placeholder - would query database
    return [];
  }

  async getConceptualData() {
    // Placeholder - would query database
    return [];
  }

  async getBehavioralData() {
    // Placeholder - would query database
    return [];
  }

  async getTemporalData() {
    // Placeholder - would query database
    return [];
  }

  getTimeFilter(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // All time
    }
  }
}