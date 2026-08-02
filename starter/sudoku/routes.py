from flask import Blueprint, current_app, jsonify, render_template, request

from .generation import generate_puzzle, resolve_clues
from .validation import find_incorrect_cells

sudoku_bp = Blueprint("sudoku", __name__)


@sudoku_bp.route("/")
def index():
    return render_template("index.html")


@sudoku_bp.route("/new")
def new_game():
    requested_clues = request.args.get("clues")
    difficulty = request.args.get("difficulty", "medium")
    clues = resolve_clues(difficulty=difficulty, clues=requested_clues)
    puzzle, solution = generate_puzzle(clues, difficulty=difficulty)
    current_app.config["CURRENT_GAME"] = {"puzzle": puzzle, "solution": solution}
    return jsonify({"puzzle": puzzle, "solution": solution})


@sudoku_bp.route("/check", methods=["POST"])
def check_solution():
    data = request.get_json(silent=True) or {}
    board = data.get("board")
    solution = current_app.config.get("CURRENT_GAME", {}).get("solution")

    if solution is None:
        return jsonify({"error": "No game in progress"}), 400

    incorrect = find_incorrect_cells(board, solution)
    return jsonify({"incorrect": incorrect})
