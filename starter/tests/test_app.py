import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
import pytest

from sudoku.generation import count_solutions, generate_puzzle, resolve_clues


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


def test_app_starts(client):
    response = client.get("/")
    assert response.status_code == 200


def test_generated_puzzle_has_unique_solution():
    puzzle, _ = generate_puzzle(clues=35)

    assert count_solutions(puzzle) == 1


def test_new_game_returns_solution_for_hints(client):
    response = client.get("/new?difficulty=medium")
    assert response.status_code == 200
    data = response.get_json()
    assert "puzzle" in data
    assert "solution" in data
    assert len(data["solution"]) == 9


def test_resolve_clues_uses_difficulty_levels():
    assert resolve_clues("easy") == 45
    assert resolve_clues("medium") == 35
    assert resolve_clues("hard") == 25