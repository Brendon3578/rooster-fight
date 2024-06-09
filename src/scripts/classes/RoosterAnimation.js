import { elementExists, sleep } from "../utils.js";

class RoosterAnimation {
  /**
   * @type { HTMLDivElement  }
   */
  #fightAnimationContainer;
  /**
   * @type { HTMLImageElement  }
   */
  #fightCloudEl;
  /**
   * @type { NodeListOf<HTMLImageElement>  }
   */
  #fightRoosters;

  /**
   * @type { NodeListOf<HTMLImageElement>  }
   */
  #winnerRoosterImgEl;

  constructor() {
    const animationContainer = document.querySelector(
      "[data-rooster-fight-container]"
    );
    this.#fightAnimationContainer = animationContainer;
    this.#fightCloudEl = animationContainer.querySelector(
      "[data-rooster-fight-cloud]"
    );
    this.#fightRoosters = animationContainer.querySelectorAll(
      "[data-rooster-fight-rooster]"
    );
    this.#winnerRoosterImgEl = animationContainer.querySelectorAll(
      "[data-rooster-winner]"
    );

    const allElementsExists = [
      this.#fightAnimationContainer,
      this.#fightCloudEl,
      ...Array.from(this.#fightRoosters),
      ...Array.from(this.#winnerRoosterImgEl),
    ].every((el) => elementExists(el));

    if (!allElementsExists)
      throw new Error(
        "Elements not initialized correctly! Verify if elements exists in Document. "
      );
  }

  async roosterFight(winnedRooster) {
    this.#fightAnimationContainer.classList.remove("hidden");
    this.showFightCloud(true);
    this.#fightRoosters.forEach((rooster) => {
      const roosterColor = rooster.dataset.roosterFightRooster;
      if (!roosterColor) throw new Error("Unknown rooster color!");
      this.toggleRoosterFightAnimation(rooster, roosterColor);
    });
    // animação dos galos brigando
    await sleep(12 * 1000); // espera 12 segundos

    // mostra o galo vencedor
    this.#winnerRoosterImgEl.forEach((winnerRoosterEl) => {
      const roosterWinnerColor = winnerRoosterEl.dataset.roosterWinner;
      if (!roosterWinnerColor) throw new Error("Unknown rooster winner color!");
      if (roosterWinnerColor == winnedRooster) {
        winnerRoosterEl.classList.remove("hidden");
      }
    });
    // remove a imagem da briga
    this.showFightCloud(false);

    // remove as animações dos galos (que já não aparecem mais)
    this.#fightRoosters.forEach((rooster) => {
      const roosterColor = rooster.dataset.roosterFightRooster;
      if (!roosterColor) throw new Error("Unknown rooster color!");
      this.toggleRoosterFightAnimation(rooster, roosterColor, false);
    });

    sleep(10000);
  }

  showFightCloud(shouldShow) {
    this.#fightCloudEl.classList.toggle("cloud-fight", shouldShow);
    this.#fightCloudEl.classList.toggle("hidden", !shouldShow);
  }

  toggleRoosterFightAnimation(roosterEl, color, shouldAdd = true) {
    const roosterAnimationClassName = `rooster-${color}-fight`;
    roosterEl.classList.toggle("hidden", !shouldAdd);
    roosterEl.classList.toggle(roosterAnimationClassName, shouldAdd);
  }

  cleanAllAnimation() {
    const allElements = [
      this.#fightAnimationContainer,
      this.#fightCloudEl,
      ...Array.from(this.#fightRoosters),
      ...Array.from(this.#winnerRoosterImgEl),
    ];
    allElements.forEach((el) => {
      el.classList.add("hidden");
    });
  }
}

export { RoosterAnimation };
