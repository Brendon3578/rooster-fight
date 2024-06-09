import { RoosterAnimation } from "./classes/RoosterAnimation.js";
import {
  elementExists,
  getRandomInt,
  isBoolean,
  log,
  showAlert,
} from "./utils.js";
import { Game } from "./classes/Game.js";
import { Player } from "./classes/Player.js";

const $roostersCheckboxEls = document.querySelectorAll(
  "input[type='checkbox']"
);
const $betButtonEl = document.querySelector("[data-bet-button]");
const $betButtonDescriptionEl = document.querySelector(
  "[data-bet-button-description]"
);
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
  showAlert("O galo apostado foi o " + bettedRooster);
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

function changeBetButtonColor(color, isChecked) {
  if (isChecked) {
    const isRed = color === "red";
    const isBlue = color === "blue";

    $betButtonEl.classList.toggle("button-blue", isBlue);
    $betButtonEl.classList.toggle("button-red", isRed);
    $betButtonDescriptionEl.textContent =
      isRed && !isBlue ? "no Vermelho" : "no Azul";

    setBetButtonDisabled($betButtonEl, false);
  } else {
    $betButtonEl.classList.toggle("button-red", false);
    $betButtonEl.classList.toggle("button-blue", false);
    setBetButtonDisabled($betButtonEl, true);

    $betButtonDescriptionEl.textContent = "";
  }
}

// ------------------------------------[ SCRIPT DOS BOTÕES DE ADICIONAR MAIS DINHEIRO NO INPUT ]------------------------------------
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

function setBetButtonDisabled($betButtonEl, boolean) {
  if (elementExists($betButtonEl) == false)
    throw new Error(`Bet button element don't exists! - ${$betButtonEl}`);

  if (isBoolean(boolean) == false)
    throw new Error("Not a valid boolean value to disable or enable button!");
  $betButtonEl.dataset.buttonDisabled = boolean;

  if (boolean) {
    $betButtonEl.setAttribute("disabled", "disabled");
  } else {
    $betButtonEl.removeAttribute("disabled");
  }
}
