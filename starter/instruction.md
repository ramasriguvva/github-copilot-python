# GitHub Copilot Instructions

## Project Goal
Refactor the legacy Flask Sudoku application into a clean, modular, and maintainable project while preserving functionality and adding new features.

## Coding Standards
- Use Python 3.x and follow PEP 8.
- Keep functions small and focused.
- Use descriptive variable, function, and class names.
- Avoid duplicate code (DRY principle).
- Add comments only where they improve understanding.
- Handle errors gracefully with appropriate exception handling.

## Project Structure
- Organize code into reusable modules.
- Separate business logic from routes.
- Keep HTML, CSS, and JavaScript organized.
- Use Flask best practices.

## Frontend
- Create a responsive interface.
- Support both Light Mode and Dark Mode.
- Use clean, consistent styling.
- Make the Sudoku grid easy to read.
- Alternate colors for the 3×3 sections.

## Sudoku Features
- Generate puzzles with exactly one unique solution.
- Support Easy, Medium, and Hard difficulty levels.
- Lock prefilled cells.
- Validate user moves immediately.
- Provide Hint and Check Puzzle buttons.
- Display a timer while the game is running.
- Show a congratulatory message when the puzzle is completed.

## Data Storage
- Store the Top 10 scores using browser Local Storage.
- Save player name, completion time, difficulty, and hints used.

## Testing
- Use pytest for unit testing.
- Ensure tests pass after every major change.
- Write reusable and maintainable test cases.

## General Guidelines
- Prioritize readability and maintainability.
- Use modern Python features where appropriate.
- Ensure mobile responsiveness.
- Maintain accessibility best practices.