import { RoosterAnimation } from "./classes/RoosterAnimation.js";
import { elementExists, isBoolean, showAlert, sleep } from "./utils.js";
import { buttonsTextsEnum, Game, gameHintEnum } from "./classes/Game.js";
import { Player } from "./classes/Player.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const $roostersCheckboxEls = $$("input[type='checkbox']");
const $betButtonEl = $("[data-bet-button]");
const $betButtonTitleEl = $betButtonEl.querySelector("[data-bet-button-title]");
const $betButtonDescriptionEl = $betButtonEl.querySelector(
  "[data-bet-button-description]"
);
const $betFieldsetEl = $("[data-bet-fieldset]");
const $betGameHintEl = $("[data-bet-hint]");
const $playerMoneyTextEl = $("#player-money");
const $betInputEl = $("[data-bet-value]");
const $updateBetButtons = $$("button[data-button-update-bet]");
const $chooseRoosterContainerEl = $("[data-rooster-choose-container]");
const $mainTitle = $("[data-title]");

const roosterAnimation = new RoosterAnimation();
const player = new Player($playerMoneyTextEl);
const game = new Game(player, roosterAnimation);
let bettedRooster = "";

game.build();

$betButtonEl.addEventListener("click", handleBetButtonClick);
$roostersCheckboxEls.forEach(($el) =>
  $el.addEventListener("change", handleRoosterCheckboxChange)
);
$updateBetButtons.forEach((b) =>
  b.addEventListener("click", handleUpdateBetButtonClick)
);

function handleBetButtonClick() {
  if ($betButtonTitleEl.textContent === buttonsTextsEnum.newGame) {
    startNewGame();
  } else {
    placeBet();
  }
}

async function placeBet() {
  if (!bettedRooster) throw new Error("No rooster selected for betting!");

  const bet = getBetValueFromInput();
  setMainTitle("A briga está começando");

  if (!player.hasEnoughMoney(bet)) {
    showAlert("Você não possui esse dinheiro!");
    return;
  }

  if (!isValidValueToBet(bet)) {
    showAlert(
      `O valor mínimo para aposta é ${Game.RULES.MINIMUM_VALUE_TO_BET}.`
    );
    return;
  }

  hideChooseRoosterContainer(true);
  player.setBetValue(bet);
  player.loseMoney(bet);
  setBetHintText(gameHintEnum.waitForFightEnds);

  setBetButtonState(buttonsTextsEnum.betted, "Aguarde a briga", true, true);

  const roosterWinner = await game.betRoosterFight(bettedRooster);
  await sleep(2500);
  const roosterWinnerName = roosterWinner === "blue" ? "Azul" : "Vermelho";

  const didUserWinBet = bettedRooster === roosterWinner;
  setMainTitle(
    didUserWinBet ? "Você ganhou a aposta!" : "Você perdeu a aposta"
  );

  if (didUserWinBet) {
    handleUserWin();
  } else {
    handleUserLoss(roosterWinnerName);
  }

  setBetButtonState(buttonsTextsEnum.newGame, "", false, false);
  setBetHintText(gameHintEnum.waitForUserStartNewBet);
}

function handleUserWin() {
  player.winBet();
  const winMoney = player.getBetValue() * 2;
  player.winMoney(winMoney);
  showAlert(`Você ganhou ${winMoney.toFixed(2)}!`);
}

function handleUserLoss(roosterWinnerName) {
  player.loseBetsDone();
  const lostBet = player.getLostBets();
  player.loseMoney(lostBet.value);
  showAlert(
    `Você perdeu ${lostBet.value.toFixed(
      2
    )}! O galo que ganhou foi o ${roosterWinnerName}`
  );
}

function startNewGame() {
  unCheckAllRoosterCheckbox();
  setBetButtonState(buttonsTextsEnum.bet, "", false, false);
  hideChooseRoosterContainer(false);
  bettedRooster = "";
  roosterAnimation.cleanAllAnimation();
  changeBetButtonColor("", false);
  setMainTitle("Quem ganha essa briga?");
}

function handleRoosterCheckboxChange(e) {
  const $el = e.target;
  const roosterColor = $el.value;
  const $otherCheckboxEl = $(
    `input[value="${roosterColor === "red" ? "blue" : "red"}"]`
  );

  if ($el.checked && $otherCheckboxEl.checked) {
    $otherCheckboxEl.checked = false;
  }

  bettedRooster = $el.checked ? roosterColor : "";
  changeBetButtonColor(roosterColor, $el.checked);
}

function handleUpdateBetButtonClick(e) {
  updateBetValue(e.target.dataset.buttonUpdateBet, $betInputEl);
}

function isValidValueToBet(value) {
  return !isNaN(value) && value >= Game.RULES.MINIMUM_VALUE_TO_BET;
}

function updateBetValue(valueToAdd, $inputBetEl) {
  if (!elementExists($betInputEl)) throw new Error("Bet input doesn't exist");

  let newValue = parseFloat($inputBetEl.value) + parseInt(valueToAdd);
  if (!isValidValueToBet(newValue)) {
    showAlert(
      `O valor mínimo para aposta é ${Game.RULES.MINIMUM_VALUE_TO_BET}.`
    );
    newValue = Game.RULES.MINIMUM_VALUE_TO_BET;
  }
  $inputBetEl.value = newValue;
}

/**
 *
 * @param {HTMLFieldSetElement} $fieldSet
 * @param {boolean} disabled
 */
function setFieldsetDisabled($fieldSet, disabled) {
  validateElementAndBoolean($fieldSet, disabled);
  $fieldSet.toggleAttribute("disabled", disabled);
}

/**
 *
 * @param {HTMLButtonElement} $betButtonEl
 * @param {boolean} disabled
 */
function setBetButtonDisabled($betButtonEl, disabled) {
  validateElementAndBoolean($betButtonEl, disabled);
  $betButtonEl.toggleAttribute("disabled", disabled);
}

// ---------------[ FUNÇÃO QUE VALIDA O ELEMENTO E O VALOR BOOLEANO ]---------------
function validateElementAndBoolean($element, value) {
  if (!elementExists($element)) throw new Error("Element doesn't exist");
  if (!isBoolean(value)) throw new Error("Invalid boolean value");
}

function changeBetButtonColor(color, isChecked) {
  const isRed = color === "red";
  const isBlue = color === "blue";

  $betButtonEl.classList.toggle("button-blue", isChecked && isBlue);
  $betButtonEl.classList.toggle("button-red", isChecked && isRed);

  setBetButtonText(
    isChecked ? buttonsTextsEnum.bet : buttonsTextsEnum.bet,
    isRed && !isBlue ? "no Vermelho" : "no Azul"
  );
  setBetHintText(
    isChecked
      ? gameHintEnum.waitForUserConfirmBet
      : gameHintEnum.waitForUserChooseRooster
  );

  setBetButtonDisabled($betButtonEl, !isChecked);
}

function setBetButtonState(text, description, disableButton, disableFieldset) {
  setBetButtonText(text, description);
  setBetButtonDisabled($betButtonEl, disableButton);
  setFieldsetDisabled($betFieldsetEl, disableFieldset);
}

function setBetButtonText(text, description) {
  $betButtonTitleEl.textContent = text;
  $betButtonDescriptionEl.textContent = description;
}

// ---------------[ FUNÇÃO PRA PEGAR O VALOR DA APOSTA DO INPUT ]---------------
function getBetValueFromInput() {
  const betValue = parseFloat($betInputEl.value).toFixed(2);
  $betInputEl.value = betValue;
  return parseFloat(betValue);
}
// ---------------[ FUNÇÃO QUE MUDA O ELEMENTO DE DICA DO JOGADOR ]---------------
function setBetHintText(hint) {
  if (!hint) throw new Error("Game hint doesn't exist or is undefined");
  $betGameHintEl.textContent = hint;
}
// ---------------[ FUNÇÃO PRA ESCONDER OS CHECKBOX DE ESCOLHER OS GALOS ]---------------
function hideChooseRoosterContainer(shouldHide) {
  $chooseRoosterContainerEl.classList.toggle("hidden", shouldHide);
  $chooseRoosterContainerEl.classList.toggle("flex", !shouldHide);
}
// ---------------[ FUNÇÃO PRA DESMARCAR TODOS OS CHECKBOX DE GALOS ]---------------
function unCheckAllRoosterCheckbox() {
  $roostersCheckboxEls.forEach((el) => (el.checked = false));
}
// ---------------[ FUNÇÃO QUE MUDA O TÍTULO EM CIMA DO JOGO ]---------------

function setMainTitle(title) {
  $mainTitle.textContent = title;
}
