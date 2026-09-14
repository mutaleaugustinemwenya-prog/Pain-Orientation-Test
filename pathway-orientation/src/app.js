(function () {
  "use strict";

  var state = {
    questionsData: null,
    vocationsData: null,
    scoringRulesData: null,
    order: [], // shuffled or natural order of question ids to present
    currentIndex: 0,
    answers: {} // questionId -> value
  };

  var screens = {
    intro: document.getElementById("screen-intro"),
    question: document.getElementById("screen-question"),
    results: document.getElementById("screen-results")
  };

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle("hidden", key !== name);
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function loadJSON(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path);
      return res.json();
    });
  }

  function init() {
    Promise.all([
      loadJSON("data/questions.json"),
      loadJSON("data/vocations.json"),
      loadJSON("data/scoring-rules.json")
    ])
      .then(function (results) {
        state.questionsData = results[0];
        state.vocationsData = results[1];
        state.scoringRulesData = results[2];
        state.order = state.questionsData.questions.map(function (q) {
          return q.id;
        });

        document.getElementById("intro-text").textContent = state.questionsData.instructions;
        document.getElementById("start-btn").addEventListener("click", startQuiz);
        document.getElementById("back-btn").addEventListener("click", goBack);
        document.getElementById("retake-btn").addEventListener("click", restart);
      })
      .catch(function (err) {
        document.getElementById("intro-text").textContent =
          "Something went wrong loading the question bank. Please refresh the page and try again.";
        console.error(err);
      });
  }

  function startQuiz() {
    state.currentIndex = 0;
    state.answers = {};
    showScreen("question");
    renderQuestion();
  }

  function restart() {
    startQuiz();
  }

  function currentQuestion() {
    var id = state.order[state.currentIndex];
    return state.questionsData.questions.filter(function (q) {
      return q.id === id;
    })[0];
  }

  function renderQuestion() {
    var q = currentQuestion();
    var total = state.order.length;
    var position = state.currentIndex + 1;

    document.getElementById("progress-fill").style.width = Math.round((position / total) * 100) + "%";
    document.getElementById("progress-label").textContent = "Question " + position + " of " + total;
    document.getElementById("question-text").textContent = q.text;

    var optionsEl = document.getElementById("likert-options");
    optionsEl.innerHTML = "";
    var selected = state.answers[q.id];

    state.questionsData.scale.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "likert-option" + (selected === opt.value ? " selected" : "");
      btn.innerHTML = '<span><span class="num">' + opt.value + "</span>" + opt.label + "</span>";
      btn.addEventListener("click", function () {
        selectAnswer(q.id, opt.value);
      });
      optionsEl.appendChild(btn);
    });

    document.getElementById("back-btn").disabled = state.currentIndex === 0;
  }

  function selectAnswer(questionId, value) {
    state.answers[questionId] = value;
    if (state.currentIndex < state.order.length - 1) {
      state.currentIndex += 1;
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  function goBack() {
    if (state.currentIndex === 0) return;
    state.currentIndex -= 1;
    renderQuestion();
  }

  function finishQuiz() {
    var result = window.PathwayScoring.scoreResponses({
      questionsData: state.questionsData,
      vocationsData: state.vocationsData,
      scoringRulesData: state.scoringRulesData,
      answers: state.answers
    });
    renderResults(result);
    showScreen("results");
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function renderOrientationBlock(entry, tagClass, tagLabel) {
    var block = el("div", "result-block");
    block.appendChild(el("span", "result-tag " + tagClass, tagLabel));
    block.appendChild(el("h2", null, entry.name + " — " + entry.archetype));
    block.appendChild(el("p", "archetype", entry.essence));

    if (entry.callingStatement) {
      block.appendChild(el("p", "calling", entry.callingStatement));
    }

    block.appendChild(el("p", null, entry.description));

    if (entry.strengths && entry.strengths.length) {
      block.appendChild(el("div", "section-label", "Your strengths here"));
      var ul = el("ul", "plain-list");
      entry.strengths.forEach(function (s) {
        ul.appendChild(el("li", null, s));
      });
      block.appendChild(ul);
    }

    if (entry.watchOutFor && entry.watchOutFor.length) {
      block.appendChild(el("div", "section-label", "Things to watch out for"));
      var ul2 = el("ul", "plain-list");
      entry.watchOutFor.forEach(function (s) {
        ul2.appendChild(el("li", null, s));
      });
      block.appendChild(ul2);
    }

    if (entry.pathways) {
      block.appendChild(el("div", "section-label", "Subjects to focus on"));
      block.appendChild(el("p", null, entry.pathways.subjectsToFocus.join(", ")));

      block.appendChild(el("div", "section-label", "Possible fields of study"));
      block.appendChild(el("p", null, entry.pathways.tertiaryFields.join(", ")));

      block.appendChild(el("div", "section-label", "Zambian institutions to look into"));
      var ul3 = el("ul", "plain-list");
      entry.pathways.zambianInstitutions.forEach(function (s) {
        ul3.appendChild(el("li", null, s));
      });
      block.appendChild(ul3);

      block.appendChild(el("div", "section-label", "Career examples"));
      block.appendChild(el("p", null, entry.pathways.careerExamples.join(", ")));
    }

    if (entry.resonantFigure) {
      block.appendChild(
        el(
          "p",
          "archetype",
          "Think of " + entry.resonantFigure.name + " — " + entry.resonantFigure.note + "."
        )
      );
    }

    return block;
  }

  function renderScoreOverview(result, vocationsData) {
    var wrap = el("div", "result-block");
    wrap.appendChild(el("div", "section-label", "All your scores"));
    vocationsData.canonicalOrder.forEach(function (id) {
      var s = result.allScores[id];
      var row = el("div", "score-bar-row");
      row.appendChild(el("span", "name", s.archetype));
      var track = el("div", "score-bar-track");
      var fill = el("div", "score-bar-fill");
      fill.style.width = Math.round(s.normalized * 100) + "%";
      track.appendChild(fill);
      row.appendChild(track);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderResults(result) {
    var container = document.getElementById("results-content");
    container.innerHTML = "";

    var heading = el("p", null,
      "<strong>Remember:</strong> you are not just one orientation. Your dominant orientation leads, your secondary orientation supports it, and your shadow orientation is simply the one that's quietest right now — not a flaw."
    );
    container.appendChild(heading);

    container.appendChild(renderOrientationBlock(result.dominant, "tag-dominant", "Dominant"));
    container.appendChild(renderOrientationBlock(result.secondary, "tag-secondary", "Secondary"));
    container.appendChild(renderOrientationBlock(result.shadow, "tag-shadow", "Shadow"));
    container.appendChild(renderScoreOverview(result, state.vocationsData));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
