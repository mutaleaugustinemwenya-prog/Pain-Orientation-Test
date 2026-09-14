/**
 * Destinal Orientation scoring engine.
 * Implements the logic described in data/scoring-rules.json.
 * Works both as a browser global (window.DestinalScoring) and as a
 * CommonJS module (require('./scoring.js')) for Node scripts like
 * scripts/generate-pdf.js.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.DestinalScoring = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /**
   * @param {Array<{id:string, orientation:string}>} questions
   * @param {Object<string, number>} answers - map of questionId -> Likert value
   * @param {Object} scoringRules - parsed scoring-rules.json
   * @returns {Object<string, {raw:number, count:number, normalized:number}>}
   */
  function computeRawAndNormalizedScores(questions, answers, scoringRules) {
    var scaleMin = scoringRules.scale.min;
    var scaleMax = scoringRules.scale.max;
    var orientations = scoringRules.orientations;

    var scores = {};
    orientations.forEach(function (id) {
      scores[id] = { raw: 0, count: 0, normalized: 0 };
    });

    questions.forEach(function (q) {
      var bucket = scores[q.orientation];
      if (!bucket) return;
      var value = answers[q.id];
      if (typeof value !== "number" || Number.isNaN(value)) return;
      bucket.raw += value;
      bucket.count += 1;
    });

    orientations.forEach(function (id) {
      var bucket = scores[id];
      var denom = bucket.count * (scaleMax - scaleMin);
      var normalized = denom > 0 ? (bucket.raw - bucket.count * scaleMin) / denom : 0;
      var roundTo = (scoringRules.output && scoringRules.output.roundNormalizedTo) || 2;
      var factor = Math.pow(10, roundTo);
      bucket.normalized = Math.round(normalized * factor) / factor;
    });

    return scores;
  }

  /**
   * Ranks orientations by normalized score, breaking ties using the
   * canonical order given in scoring-rules.json (earlier = higher rank).
   * @returns {string[]} orientation ids sorted highest to lowest
   */
  function rankOrientations(scores, canonicalOrder) {
    var ids = canonicalOrder.slice();
    var indexOf = {};
    canonicalOrder.forEach(function (id, i) {
      indexOf[id] = i;
    });
    ids.sort(function (a, b) {
      var diff = scores[b].normalized - scores[a].normalized;
      if (diff !== 0) return diff;
      return indexOf[a] - indexOf[b];
    });
    return ids;
  }

  function findVocation(vocations, orientationId) {
    return vocations.orientations.filter(function (o) {
      return o.id === orientationId;
    })[0];
  }

  /**
   * Runs the full scoring pipeline and returns a result object that
   * pulls descriptive/pathway content from vocations.json.
   *
   * @param {Object} params
   * @param {Object} params.questionsData - parsed questions.json
   * @param {Object} params.vocationsData - parsed vocations.json
   * @param {Object} params.scoringRulesData - parsed scoring-rules.json
   * @param {Object<string, number>} params.answers - map of questionId -> 1-5
   */
  function scoreResponses(params) {
    var questionsData = params.questionsData;
    var vocationsData = params.vocationsData;
    var scoringRulesData = params.scoringRulesData;
    var answers = params.answers;

    var scores = computeRawAndNormalizedScores(questionsData.questions, answers, scoringRulesData);
    var canonicalOrder = vocationsData.canonicalOrder || scoringRulesData.orientations;
    var ranked = rankOrientations(scores, canonicalOrder);

    var dominantId = ranked[0];
    var secondaryId = ranked[1];
    var shadowId = ranked[ranked.length - 1];

    function buildEntry(orientationId, role) {
      var vocation = findVocation(vocationsData, orientationId);
      return {
        id: orientationId,
        role: role,
        name: vocation.name,
        archetype: vocation.archetype,
        essence: vocation.essence,
        description:
          role === "shadow" ? vocation.shadowDescription : role === "secondary" ? vocation.secondaryDescription : vocation.dominantDescription,
        callingStatement: role === "dominant" ? vocation.callingStatement : undefined,
        strengths: role !== "shadow" ? vocation.strengths : undefined,
        watchOutFor: role === "dominant" ? vocation.watchOutFor : undefined,
        pathways: role !== "shadow" ? vocation.pathways : undefined,
        resonantFigure: role === "dominant" ? vocation.resonantFigure : undefined,
        score: {
          raw: scores[orientationId].raw,
          count: scores[orientationId].count,
          normalized: scores[orientationId].normalized
        }
      };
    }

    var allScores = {};
    canonicalOrder.forEach(function (id) {
      var vocation = findVocation(vocationsData, id);
      allScores[id] = {
        name: vocation.name,
        archetype: vocation.archetype,
        normalized: scores[id].normalized,
        raw: scores[id].raw,
        count: scores[id].count
      };
    });

    return {
      dominant: buildEntry(dominantId, "dominant"),
      secondary: buildEntry(secondaryId, "secondary"),
      shadow: buildEntry(shadowId, "shadow"),
      ranked: ranked,
      allScores: allScores
    };
  }

  return {
    computeRawAndNormalizedScores: computeRawAndNormalizedScores,
    rankOrientations: rankOrientations,
    scoreResponses: scoreResponses
  };
});
