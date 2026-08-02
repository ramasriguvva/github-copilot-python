import random

from .logic import EMPTY, SIZE, create_empty_board, fill_board, is_safe
from .utils import deep_copy

DIFFICULTY_CLUES = {"easy": 45, "medium": 35, "hard": 25}


def remove_cells(board, clues):
    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != 0:
            board[row][col] = 0
            attempts -= 1


def resolve_clues(difficulty=None, clues=None):
    if clues is not None:
        return int(clues)

    normalized_difficulty = (difficulty or "medium").lower()
    return DIFFICULTY_CLUES.get(normalized_difficulty, DIFFICULTY_CLUES["medium"])


def count_solutions(board, limit=2):
    grid = deep_copy(board)
    solutions = [0]

    def search(current_grid):
        if solutions[0] >= limit:
            return True

        next_empty = None
        for row in range(SIZE):
            for col in range(SIZE):
                if current_grid[row][col] == EMPTY:
                    next_empty = (row, col)
                    break
            if next_empty is not None:
                break

        if next_empty is None:
            solutions[0] += 1
            return False

        row, col = next_empty
        for candidate in random.sample(list(range(1, SIZE + 1)), SIZE):
            if is_safe(current_grid, row, col, candidate):
                current_grid[row][col] = candidate
                search(current_grid)
                current_grid[row][col] = EMPTY
                if solutions[0] >= limit:
                    return True

        return False

    search(grid)
    return solutions[0]


def generate_puzzle(clues=35, difficulty=None):
    resolved_clues = resolve_clues(difficulty=difficulty, clues=clues)

    for _ in range(1000):
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        remove_cells(board, resolved_clues)
        puzzle = deep_copy(board)
        if count_solutions(puzzle) == 1:
            return puzzle, solution

    raise RuntimeError("Unable to generate a uniquely solvable puzzle")
