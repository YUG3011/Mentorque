/**
 * Recommendation Service
 * Scores mentors for each user based on:
 * 1. Tag overlap score
 * 2. Keyword similarity in descriptions
 * 3. Call type preference bonuses
 */

const CALL_TYPE_PREFERENCES = {
  'Resume Revamp': {
    preferredTags: ['big tech', 'google', 'amazon', 'microsoft', 'apple', 'meta', 'netflix', 'resume'],
    bonus: 2,
  },
  'Job Market Guidance': {
    preferredTags: ['communication', 'career coaching', 'job market', 'leadership', 'agile', 'product management'],
    bonus: 2,
  },
  'Mock Interviews': {
    preferredTags: ['mock interviews', 'algorithms', 'system design', 'data science', 'frontend', 'backend', 'devops'],
    bonus: 1.5,
  },
};

/**
 * Compute tag overlap score between user and mentor
 */
function tagOverlapScore(userTags, mentorTags) {
  const userSet = new Set(userTags.map((t) => t.toLowerCase()));
  const mentorSet = new Set(mentorTags.map((t) => t.toLowerCase()));
  let overlap = 0;
  for (const tag of userSet) {
    if (mentorSet.has(tag)) overlap++;
  }
  return overlap;
}

/**
 * Keyword similarity from descriptions (simple TF approach)
 */
function keywordSimilarity(userDesc, mentorDesc) {
  if (!userDesc || !mentorDesc) return 0;

  const tokenize = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const userWords = new Set(tokenize(userDesc));
  const mentorWords = new Set(tokenize(mentorDesc));

  let shared = 0;
  for (const word of userWords) {
    if (mentorWords.has(word)) shared++;
  }

  const denominator = Math.sqrt(userWords.size * mentorWords.size);
  return denominator > 0 ? shared / denominator : 0;
}

/**
 * Call type preference bonus
 */
function callTypeBonus(mentorTags, callType) {
  if (!callType || !CALL_TYPE_PREFERENCES[callType]) return 0;

  const pref = CALL_TYPE_PREFERENCES[callType];
  const mentorTagLower = mentorTags.map((t) => t.toLowerCase());
  const hasPreferred = pref.preferredTags.some((pt) => mentorTagLower.includes(pt.toLowerCase()));

  return hasPreferred ? pref.bonus : 0;
}

/**
 * Score all mentors for a given user
 */
function scoreMentors(user, mentors, callType = null) {
  const scored = mentors.map((mentor) => {
    const tagScore = tagOverlapScore(user.tags || [], mentor.tags || []);
    const kwScore = keywordSimilarity(user.description, mentor.description) * 3; // weighted
    const ctBonus = callTypeBonus(mentor.tags || [], callType);

    const totalScore = tagScore + kwScore + ctBonus;

    return {
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        tags: mentor.tags,
        description: mentor.description,
      },
      scores: {
        tagScore: parseFloat(tagScore.toFixed(2)),
        keywordScore: parseFloat(kwScore.toFixed(2)),
        callTypeBonus: parseFloat(ctBonus.toFixed(2)),
        total: parseFloat(totalScore.toFixed(2)),
      },
    };
  });

  return scored.sort((a, b) => b.scores.total - a.scores.total);
}

module.exports = { scoreMentors };
