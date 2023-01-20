const Field = (rowIndex, columnIndex, fieldValue = null) => {
  const field = document.createElement('div');
  field.classList.add('field');
  field.setAttribute('data-value', fieldValue);
  field.setAttribute('data-row', rowIndex);
  field.setAttribute('data-column', columnIndex);
  return field;
};

const gameBoard = ((boardSize) => {
  const board = [];

  // cache DOM
  const boardDOM = document.querySelector('#board');

  _init();

  function _init() {
    _setBoardSize();
    _createBoard();
    _render();
  }

  function _createBoard() {
    for (let i = 0; i < boardSize; i++) {
      board[i] = [];
      for (let j = 0; j < boardSize; j++) {
        board[i][j] = null;
      }
    }
  }

  function _setBoardSize() {
    boardDOM.style.width = `${boardSize * 10} rem`;
    boardDOM.style.height = `${boardSize * 10} rem`;
    boardDOM.style.gridTemplateColumns = `repeat(${boardSize}, 1fr);`;
  }

  function _render() {
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const field = Field(i, j, board[i][j]);
        boardDOM.appendChild(field);
      }
    }
  }
})(3);
