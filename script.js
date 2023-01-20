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

  field.addEventListener('mouseover', handleMouseOver);
  field.addEventListener('mouseout', handleMouseOut);

  events.on('gameFinished', handleFinishGame);

  function handleMouseOver(e) {
    events.emit('fieldHovered', e.target);
  }

  function handleMouseOut(e) {
    events.emit('fieldLeaved', e.target);
  }

  function handleFinishGame() {
    field.removeEventListener('mouseover', handleMouseOver);
    field.removeEventListener('mouseout', handleMouseOut);
  }

  return field;
};

const gameBoard = ((boardSize) => {
  const board = [];

  const boardDOM = document.querySelector('#board');

  _init();

  function _init() {
    _setBoardSize();
    _createBoard();
    _render();

    boardDOM.addEventListener('click', _handleBoardClick);
    events.on('gameFinished', _handleFinishGame);
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
    boardDOM.style.width = `${boardSize * 10}rem`;
    boardDOM.style.height = `${boardSize * 10}rem`;
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

  function _clearBoard() {
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        board[i][j] = null;
      }
    }

    _render();
  }

  function refreshBoard() {
    _clearBoard();
    boardDOM.addEventListener('click', _handleBoardClick);
  }

  function updateFieldValue(rowIndex, columnIndex, newValue) {
    board[rowIndex][columnIndex] = newValue;
    _render();
  }

  function getBoard() {
    return board.map((row) => [...row]);
  }

  function _handleBoardClick(e) {
    if (!e.target.classList.contains('field') || e.target.getAttribute('data-value') !== 'null') {
      return;
    }

    const field = e.target;
    const rowIndex = field.getAttribute('data-row');
    const columnIndex = field.getAttribute('data-column');

    events.emit('fieldClicked', { rowIndex, columnIndex });
  }

  function _handleFinishGame() {
    boardDOM.removeEventListener('click', _handleBoardClick);
  }

  return {
    updateFieldValue, refreshBoard, getBoard,
  };
})(3);

const gameController = ((board) => {
  let nextMove = 'cross';

  function handleFieldClicked(data) {
    board.updateFieldValue(data.rowIndex, data.columnIndex, nextMove);
    changeNextMove();
    console.table(board.getBoard());
    const win = checkWin(board.getBoard());
    if (win) {
      events.emit('gameFinished', win);
    }
  }

  function changeNextMove() {
    nextMove = nextMove === 'cross' ? 'circle' : 'cross';
  }

  function checkWin(currentBoard) {
    return checkHorizontal(currentBoard)
      || checkVertical(currentBoard)
      || checkMainDiagonal(currentBoard)
      || checkAdditionalDiagonal(currentBoard);
  }

  function checkHorizontal(currentBoard) {
    for (let i = 0; i < currentBoard.length; i++) {
      let sameCounter = 1;
      for (let j = 1; j < currentBoard.length; j++) {
        if (currentBoard[i][j - 1] === currentBoard[i][j] && currentBoard[i][j]) {
          sameCounter++;
        } else {
          break;
        }
      }

      if (sameCounter === currentBoard.length) {
        return currentBoard[i][0];
      }
    }
  }

  function checkVertical(currentBoard) {
    for (let i = 0; i < currentBoard.length; i++) {
      let sameCounter = 1;
      for (let j = 1; j < currentBoard.length; j++) {
        if (currentBoard[j - 1][i] === currentBoard[j][i] && currentBoard[j][i]) {
          sameCounter++;
        } else {
          break;
        }
      }

      if (sameCounter === currentBoard.length) {
        return currentBoard[0][i];
      }
    }
  }

  function checkMainDiagonal(currentBoard) {
    let sameCounter = 1;

    for (let i = 1; i < currentBoard.length; i++) {
      if (currentBoard[i - 1][i - 1] === currentBoard[i][i] && currentBoard[i][i]) {
        sameCounter++;
      } else {
        break;
      }
    }

    if (sameCounter === currentBoard.length) {
      return currentBoard[0][0];
    }
  }

  function checkAdditionalDiagonal(currentBoard) {
    let sameCounter = 1;

    for (let i = 1; i < currentBoard.length; i++) {
      if (currentBoard[i - 1][currentBoard.length - i] === currentBoard[i][currentBoard.length - i - 1] && currentBoard[i][currentBoard.length - i - 1]) {
        sameCounter++;
      } else {
        break;
      }
    }

    if (sameCounter === currentBoard.length) {
      return currentBoard[0][currentBoard.length - 1];
    }
  }

  function handleHoverField(target) {
    target.setAttribute('data-next-move', nextMove);
  }

  function handleLeaveField(target) {
    target.removeAttribute('data-next-move');
  }

  events.on('fieldClicked', handleFieldClicked);
  events.on('fieldHovered', handleHoverField);
  events.on('fieldLeaved', handleLeaveField);
})(gameBoard);

const menu = (() => {
  const refreshButton = document.querySelector('#refresh');

  refreshButton.addEventListener('click', handleRefresh);

  function handleRefresh() {
    gameBoard.refreshBoard();
  }
})();
