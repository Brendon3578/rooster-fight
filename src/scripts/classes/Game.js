import { getRandomInt, sleep } from "../utils.js";
import { RoosterAnimation } from "./RoosterAnimation.js";

const buttonsTextsEnum = {
  newGame: "Novo Jogo",
  bet: "Apostar",
  betted: "Apostado",
};

const gameHintEnum = {
  waitForUserChooseRooster: "Escolha um dos galos antes de fazer a aposta",
  waitForFightEnds: "Espere a briga acabar",
  waitForUserConfirmBet:
    "Aperte abaixo para confirmar a aposta e começar a briga de galo",
  waitForUserStartNewBet:
    "Se quiser apostar em outra briga de galo, clique abaixo",
};

const gameTitleEnum = {
  start: "Quem ganha essa briga?",
  lose: "Você perdeu",
  win: "Você ganhou",
};

class Game {
  static RULES = {
    MINIMUM_VALUE_TO_BET: 1,
  };

  /**
   * Instância do jogador.
   * @type {Player}
   * @private
   */
  #player;
  /**
   * Instância da classe que controla a animação.
   * @type {RoosterAnimation}
   * @private
   */
  #roosterAnimation;

  /**
   * Cria uma nova instância de Game.
   * @param {Player} player - Instância do jogador.
   */
  constructor(player, roosterAnimation) {
    //injeção de dependência
    this.#player = player;
    this.#roosterAnimation = roosterAnimation;
  }

  /**
   * Constrói o jogo inicializando os elementos necessários.
   */
  build() {
    // Carrega o dinheiro do jogador do localStorage
    this.#player.loadMoneyFromStorage();
    // Atualiza a interface do usuário com o dinheiro do jogador
    this.#player.updateMoneyOnInterface();
  }

  // TODO: fazer o usuário ter apenas 25% chance de ganho
  async betRoosterFight(userBettedRooster) {
    let roosterWinner = "";
    const randomInt = getRandomInt(2);
    if (randomInt === 0) {
      roosterWinner = "blue";
    } else {
      roosterWinner = "red";
    }

    await this.#roosterAnimation.roosterFight(roosterWinner);
    return roosterWinner;
  }
}

export { Game, buttonsTextsEnum, gameHintEnum };
