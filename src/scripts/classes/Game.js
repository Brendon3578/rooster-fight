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
   * Cria uma nova instância de Game.
   * @param {Player} player - Instância do jogador.
   */
  constructor(player) {
    //injeção de dependência
    this.#player = player;
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

  betGame() {}
}

export { Game, buttonsTextsEnum, gameHintEnum };
