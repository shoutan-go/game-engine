/* eslint-disable class-methods-use-this */
import Go from './go';
import { Go as GoConstants } from '../constants';
import { currentColor, getAdjacentIntersections, getGroup } from '../utils';

class CaptureGo extends Go {
  pass() {
    return false;
  }

  resign() {
    return false;
  }

  rules(color, i, j) {
    if (!super.rules(color, i, j)) {
      return false;
    }
    // 天元
    if (this.moves.length === 0) {
      return (
        color === GoConstants.COLOR.BLACK &&
        i === Math.floor(this.info.boardsize / 2) &&
        j === Math.floor(this.info.boardsize / 2)
      );
    }

    const neighbors = getAdjacentIntersections(this.info.boardsize, i, j);
    for (let index = 0; index < neighbors.length; index += 1) {
      const neighbor = neighbors[index];
      const state = this.board[neighbor[0]][neighbor[1]];
      if (state !== GoConstants.COLOR.EMPTY) {
        // 下在对方气上
        if (state !== currentColor(this.moves)) {
          return true;
        }
        // 被叫吃
        if (state === currentColor(this.moves)) {
          const group = getGroup(this.board, neighbor[0], neighbor[1]);
          if (group.liberties === 1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  winner() {
    const lastMove = this.moves[this.moves.length - 1];
    if (lastMove && lastMove.type === 'resign') {
      // eslint-disable-next-line no-bitwise
      return 0b11 ^ currentColor(lastMove.color);
    }
    if (this.captured[GoConstants.COLOR.BLACK] >= this.info.goal) {
      return GoConstants.COLOR.BLACK;
    } else if (this.captured[GoConstants.COLOR.WHITE] >= this.info.goal) {
      return GoConstants.COLOR.WHITE;
    }
    return false;
  }
}

export default CaptureGo;
