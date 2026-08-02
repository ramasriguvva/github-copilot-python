from flask import Flask

from .routes import sudoku_bp


def create_app():
    app = Flask(__name__, template_folder="../templates", static_folder="../static")
    app.register_blueprint(sudoku_bp)
    app.config.setdefault("CURRENT_GAME", {"puzzle": None, "solution": None})
    return app


app = create_app()
