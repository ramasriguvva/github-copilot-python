from .logic import SIZE


def find_incorrect_cells(board, solution):
    incorrect = []
    if not board or not solution:
        return incorrect

    for i in range(SIZE):
        for j in range(SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return incorrect
