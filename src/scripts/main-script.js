const $roostersContainerEls = document.querySelectorAll("[data-rooster]");
const $betButtonEl = document.querySelector("[data-bet-button]");
const $betButtonDescriptionEl = document.querySelector(
  "[data-bet-button-description]"
);

for (const $el of $roostersContainerEls) {
  $el.addEventListener("click", (e) => {
    const roosterColor = $el.dataset.rooster;
    const isRed = roosterColor === "red";

    const $checkboxEl = $el.querySelector("input[type='checkbox']");
    const $otherCheckboxEl = document.querySelector(
      `input[value="${isRed ? "blue" : "red"}"]`
    );
    const isChecked = $checkboxEl.checked ? true : false;
    const isOtherChecked = $otherCheckboxEl.checked ? true : false;
    if (isChecked && isOtherChecked) {
      $otherCheckboxEl.checked = false;
    }

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

    $betButtonEl.removeAttribute("disabled");
  } else {
    $betButtonEl.classList.toggle("button-red", false);
    $betButtonEl.classList.toggle("button-blue", false);
    $betButtonEl.setAttribute("disabled", "disabled");

    $betButtonDescriptionEl.textContent = "";
  }
}
