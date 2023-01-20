const events = {
  events: {},
  on(eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off(eventName, fn) {
    if (this.events[eventName]) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  },
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((fn) => {
        fn(data);
      });
    }
  },
};

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
    boardDOM.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
  }

  function _render() {
    boardDOM.innerHTML = '';

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const field = Field(i, j, board[i][j]);
        boardDOM.appendChild(field);
      }
    }
  }

  function clearBoard() {
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        board[i][j] = null;
      }
    }

    _render();
  }

  function updateFieldValue(rowIndex, columnIndex, newValue) {
    board[rowIndex][columnIndex] = newValue;
    _render();
  }

  function getBoard() {
    return board.map((row) => [...row]);
  }

  function handleBoardClick(e) {
    if (!e.target.classList.contains('field') || e.target.getAttribute('data-value') !== 'null') {
      return;
    }

    const field = e.target;
    const rowIndex = field.getAttribute('data-row');
    const columnIndex = field.getAttribute('data-column');

    events.emit('fieldClicked', { rowIndex, columnIndex });
  }

  boardDOM.addEventListener('click', handleBoardClick);

  return { updateFieldValue, clearBoard, getBoard };
})(3);

const gameController = ((board) => {
  let nextMove = 'cross';

  function handleFieldClicked(data) {
    board.updateFieldValue(data.rowIndex, data.columnIndex, nextMove);
    changeNextMove();
  }

  function changeNextMove() {
    nextMove = nextMove === 'cross' ? 'circle' : 'cross';
  }

  events.on('fieldClicked', handleFieldClicked);
})(gameBoard);
