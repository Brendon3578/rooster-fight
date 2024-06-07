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
    this.#fightCloudEl = document.querySelector("[data-rooster-fight-cloud]");
    this.#fightRoosters = document.querySelectorAll(
      "[data-rooster-fight-rooster]"
    );
    this.#winnerRoosterImgEl = document.querySelectorAll(
      "[data-rooster-winner]"
    );
    this.#fightAnimationContainer = document.querySelector(
      "[data-rooster-fight-container]"
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
      this.addRoosterFightAnimation(rooster, roosterColor);
    });
    await sleep(12 * 1000); // 12 segundos
    this.#winnerRoosterImgEl.forEach((winnerRoosterEl) => {
      const roosterWinnerColor = winnerRoosterEl.dataset.roosterWinner;
      if (!roosterWinnerColor) throw new Error("Unknown rooster winner color!");
      if (roosterWinnerColor == winnedRooster) {
        winnerRoosterEl.classList.remove("hidden");
      }
    });
    this.showFightCloud(false);
  }

  showFightCloud(shouldShow) {
    this.#fightCloudEl.classList.toggle("cloud-fight", shouldShow);
    this.#fightCloudEl.classList.toggle("hidden", !shouldShow);
  }

  addRoosterFightAnimation(roosterEl, color) {
    const roosterAnimationClassName = `rooster-${color}-fight`;
    roosterEl.classList.add(roosterAnimationClassName);
    roosterEl.classList.remove("hidden");
  }
}

export { RoosterAnimation };
