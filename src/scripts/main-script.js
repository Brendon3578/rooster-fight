import { RoosterAnimation } from "./classes/RoosterAnimation.js";
import {
  elementExists,
  getRandomInt,
  isBoolean,
  log,
  showAlert,
} from "./utils.js";
import { buttonsTextsEnum, Game, gameHintEnum } from "./classes/Game.js";
import { Player } from "./classes/Player.js";

const $roostersCheckboxEls = document.querySelectorAll(
  "input[type='checkbox']"
);
const $betButtonEl = document.querySelector("[data-bet-button]");
const $betButtonTileEl = $betButtonEl.querySelector("[data-bet-button-title]");
const $betButtonDescriptionEl = $betButtonEl.querySelector(
  "[data-bet-button-description]"
);
const $betFieldsetEl = document.querySelector("[data-bet-fieldset]");
const $betGameHintEl = document.querySelector("[data-bet-hint]");
const roosterAnimation = new RoosterAnimation();
let bettedRooster = "";
const $playerMoneyTextEl = document.getElementById("player-money");
const player = new Player($playerMoneyTextEl);
const game = new Game(player);
const $betInputEl = document.querySelector("[data-bet-value]");

const $updateBetButtons = document.querySelectorAll(
  "button[data-button-update-bet]"
);

// ------------------------------------[ SCRIPT PRINCIPAL DO JOGO ]------------------------------------

game.build();

const randomNumber = getRandomInt(10);
console.log(randomNumber);
if (randomNumber >= 5) {
  log("start", "O galo azul irá ganhar essa luta");
  roosterAnimation.roosterFight("blue");
} else {
  log("start", "O galo vermelho irá ganhar essa luta");
  roosterAnimation.roosterFight("red");
}

// ------------------------[ SCRIPT DOS BOTÕES ]------------------------
$betButtonEl.addEventListener("click", () => {
  if (!bettedRooster) throw new Error("No one rooster was betted yet!");
  const bet = getBetValueFromInput();

  // verificar se o usuário tem dinheiro suficiente
  if (player.hasEnoughMoney(bet) == false) {
    showAlert("Você não possui esse dinheiro!");
    return;
  }

  // -- Verificar se o valor da aposta é válido
  if (isValidValueToBet(bet) == false) {
    showAlert(
      `O valor mínimo para aposta é ${Game.RULES.MINIMUM_VALUE_TO_BET}.`
    );
    return;
  }

  player.setBetValue(bet);
  player.loseMoney(bet);
  setBetHintText(gameHintEnum.waitForFightEnds);

  showAlert(
    "O galo apostado foi o " + bettedRooster + " valor da aposta :" + bet
  );
  setBetButtonText(buttonsTextsEnum.betted, "aguarde a briga");
  setBetButtonDisabled($betButtonEl, true);
  setFieldsetDisabled($betFieldsetEl, true);
});

// ------------------------------------[ SCRIPT DO CHECKBOX DAS GALINHAS ]------------------------------------

for (const $el of $roostersCheckboxEls) {
  $el.addEventListener("change", (e) => {
    // e.preventDefault();
    const roosterColor = $el.value;
    const isRed = roosterColor === "red";

    const $otherCheckboxEl = document.querySelector(
      `input[value="${isRed ? "blue" : "red"}"]`
    );
    const isChecked = $el.checked ? true : false;
    const isOtherChecked = $otherCheckboxEl.checked ? true : false;
    if (isChecked && isOtherChecked) {
      $otherCheckboxEl.checked = false;
    }

    bettedRooster = isChecked ? roosterColor : "";

    changeBetButtonColor(roosterColor, isChecked);
  });
}

// ------------------------------------[ FUNÇÕES DO JOGO ]------------------------------------

// ---------------[ SCRIPT DOS BOTÕES DE ADICIONAR MAIS DINHEIRO NO INPUT ]---------------
function isValidValueToBet(value) {
  return isNaN(value) == false && value >= Game.RULES.MINIMUM_VALUE_TO_BET;
}

function updateBetValue(valueToAdd, $inputBetEl) {
  if (!elementExists($betInputEl)) throw new Error("Bet input doesn't exists");
  let newValue = parseFloat($inputBetEl.value) + parseInt(valueToAdd);
  if (isValidValueToBet(newValue) == false) {
    showAlert(
      `O valor mínimo para aposta é ${Game.RULES.MINIMUM_VALUE_TO_BET}.`
    );

    newValue = Game.RULES.MINIMUM_VALUE_TO_BET;
  }
  $inputBetEl.value = newValue;
}

$updateBetButtons.forEach((b) =>
  b.addEventListener("click", () =>
    updateBetValue(b.dataset.buttonUpdateBet, $betInputEl)
  )
);

// ---------------[ FUNÇÃO DE DESABILITAR O FIELDSET ]---------------
function setFieldsetDisabled($fieldSet, boolean) {
  if (elementExists($fieldSet) == false)
    throw new Error(`Bet fieldset element don't exists! - ${$fieldSet}`);

  if (isBoolean(boolean) == false)
    throw new Error("Not a valid boolean value to disable or enable fieldset!");

  if (boolean) {
    $fieldSet.setAttribute("disabled", "disabled");
  } else {
    $fieldSet.removeAttribute("disabled");
  }
}

// ---------------[ FUNÇÕES DO BOTÃO QUE MUDAM O TEXTO OU DESABILITA ELE ]---------------

function setBetButtonDisabled($betButtonEl, boolean) {
  if (elementExists($betButtonEl) == false)
    throw new Error(`Bet button element don't exists! - ${$betButtonEl}`);

  if (isBoolean(boolean) == false)
    throw new Error("Not a valid boolean value to disable or enable button!");

  if (boolean) {
    $betButtonEl.setAttribute("disabled", "disabled");
  } else {
    $betButtonEl.removeAttribute("disabled");
  }
}
function changeBetButtonColor(color, isChecked) {
  if (isChecked) {
    const isRed = color === "red";
    const isBlue = color === "blue";

    $betButtonEl.classList.toggle("button-blue", isBlue);
    $betButtonEl.classList.toggle("button-red", isRed);

    setBetButtonText(
      buttonsTextsEnum.bet,
      isRed && !isBlue ? "no Vermelho" : "no Azul"
    );
    setBetHintText(gameHintEnum.waitForUserConfirmBet);

    setBetButtonDisabled($betButtonEl, false);
  } else {
    setBetHintText(gameHintEnum.waitForUserChooseRooster);

    $betButtonEl.classList.toggle("button-red", false);
    $betButtonEl.classList.toggle("button-blue", false);
    setBetButtonDisabled($betButtonEl, true);

    setBetButtonText(buttonsTextsEnum.bet, "");
  }
}

function setBetButtonText(text, description) {
  $betButtonTileEl.textContent = text;
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
  if (!hint) throw new Error("Game hint don't exists or is undefined");
  $betGameHintEl.textContent = hint;
}
