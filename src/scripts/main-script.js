import { RoosterAnimation } from "./classes/RoosterAnimation.js";
import { elementExists, isBoolean, showAlert, sleep } from "./utils.js";
import { buttonsTextsEnum, Game, gameHintEnum } from "./classes/Game.js";
import { Player } from "./classes/Player.js";

const $roostersCheckboxEls = document.querySelectorAll(
  "input[type='checkbox']"
);
const $betButtonEl = document.querySelector("[data-bet-button]");
const $betButtonTitleEl = $betButtonEl.querySelector("[data-bet-button-title]");
const $betButtonDescriptionEl = $betButtonEl.querySelector(
  "[data-bet-button-description]"
);
const $betFieldsetEl = document.querySelector("[data-bet-fieldset]");
const $betGameHintEl = document.querySelector("[data-bet-hint]");

const $playerMoneyTextEl = document.getElementById("player-money");
const $betInputEl = document.querySelector("[data-bet-value]");
const $updateBetButtons = document.querySelectorAll(
  "button[data-button-update-bet]"
);
const $chooseRoosterContainerEl = document.querySelector(
  "[data-rooster-choose-container]"
);
const $mainTitle = document.querySelector("[data-title]");

const roosterAnimation = new RoosterAnimation();
const player = new Player($playerMoneyTextEl);
const game = new Game(player, roosterAnimation);
let bettedRooster = "";
// ------------------------------------[ SCRIPT PRINCIPAL DO JOGO ]------------------------------------

game.build();

// ------------------------[ SCRIPT DOS BOTÕES ]------------------------
$betButtonEl.addEventListener("click", async () => {
  // se é novo jogo
  if ($betButtonTitleEl.textContent == buttonsTextsEnum.newGame) {
    unCheckAllRoosterCheckbox();
    setBetButtonText(buttonsTextsEnum.bet);
    hideChooseRoosterContainer(false);
    bettedRooster = "";
    roosterAnimation.cleanAllAnimation();
    changeBetButtonColor("", false);
    setMainTitle("Quem ganha essa briga?");
    return;
  }

  if (!bettedRooster) throw new Error("No one rooster was betted yet!");
  const bet = getBetValueFromInput();
  setMainTitle("A briga está começando");

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
  hideChooseRoosterContainer(true);

  player.setBetValue(bet);
  player.loseMoney(bet);
  setBetHintText(gameHintEnum.waitForFightEnds);

  setBetButtonText(buttonsTextsEnum.betted, "Aguarde a briga");
  setBetButtonDisabled($betButtonEl, true);
  setFieldsetDisabled($betFieldsetEl, true);

  const roosterWinner = await game.betRoosterFight(bettedRooster);
  await sleep(2500);
  const roosterWinnerName = roosterWinner === "blue" ? "Azul" : "Vermelho";

  const didUserWinBet = bettedRooster === roosterWinner;
  console.log(
    `bettedRooster: ${bettedRooster} | roosterWinner: ${roosterWinner}`
  );
  setMainTitle(
    didUserWinBet ? "Você ganhou a aposta!" : "Você perdeu a aposta"
  );

  if (didUserWinBet) {
    // o usuário ganhou a aposta
    player.winBet();

    let winMoney = player.getBetValue() * 2;
    player.winMoney(winMoney);

    showAlert(`Você ganhou ${winMoney.toFixed(2)}!`);
  } else {
    // o usuário perdeu a aposta
    player.loseBetsDone();
    let lostBet = player.getLostBets();
    player.loseMoney(lostBet.value);
    showAlert(
      `Você perdeu ${lostBet.value.toFixed(
        2
      )}! O galo que ganhou foi o ${roosterWinnerName}`
    );
  }

  setBetButtonText(buttonsTextsEnum.newGame, "");
  setBetHintText(gameHintEnum.waitForUserStartNewBet);
  setBetButtonDisabled($betButtonEl, false);
  setFieldsetDisabled($betFieldsetEl, false);
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
  if (!hint) throw new Error("Game hint don't exists or is undefined");
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
