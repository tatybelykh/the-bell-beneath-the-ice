"use strict";

const game = document.getElementById("game");
const cover = game.innerHTML;
const gameControls = document.getElementById("game-controls");
const notebook = document.getElementById("notebook");
const notebookButton = document.getElementById("open-notebook");
const notebookCount = document.getElementById("note-count");
const restartDialog = document.getElementById("restart-dialog");
const announcement = document.getElementById("announcement");
const finalChapter = chapters.length;
const allClues = chapters.flatMap(chapter => chapter.clues);
const storageKey = "greywick-investigation-v1";
const sceneArt = {
  gate: "./art/greywick.webp",
  archive: "./art/archive.webp",
  river: "./art/river.webp"
};

let progress = loadProgress();
let activeClueId = null;
let draft = emptyDraft();

function emptyProgress() {
  return { chapter: -1, found: new Set(), ending: null };
}

function emptyDraft() {
  return { tiles: [], tried: new Set(), typed: "", hint: false, retry: false };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!Number.isInteger(saved?.chapter) || !Array.isArray(saved.found)) return emptyProgress();

    const found = new Set(allClues.filter(clue => saved.found.includes(clue.id)).map(clue => clue.id));
    const firstIncomplete = chapters.findIndex(chapter => chapter.clues.some(clue => !found.has(clue.id)));
    const lastAvailable = firstIncomplete === -1 ? finalChapter : firstIncomplete;
    const chapter = Math.min(lastAvailable, Math.max(-1, saved.chapter));
    const ending = chapter === finalChapter && Object.hasOwn(endings, saved.ending) ? saved.ending : null;
    return { chapter, found, ending };
  } catch {
    return emptyProgress();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      chapter: progress.chapter,
      found: [...progress.found],
      ending: progress.ending
    }));
  } catch {
    // The current case remains playable when browser storage is unavailable.
  }
}

function activeClue() {
  return chapters[progress.chapter]?.clues.find(clue => clue.id === activeClueId);
}

function foundInChapter(chapter) {
  return chapter.clues.filter(clue => progress.found.has(clue.id)).length;
}

function focusInsideGame(selector, preventScroll = false) {
  game.querySelector(selector)?.focus({ preventScroll });
}

function announce(message) {
  announcement.textContent = message;
}

function renderSteps() {
  const labels = [...chapters.map(chapter => chapter.title), "Your choice"];
  return `<ol class="story-steps" aria-label="Places in the story">
    ${labels.map((label, index) => {
      const completed = index < progress.chapter ? " done" : "";
      const current = index === progress.chapter ? ' aria-current="step"' : "";
      return `<li class="story-step${completed}"${current}>${label}</li>`;
    }).join("")}
  </ol>`;
}

function renderChapter(chapter) {
  return `<div class="case-layout">
    <section class="scene-card" aria-labelledby="scene-title">
      <div class="scene-image" role="group" aria-label="Clues at ${chapter.title}">
        <img src="${sceneArt[chapter.key]}" alt="">
        ${chapter.clues.map((clue, index) => `
          <button type="button" class="marker" style="left: ${clue.position[0]}%; top: ${clue.position[1]}%"
            data-action="inspect" data-clue="${clue.id}" aria-pressed="false">
            <span class="marker-number" aria-hidden="true">${index + 1}</span>
            <span class="sr-only">Clue ${index + 1}: </span>
            <span>${clue.name}</span><span class="sr-only marker-status"></span>
          </button>
        `).join("")}
      </div>
      <div class="scene-caption">
        <h1 id="scene-title" tabindex="-1">${chapter.title}</h1>
        <p>${chapter.lead}</p>
        <p class="scene-count" id="scene-count"></p>
      </div>
    </section>
    <section class="case-panel" id="case-panel" aria-labelledby="puzzle-title"></section>
  </div>`;
}

function renderStory(moveFocus = false) {
  document.body.dataset.view = progress.chapter < 0 ? "cover" : "story";
  const chapter = chapters[progress.chapter];
  if (progress.chapter < 0) {
    game.innerHTML = cover;
  } else {
    game.innerHTML = `<div class="story-flow wrap">
      ${renderSteps()}
      ${chapter ? renderChapter(chapter) : renderFinale()}
    </div>`;
    if (chapter) renderPuzzle();
  }
  refreshClueIndicators();
  if (moveFocus) {
    window.scrollTo(0, 0);
    focusInsideGame(progress.chapter < 0 ? '[data-action="begin"]' : "h1", true);
  }
}

function refreshClueIndicators() {
  gameControls.hidden = progress.chapter < 0;
  notebookCount.textContent = `${progress.found.size}/${allClues.length}`;
  notebookButton.setAttribute("aria-label", `Case notes. ${progress.found.size} of ${allClues.length} clues found.`);

  const chapter = chapters[progress.chapter];
  if (!chapter) return;
  document.getElementById("scene-count").textContent = `${foundInChapter(chapter)} of ${chapter.clues.length} clues found here`;
  game.querySelectorAll(".marker").forEach(marker => {
    const found = progress.found.has(marker.dataset.clue);
    marker.classList.toggle("found", found);
    marker.setAttribute("aria-pressed", String(marker.dataset.clue === activeClueId));
    marker.querySelector(".marker-status").textContent = found ? ", clue found" : "";
  });
}

function renderPuzzle() {
  const panel = document.getElementById("case-panel");
  const chapter = chapters[progress.chapter];
  const complete = foundInChapter(chapter) === chapter.clues.length;
  const clue = activeClue();
  const nextButton = `<button type="button" class="button button-primary advance" data-action="advance">${chapter.next}</button>`;

  if (!clue) {
    panel.innerHTML = complete
      ? `<h2 id="puzzle-title" tabindex="-1">All clues found</h2>
         <p class="unselected">You have all the clues for this place.</p>${nextButton}`
      : `<h2 id="puzzle-title" tabindex="-1">Choose a clue</h2>
         <p class="unselected">Open the numbered clues in order. Read each clue and answer the question.</p>`;
    return;
  }

  const solved = progress.found.has(clue.id);
  const quote = clue.quote
    ? clue.quote.replace(clue.phrase, `<strong>${clue.phrase}</strong>`)
    : `${clue.before} ${solved ? `<strong>${clue.answer}</strong>` : '<span class="gap" aria-label="missing words">…</span>'}${clue.after}`;
  const contents = solved
    ? `
      <p class="idiom-inline"><strong>${clue.idiom}</strong> <span aria-hidden="true">·</span> ${clue.meaning}</p>
      <div class="evidence">
        <h3 id="clue-recorded" tabindex="-1">Clue found</h3>
        <p>${clue.evidence}</p>
      </div>
      ${complete ? nextButton : '<button type="button" class="button button-quiet advance" data-action="return-to-scene">Look for another clue</button>'}
    `
    : `
      <p class="prompt" id="task-prompt">${clue.prompt}</p>
      ${renderExercise(clue)}
      ${draft.retry ? `<p class="retry" id="try-again">${clue.retry}</p>` : ""}
      <div class="hint-area">
        <button type="button" class="button button-quiet hint-button" data-action="hint"
          aria-controls="clue-hint" aria-expanded="${draft.hint}">${draft.hint ? "Hide hint" : "Show hint"}</button>
        <p id="clue-hint" ${draft.hint ? "" : "hidden"}>${clue.hint}</p>
      </div>
    `;

  panel.innerHTML = `
    <h2 id="puzzle-title" tabindex="-1">${clue.name}</h2>
    <p class="context">${clue.context}</p>
    <blockquote class="story-quote">“${quote}”</blockquote>
    ${contents}
  `;
  if (!solved && clue.mode === "type") {
    document.getElementById("phrase").value = draft.typed;
  }
}

function renderExercise(clue) {
  if (clue.mode === "choice") {
    return `<div class="answers" role="group" aria-labelledby="task-prompt">
      ${clue.choices.map((text, index) => {
        const tried = draft.tried.has(index);
        return `<button type="button" class="answer${tried ? " wrong" : ""}" data-action="guess" data-index="${index}" ${tried ? "disabled" : ""}>
          ${text}${tried ? '<span class="sr-only"> (try again)</span>' : ""}
        </button>`;
      }).join("")}
    </div>`;
  }

  if (clue.mode === "type") {
    return `<form class="type-form" data-task="type">
      <input id="phrase" name="phrase" type="text" maxlength="80" aria-labelledby="task-prompt"
        ${draft.retry ? 'aria-invalid="true" aria-describedby="try-again"' : ""}
        autocomplete="off" autocapitalize="off" spellcheck="false" required>
      <button type="submit" class="button button-primary">Check phrase</button>
    </form>`;
  }

  const word = (index, inTray) => `<button type="button" class="word" data-action="tile" data-index="${index}"
    aria-label="${inTray ? "Remove" : "Add"} ${clue.tiles[index]}">${clue.tiles[index]}</button>`;
  return `<form data-task="tiles">
    <div class="word-tray${draft.retry ? " is-wrong" : ""}" role="group" aria-label="Your phrase">
      ${draft.tiles.length ? draft.tiles.map(index => word(index, true)).join("") : '<p>Your phrase goes here</p>'}
    </div>
    <div class="word-bank" role="group" aria-label="Available words">
      ${clue.tiles.map((_, index) => draft.tiles.includes(index) ? "" : word(index, false)).join("")}
    </div>
    <div class="check-row">
      <button type="submit" class="button button-primary" ${draft.tiles.length ? "" : "disabled"}>Check phrase</button>
    </div>
  </form>`;
}

function renderFinale() {
  const ending = endings[progress.ending];
  const outcome = ending
    ? `
      <p class="eyebrow">${ending.choice}</p>
      <h1 tabindex="-1">${ending.title}</h1>
      ${ending.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join("")}
      <section class="speaking" aria-labelledby="report-title">
        <h2 id="report-title">Tell the town what happened</h2>
        <p>Say three short sentences. Why did Mara leave? What did you choose and why? Use two idioms from your case notes.</p>
        <details open>
          <summary>Start your sentences</summary>
          <ul>
            <li>I <strong>broke the ice</strong> with the guard. I asked him about …</li>
            <li>One missing name was just <strong>the tip of the iceberg</strong>. I found …</li>
            <li>Mara <strong>got cold feet</strong> when she had to …</li>
            <li>I chose to … because …</li>
          </ul>
        </details>
      </section>
      <div class="ending-actions">
        <button type="button" class="button button-quiet" data-action="revisit">Choose again</button>
        <button type="button" class="button button-quiet" data-action="restart" aria-haspopup="dialog">Start over</button>
      </div>
    `
    : `
      <h1 tabindex="-1">Greywick’s choice</h1>
      <p>Mara gives you the metal piece. You can ring the bell and say her name. The ice will melt tonight. People here will forget her.</p>
      <p>You can also leave the bell silent. The town will share its extra wood. Winter will last longer.</p>
      <div class="final-options" role="group" aria-label="Make your choice">
        ${Object.entries(endings).map(([id, option]) => `<button type="button" class="answer" data-action="choose-ending" data-ending="${id}">
          <strong>${option.choice}</strong><span>${option.consequence}</span>
        </button>`).join("")}
      </div>
    `;
  const art = progress.ending ? sceneArt.gate : sceneArt.river;
  return `<div class="final-layout">
    <div class="ending-art"><img src="${art}" alt=""></div>
    <section class="final-panel">${outcome}</section>
  </div>`;
}

function recordClue(clue) {
  progress.found.add(clue.id);
  saveProgress();
  refreshClueIndicators();
  renderPuzzle();
  focusInsideGame("#clue-recorded");
  announce(`${progress.found.size} of ${allClues.length} clues found.`);
}

function guess(clue, index) {
  if (clue?.mode !== "choice" || progress.found.has(clue.id)) return;
  if (index === clue.answer) {
    recordClue(clue);
  } else {
    draft.tried.add(index);
    draft.retry = true;
    renderPuzzle();
    focusInsideGame(".answer:not(:disabled)", true);
    announce(clue.retry);
  }
}

function moveWord(clue, index) {
  if (clue?.mode !== "tiles" || !clue.tiles[index] || progress.found.has(clue.id)) return;
  if (draft.tiles.includes(index)) {
    draft.tiles = draft.tiles.filter(tile => tile !== index);
  } else {
    draft.tiles.push(index);
  }
  draft.retry = false;
  renderPuzzle();
  focusInsideGame(`[data-action="tile"][data-index="${index}"]`, true);
  announce(draft.tiles.length ? `Your phrase is ${draft.tiles.map(tile => clue.tiles[tile]).join(" ")}` : "Your phrase is empty.");
}

function inspectClue(id) {
  if (!chapters[progress.chapter]?.clues.some(clue => clue.id === id)) return;
  if (activeClueId !== id) {
    draft = emptyDraft();
    activeClueId = id;
  }
  refreshClueIndicators();
  renderPuzzle();
  focusInsideGame("#puzzle-title");
}

function toggleHint(button) {
  draft.hint = !draft.hint;
  const hint = document.getElementById("clue-hint");
  hint.hidden = !draft.hint;
  button.setAttribute("aria-expanded", String(draft.hint));
  button.textContent = draft.hint ? "Hide hint" : "Show hint";
  if (draft.hint) announce(hint.textContent);
}

function goToChapter(chapter) {
  progress.chapter = chapter;
  activeClueId = null;
  draft = emptyDraft();
  saveProgress();
  renderStory(true);
}

function requestRestart() {
  restartDialog.returnValue = "";
  restartDialog.showModal();
}

game.addEventListener("click", event => {
  const button = event.target.closest?.("button[data-action]");
  if (!button || button.disabled) return;
  const clue = activeClue();

  switch (button.dataset.action) {
    case "begin":
      if (progress.chapter < 0) goToChapter(0);
      break;
    case "inspect":
      inspectClue(button.dataset.clue);
      break;
    case "guess":
      guess(clue, Number(button.dataset.index));
      break;
    case "tile":
      moveWord(clue, Number(button.dataset.index));
      break;
    case "hint":
      toggleHint(button);
      break;
    case "return-to-scene":
      focusInsideGame(".marker:not(.found)");
      break;
    case "advance": {
      const chapter = chapters[progress.chapter];
      if (chapter && foundInChapter(chapter) === chapter.clues.length) goToChapter(progress.chapter + 1);
      break;
    }
    case "choose-ending":
      if (progress.chapter !== finalChapter || !Object.hasOwn(endings, button.dataset.ending)) return;
      progress.ending = button.dataset.ending;
      saveProgress();
      renderStory(true);
      break;
    case "revisit":
      progress.ending = null;
      saveProgress();
      renderStory(true);
      break;
    case "restart":
      requestRestart();
      break;
  }
});

game.addEventListener("submit", event => {
  const task = event.target.dataset.task;
  if (!task) return;
  event.preventDefault();
  const clue = activeClue();
  if (!clue || progress.found.has(clue.id)) return;

  if (task === "type") {
    draft.typed = event.target.elements.phrase.value;
  }
  const answer = task === "type"
    ? draft.typed.toLowerCase().trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "").trimEnd()
    : draft.tiles.map(index => clue.tiles[index]).join(" ");
  if (answer === clue.answer) {
    recordClue(clue);
  } else {
    draft.retry = true;
    renderPuzzle();
    if (task === "type") {
      focusInsideGame("#phrase", true);
      document.getElementById("phrase").select();
    } else {
      focusInsideGame(".word-tray .word", true);
    }
    announce(clue.retry);
  }
});

notebookButton.addEventListener("click", () => {
  const found = allClues.filter(clue => progress.found.has(clue.id));
  document.getElementById("notebook-content").innerHTML = found.length
    ? `<p>${found.length} of ${allClues.length} idioms found</p>
       <ul class="notebook-list">
         ${found.map(clue => `<li>
           <h3>${clue.idiom}</h3>
           <p>${clue.meaning}</p>
           <p class="record">${clue.evidence}</p>
         </li>`).join("")}
       </ul>`
    : "<p>Your notes will fill up as you find clues.</p>";
  notebook.showModal();
});

document.getElementById("restart-game").addEventListener("click", requestRestart);
document.getElementById("restart-request").addEventListener("click", requestRestart);

restartDialog.addEventListener("close", () => {
  if (restartDialog.returnValue !== "restart") return;
  if (notebook.open) notebook.close();
  progress = emptyProgress();
  goToChapter(-1);
});

renderStory();
