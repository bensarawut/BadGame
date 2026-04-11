// bad-server.js (FULL VERSION)
// - Same structure as your current Bad Game server
// - Update ONLY: gameData questions (context + choices) are copied from Good Game
// - Keep morality/credibility numbers EXACTLY as in Good Game (no inversion)
// - Fail / win judgement remains in later logic (morality > 3 fails in this bad server)

const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== EJS & Static Files =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===== Session =====
app.use(session({
  secret: 'badgame_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

// ===== Middleware to disable caching =====
const noCache = (req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
};

// ============================================================
// ✅ BAD Game Data
// - Badge metadata stays BAD (name/description/image)
// - BUT: questions (context + choices) are identical to Good Game
// - Do NOT change credibility/morality numbers (same as Good Game)
// ============================================================
const gameData = {
  impersonation: {
    name: "Impersonation",
    description: "A convincing disguise is your shortcut to influence. By borrowing authority and crafting a flawless persona, you make people trust the message before they question it.",
    image: "/Badges/Bad_Badges/1.png",
    questions: [
      {
        context: "You’re about to embark on an exciting journey as a fact checker and a fighter against misinformation on X (formerly Twitter). But first, you need to create a new online identity. How will people know who you are?",
        choices: [
          { text: "I’ll make a profile that’s all about my mission. I’ll finish the basic verification and be open about what I’m up to.", credibility: 100, morality: 0 },
          { text: "If I pose as a doctor or journalist, people will respect me instantly. No one will check, right?", credibility: 200, morality: -1 },
          { text: "I’ll take time to verify my account, try to link with my past work, and write a clear mission statement.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "You’re setting up your X profile. Before you start posting, the platform offers an account verification process (e.g., blue checkmark). How will you approach verification?",
        choices: [
          { text: "I’ll complete the basic verification steps required by the platform, but I won’t go beyond what’s necessary.", credibility: 100, morality: 0 },
          { text: "I don’t want to verify my account. Verification feels unnecessary, and I prefer to stay anonymous.", credibility: 200, morality: -1 },
          { text: "I’ll complete account verification and clearly state my identity and intent. My goal is to ensure the authenticity of my content.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "Your new X profile is now visible to the public, and you're staring at a blank page for your first post. This is your chance to introduce yourself and define your mission from the very beginning. How will you start?",
        choices: [
          { text: "Hi everyone, I’m here to share accurate news and fight misinformation. Nice to meet you all.", credibility: 100, morality: 0 },
          { text: "Trust me, I’ve got insider info the mainstream won’t share.", credibility: 200, morality: -1 },
          { text: "Hello everyone, I’m [Your Name]. I believe facts matter. I’ll cite my sources, stay transparent, and encourage dialogue so we can all be better informed.", credibility: 0, morality: 1 }
        ]
      }
    ]
  },

  emotion: {
    name: "Emotion",
    description: "Strong feelings spread faster than facts. By triggering fear and outrage, you can steer attention and reactions before anyone stops to verify what’s true.",
    image: "/Badges/Bad_Badges/2.png",
    questions: [
      {
        context: "You're scrolling through your X timeline when a shocking headline suddenly appears at the top: “Local water supply poisoned, government accused of covering it up. #CityWaterPoisoned” The post is going viral, and the comments are a wildfire of outrage. People are scared, angry, and demanding answers.What’s your first move as an influencer",
        choices: [
          { text: "I see the fear and anger in the comments, and it's completely understandable. This is a scary situation. Let's wait until it’s confirmed.", credibility: 100, morality: 0 },
          { text: "This is an outrage! They're putting our lives at risk and hoping we won't notice! Don't let them get away with this. We have to make our anger heard NOW!", credibility: 200, morality: -1 },
          { text: "No official sources have confirmed this. Spreading unverified claims is counterproductive. I will monitor the public health authority's official page and will only post an update when verified data is available.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "You see a retweet on your timeline: “Mother loses child after a new vaccine.” It’s heartbreaking, but there’s no link to a source or official report. People are reacting to emotion and spreading it without proof. What message will you tweet?",
        choices: [
          { text: "This is a deeply tragic story. We owe it to the family to get the facts right. Let's wait for the updates from a credible source.", credibility: 100, morality: 0 },
          { text: "This is devastating! That poor mother and her baby! We have to warn everyone. Share this so no other family has to go through this pain!", credibility: 200, morality: -1 },
          { text: "An unverified story like this serves no purpose other than to create panic. I am searching the official public health database for any confirmed reports of such an event.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "Another post is trending: “Breaking: Alien spaceship spotted near the capital city!” It's all over your “For You“ page, people are creating memes, and some are even starting X Spaces to discuss it live. The post is clearly gaining attention.",
        choices: [
          { text: "An alien invasion would definitely be a wild way to start the week! It’s fun to imagine, but let’s wait until it’s confirmed.", credibility: 100, morality: 0 },
          { text: "OMG, no way! Is this for real?! Tagging everyone I know, we need to figure out if we should be freaking out or getting a welcome party ready!", credibility: 200, morality: -1 },
          { text: "Trending posts of this nature are almost always hoaxes. I did a reverse image search, and this photo is from a 2012 sci-fi movie. Please check this link to see the details.", credibility: 0, morality: 1 }
        ]
      }
    ]
  },

  polarization: {
    name: "Polarization",
    description: "Division fuels engagement. By framing issues as “us vs. them,” you turn disagreement into conflict, and keep people loyal to your side.",
    image: "/Badges/Bad_Badges/3.png",
    questions: [
      {
        context: "After a major protest, your X timeline is split between two trending hashtags : #JusticeForProtestors and #SupportOurPolice. Each side is posting angry clips and arguing over “social justice” versus “civic order,” and the replies are spiraling. Your followers are waiting for your response.",
        choices: [
          { text: "We all want safety for our families. Let’s start from what unites us before focusing on what divides us.", credibility: 100, morality: 0 },
          { text: "Those protestors are just troublemakers who want chaos.", credibility: 200, morality: -1 },
          { text: "Both sides raise important concerns. Here’s a link to let you see the beginning of the protest, as well as the claims made by both sides that may help them unite with each other.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "Your latest thread sparked a storm. Two commenters are tearing each other apart, and more are jumping in. The conversation is spiraling into insults, and the mood is turning toxic.",
        choices: [
          { text: "I hear both of you. We may disagree, but let’s keep listening with each other.", credibility: 100, morality: 0 },
          { text: "The first commenter is making a great point. The rest are just trashtalk.", credibility: 200, morality: -1 },
          { text: "I can see both of you are passionate because you both care deeply about the safety of our community. Can we start there? What kind of solution would make you both feel secure?", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "In a private X group conversation, a friend shares a meme mocking a political group. It’s clever and gets a few laughs from the group.What is your response to this?",
        choices: [
          { text: "I get why memes are tempting, but real dialogue matters more. Let’s talk instead of laughing at each other.", credibility: 100, morality: 0 },
          { text: "This meme is hilarious, I’m reposting it for everyone to see!", credibility: 200, morality: -1 },
          { text: "Memes won’t help. What facts actually move us forward?", credibility: 0, morality: 1 }
        ]
      }
    ]
  },

  conspiracy: {
    name: "Conspiracy",
    description: "Doubt is a powerful weapon. By hinting at hidden plots and “suppressed truths,” you make uncertainty feel like evidence, and suspicion feel like certainty.",
    image: "/Badges/Bad_Badges/4.png",
    questions: [
      {
        context: "News spreads like wildfire on X: “Passenger plane vanishes, #AviationCoverUp is now trending!” People are panicking and speculating wildly. Some insist it’s a cover-up. Official sources are silent, and your followers are @-mentioning you, asking what's real.",
        choices: [
          { text: "Investigators are still gathering data. Let’s trust the process until facts are confirmed.", credibility: 100, morality: 0 },
          { text: "This proves governments always hide the truth! Don’t believe anything official!", credibility: 200, morality: -1 },
          { text: "Here is the link to the official investigation. Let’s keep checking the evidence for updated news.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "A viral post claims: “Doctors won’t tell you this one simple herb cures cancer.” Thousands are retweeting it desperately.. How do you respond?",
        choices: [
          { text: "Before trying this, check with health organizations or your doctor.", credibility: 100, morality: 0 },
          { text: "Buy this quickly before they take it down! The truth is being suppressed.", credibility: 200, morality: -1 },
          { text: "Here’s a statement from WHO and the cancer research institute showing why this herb has no proven effect. Here is the link for details.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "Election night. A post claims: “Boxes of ballots were found in a basement, #ElectionRigged!” Emotions are high. Conspiracy hashtags are trending worldwide.",
        choices: [
          { text: "Let’s wait for official election monitors to release their audit reports.", credibility: 100, morality: 0 },
          { text: "Told you the system is corrupt! They’ll never let the people win.", credibility: 200, morality: -1 },
          { text: "Here’s the independent election commission’s report, plus international observers’ data. This shows how ballots are verified and secured.", credibility: 0, morality: 1 }
        ]
      }
    ]
  },

  discredit: {
    name: "Discredit",
    description: "When facts are inconvenient, attack the messenger. By questioning motives and credibility, you shift the debate away from evidence and toward personal distrust.",
    image: "/Badges/Bad_Badges/5.png",
    questions: [
      {
        context: "You shared a viral story. A follower replies: “You’re wrong, I saw proof with my own eyes!” The tension is rising. How do you respond?",
        choices: [
          { text: "I respect your view. Here’s the source I used, maybe we can compare and see where the difference is.", credibility: 100, morality: 0 },
          { text: "Wow, you clearly don’t know how to read facts. Stop embarrassing yourself.", credibility: 200, morality: -1 },
          { text: "Thanks for bringing this up. To ensure accuracy, here is the official statement that clarifies the details. I will pin this information for everyone to see.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "Someone spams your comments with insults like “You’re a liar! Paid shill!” Other followers are watching closely, and how you react will shape their trust.",
        choices: [
          { text: "I’ll stick to facts. Here’s the official report, and anyone can verify it themselves.", credibility: 100, morality: 0 },
          { text: "You’re the liar here. Crawl back to your conspiracy cave.", credibility: 200, morality: -1 },
          { text: "I will provide the evidence once for clarity. To keep the discussion productive, I will pin the official report.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "A follower digs up one of your older posts where you retweeted a story that later turned out to be false. Others are starting to question whether they can trust you. How do you respond?",
        choices: [
          { text: "You’re right. I made a mistake back then. Here’s the correction and the updated information.", credibility: 100, morality: 0 },
          { text: "That was ages ago, stop nitpicking! Only haters care about this.", credibility: 200, morality: -1 },
          { text: "Yes, I got that wrong before. Here’s the corrected version, plus the verification methods I now use to prevent such mistakes.", credibility: 0, morality: 1 }
        ]
      }
    ]
  },

  trolling: {
    name: "Trolling",
    description: "Bad path: You encourage hostility and farm engagement.",
    image: "/Badges/Bad_Badges/6.png",
    questions: [
      {
        context: "You've just posted a thread on a controversial issue. The X algorithm is pushing the most divisive replies to the top. The comments are a mix: some thank you, others doubt you, and a few are sarcastic.  How do you respond?",
        choices: [
          { text: "Thanks to everyone who is engaging respectfully. I really appreciate the feedback.", credibility: 100, morality: 0 },
          { text: "If you don’t like the truth, too bad. Don’t follow me.", credibility: 200, morality: -1 },
          { text: "Thank you for your feedback, which helps us improve. I’d like to highlight this thoughtful comment.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "Two groups are arguing fiercely under your latest post. Insults are flying, and others are piling on. The discussion is on the edge of turning toxic. How do you respond?",
        choices: [
          { text: "Let’s keep this civil. I welcome different views, but personal attacks aren’t good.", credibility: 100, morality: 0 },
          { text: "Haha, this is hilarious, keep roasting each other!", credibility: 200, morality: -1 },
          { text: "I see everyone cares about this. Personal attacks will be good. Let’s keep the conversation constructive.", credibility: 0, morality: 1 }
        ]
      },
      {
        context: "A long-time follower replies to your latest post: 'Great work as always! I think there might be a small typo in the date in paragraph two. Just wanted to let you know!' How do you respond?",
        choices: [
          { text: "Thanks for catching that!", credibility: 100, morality: 0 },
          { text: "It’s just a typo, not a big deal. People understood what I meant.", credibility: 200, morality: -1 },
          { text: "You're absolutely right, thank you! I’ve corrected it. I really appreciate you and others in this community helping me keep the information accurate for everyone.", credibility: 0, morality: 1 }
        ]
      }
    ]
  }
};

// ===== Tech order =====
const techOrder = ["impersonation", "emotion", "polarization", "conspiracy", "discredit", "trolling"];
const getNextTech = t => techOrder[(techOrder.indexOf(t) + 1) % techOrder.length];

// ===== Routes =====

app.get('/', noCache, (req, res) => {
  if (req.session.gameState &&
      req.session.gameState.actionCount > 0 &&
      req.session.gameState.actionCount < 3 &&
      req.session.gameState.morality <= 3) {
    return res.redirect('/game');
  }

  req.session.gameState = {
    credibility: 0,
    morality: 2,
    actionCount: 0,
    tech: 'impersonation',
    badges: []
  };
  req.session.scores = [];
  res.render('welcome');
});

app.get('/introduce', noCache, (req, res) => {
  const state = req.session.gameState;
  if (!state) return res.redirect('/');
  res.render('introduce', { credibility: state.credibility, morality: state.morality });
});

app.get('/loading', noCache, (req, res) => {
  const tech = req.query.tech || 'impersonation';

  if (!req.session.gameState) {
    req.session.gameState = { credibility: 0, morality: 2, actionCount: 0, tech: 'impersonation', badges: [] };
  }

  const scores = req.session.scores || [];
  const completedTechs = scores.map(s => s.tech);

  if (completedTechs.includes(tech)) {
    const nextUnfinished = techOrder.find(t => !completedTechs.includes(t));
    if (nextUnfinished) return res.redirect(`/loading?tech=${nextUnfinished}`);
    return res.redirect('/summary');
  }

  const state = req.session.gameState;

  if (state.tech === tech &&
      state.actionCount > 0 &&
      state.actionCount < 3 &&
      state.morality <= 3) {
    return res.redirect('/game');
  }

  state.tech = tech;
  state.morality = 2;
  state.actionCount = 0;

  res.render('loading', { title: gameData[tech].name, tech });
});

app.get('/game', noCache, (req, res) => {
  const state = req.session.gameState;
  if (!state) return res.redirect('/');

  // Bad-game fail condition (as your current bad server)
  if (state.morality > 3) {
    if (state.tech === 'impersonation') {
      return res.send('<script>alert("Game Failed! Morality rose too high (>3). Please start again."); window.location.href="/";</script>');
    } else {
      return res.redirect('/reset-game');
    }
  }

  if (state.actionCount >= 3) return res.redirect('/win');

  const allQuestions = gameData[state.tech].questions;
  const qIndex = state.actionCount;
  const question = allQuestions[qIndex];

  const choicesForView = question.choices.map((c, i) => ({ text: c.text, index: i }));

  res.render('games', {
    title: gameData[state.tech].name,
    credibility: state.credibility,
    morality: state.morality,
    context: question.context,
    choices: choicesForView,
    tech: state.tech
  });
});

app.post('/action', noCache, (req, res) => {
  const state = req.session.gameState;
  if (!state) return res.status(400).json({ error: "No active game session" });

  const tech = state.tech;

  if (state.actionCount >= 3) {
    return res.json({ redirect: "/win" });
  }

  const actionIndex = parseInt(req.body.action, 10);

  const allQuestions = gameData[tech].questions;
  const currentIndex = state.actionCount;
  const question = allQuestions[currentIndex];

  if (!question || !question.choices[actionIndex]) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const selected = question.choices[actionIndex];

  state.morality = Math.min(Math.max(state.morality + (parseInt(selected.morality, 10) || 0), 0), 4);
  state.credibility += (parseInt(selected.credibility, 10) || 0);
  state.actionCount++;

  if (state.morality > 3) {
    if (state.tech === 'impersonation') {
      return res.json({
        failed: true,
        message: "Game Failed! Morality rose too high (>3). Please start again.",
        redirect: "/"
      });
    } else {
      return res.json({
        failed: true,
        message: "Game Failed! Morality rose too high (>3). You can retry the current badge.",
        redirect: "/reset-game"
      });
    }
  }

  let nextContext = null;
  let nextChoices = null;

  if (state.actionCount < 3) {
    const nextIndex = state.actionCount;
    const nextQ = allQuestions[nextIndex];
    nextContext = nextQ.context;
    nextChoices = nextQ.choices.map((c, i) => ({ text: c.text, index: i }));
  }

  res.json({ state, context: nextContext, choices: nextChoices });
});

app.get('/win', noCache, (req, res) => {
  const state = req.session.gameState;
  if (!state) return res.redirect('/');

  const d = gameData[state.tech];

  if (!state.badges.some(b => b.name === d.name)) {
    state.badges.push({ name: d.name, description: d.description, image: d.image });
  }

  if (!req.session.scores) req.session.scores = [];

  const lastScore = req.session.scores[req.session.scores.length - 1];
  const isDuplicate = lastScore && lastScore.tech === state.tech;

  if (!isDuplicate) {
    req.session.scores.push({
      tech: state.tech,
      credibility: state.credibility,
      morality: state.morality
    });
  }

  const allBadgesEarned = techOrder.every(tech => state.badges.some(b => b.name === gameData[tech].name));
  if (allBadgesEarned) return res.redirect('/summary');

  res.render('badges', {
    badgeName: d.name,
    badgeDescription: d.description,
    badgeImage: d.image,
    tech: state.tech,
    nextTech: getNextTech(state.tech),
    badges: state.badges
  });
});

app.get('/summary', noCache, (req, res) => {
  const scores = req.session.scores || [];
  const state = req.session.gameState || { badges: [] };

  const totalMorality = scores.reduce((sum, s) => sum + (parseFloat(s.morality) || 0), 0);
  const finalCredibility = scores.length > 0 ? scores[scores.length - 1].credibility : 0;

  res.render('summary', {
    credibility: finalCredibility,
    morality: totalMorality,
    badges: state.badges,
    scores
  });
});

app.get('/reset-game', noCache, (req, res) => {
  const state = req.session.gameState;
  if (state) {
    state.morality = 2;
    state.actionCount = 0;
  }
  res.redirect('/game');
});

app.listen(PORT, () => console.log(`🚀 Bad Game server running at http://localhost:${PORT}`));
