document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const boardElement = document.getElementById('chess-board');
    const statusText = document.getElementById('status-text');
    const resetButton = document.getElementById('reset-button');
    
    // --- GLOABAL STATE ---
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const pieces = {
        'wR': '♜', 'wN': '♞', 'wB': '♝', 'wQ': '♛', 'wK': '♚', 'wP': '♟',
        'bR': '♖', 'bN': '♘', 'bB': '♗', 'bQ': '♕', 'bK': '♔', 'bP': '♙'
    };

    let boardState = {};
    let currentPlayer = 'w';
    let selectedPiece = null;
    let validMoves = [];
    let enPassantTarget = null; // Square for en passant, e.g., 'e3'
    let castlingRights = { w: {k: true, q: true}, b: {k: true, q: true} };
    let isGameOver = false;

    // --- INITIALIZATION ---
    function initializeBoard() {
        boardState = {
            'a1': 'wR', 'b1': 'wN', 'c1': 'wB', 'd1': 'wQ', 'e1': 'wK', 'f1': 'wB', 'g1': 'wN', 'h1': 'wR',
            'a2': 'wP', 'b2': 'wP', 'c2': 'wP', 'd2': 'wP', 'e2': 'wP', 'f2': 'wP', 'g2': 'wP', 'h2': 'wP',
            'a8': 'bR', 'b8': 'bN', 'c8': 'bB', 'd8': 'bQ', 'e8': 'bK', 'f8': 'bB', 'g8': 'bN', 'h8': 'bR',
            'a7': 'bP', 'b7': 'bP', 'c7': 'bP', 'd7': 'bP', 'e7': 'bP', 'f7': 'bP', 'g7': 'bP', 'h7': 'bP'
        };
        currentPlayer = 'w';
        selectedPiece = null;
        validMoves = [];
        enPassantTarget = null;
        castlingRights = { w: {k: true, q: true}, b: {k: true, q: true} };
        isGameOver = false;
        updateStatus();
        renderBoard();
    }

    // --- UI RENDERING ---
    function renderBoard() {
        boardElement.innerHTML = '';
        for (let row = 8; row >= 1; row--) {
            for (let col = 0; col < 8; col++) {
                const file = files[col];
                const position = `${file}${row}`;
                const square = document.createElement('div');
                square.classList.add('square', (row + col) % 2 === 0 ? 'dark' : 'light');
                square.dataset.position = position;

                if (boardState[position]) {
                    const pieceElement = document.createElement('span');
                    pieceElement.classList.add('piece');
                    pieceElement.textContent = pieces[boardState[position]];
                    square.appendChild(pieceElement);
                }

                if (selectedPiece && selectedPiece.position === position) {
                    square.classList.add('selected');
                }
                
                if (validMoves.includes(position)) {
                    square.classList.add('valid-move');
                    if (boardState[position]) {
                        square.classList.add('capture-move');
                    }
                }

                square.addEventListener('click', () => onSquareClick(position));
                boardElement.appendChild(square);
            }
        }
    }

    function onSquareClick(position) {
        if (isGameOver) return;

        if (selectedPiece && validMoves.includes(position)) {
            movePiece(selectedPiece.position, position);
        } else {
            const pieceCode = boardState[position];
            if (pieceCode && pieceCode.startsWith(currentPlayer)) {
                selectPiece(pieceCode, position);
            } else {
                clearSelection();
            }
        }
    }
    
    function updateStatus() {
        let status;
        const colorName = currentPlayer === 'w' ? 'White' : 'Black';
        if (isGameOver) {
            status = `Game Over! ${statusText.textContent}`;
        } else if (isKingInCheck(currentPlayer, boardState)) {
             status = `${colorName}'s Turn (in Check)`;
        } else {
             status = `${colorName}'s Turn`;
        }
        statusText.textContent = status;
    }

    // --- PIECE SELECTION & MOVEMENT ---
    function selectPiece(pieceCode, position) {
        selectedPiece = { piece: pieceCode, position: position };
        validMoves = generateAllValidMovesForPiece(position, boardState);
        renderBoard();
    }

    function clearSelection() {
        selectedPiece = null;
        validMoves = [];
        renderBoard();
    }

    function movePiece(from, to) {
        const movingPiece = boardState[from];
        let newEnPassantTarget = null;

        // Handle En Passant capture
        if (movingPiece.endsWith('P') && to === enPassantTarget) {
            const capturedPawnRank = currentPlayer === 'w' ? 5 : 4;
            delete boardState[`${to[0]}${capturedPawnRank}`];
        }

        // Handle Pawn's two-step move to set next en passant target
        if (movingPiece.endsWith('P') && Math.abs(from[1] - to[1]) === 2) {
            newEnPassantTarget = `${from[0]}${parseInt(from[1]) + (currentPlayer === 'w' ? 1 : -1)}`;
        }

        // Handle Castling
        if (movingPiece.endsWith('K') && Math.abs(files.indexOf(from[0]) - files.indexOf(to[0])) === 2) {
            const rookFile = to[0] === 'g' ? 'h' : 'd';
            const rookDestFile = to[0] === 'g' ? 'f' : 'c';
            const rank = from[1];
            boardState[`${rookFile}${rank}`] = boardState[`${to[0] === 'g' ? 'h' : 'a'}${rank}`];
            delete boardState[`${to[0] === 'g' ? 'h' : 'a'}${rank}`];
        }

        // Update board state
        boardState[to] = movingPiece;
        delete boardState[from];
        enPassantTarget = newEnPassantTarget;

        // Handle Pawn Promotion
        if ((movingPiece === 'wP' && to.endsWith('8')) || (movingPiece === 'bP' && to.endsWith('1'))) {
            const newPiece = prompt("Promote to (Q, R, B, N)?", "Q").toUpperCase();
            boardState[to] = currentPlayer + (['Q', 'R', 'B', 'N'].includes(newPiece) ? newPiece : 'Q');
        }

        // Update castling rights
        if (movingPiece === 'wK') { castlingRights.w.k = castlingRights.w.q = false; }
        if (movingPiece === 'bK') { castlingRights.b.k = castlingRights.b.q = false; }
        if (from === 'a1' || to === 'a1') { castlingRights.w.q = false; }
        if (from === 'h1' || to === 'h1') { castlingRights.w.k = false; }
        if (from === 'a8' || to === 'a8') { castlingRights.b.q = false; }
        if (from === 'h8' || to === 'h8') { castlingRights.b.k = false; }

        // Switch player and check game state
        currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
        clearSelection();
        checkGameState();
    }
    
    // --- GAME STATE CHECKS ---
    function checkGameState() {
        const allMoves = generateAllLegalMovesForPlayer(currentPlayer, boardState);
        const inCheck = isKingInCheck(currentPlayer, boardState);
        
        if (allMoves.length === 0) {
            isGameOver = true;
            if (inCheck) {
                statusText.textContent = `Checkmate! ${currentPlayer === 'w' ? 'Black' : 'White'} wins.`;
            } else {
                statusText.textContent = "Stalemate! It's a draw.";
            }
        } else {
             updateStatus();
        }
    }

    function isKingInCheck(kingColor, currentBoard) {
        const kingPos = Object.keys(currentBoard).find(pos => currentBoard[pos] === `${kingColor}K`);
        if (!kingPos) return false; // Should not happen in a real game
        return isSquareAttacked(kingPos, kingColor === 'w' ? 'b' : 'w', currentBoard);
    }
    
    function isSquareAttacked(position, attackerColor, currentBoard) {
        for (const pos in currentBoard) {
            if (currentBoard[pos].startsWith(attackerColor)) {
                // We use the "raw" move generation here, as we are just checking for attacks
                const moves = generateMovesForPiece(pos, currentBoard);
                if (moves.includes(position)) {
                    return true;
                }
            }
        }
        return false;
    }

    // --- MOVE GENERATION ---
    // Generates all moves and then filters out illegal ones (that leave king in check)
    function generateAllValidMovesForPiece(position, currentBoard) {
        const moves = generateMovesForPiece(position, currentBoard);
        const pieceColor = currentBoard[position][0];
        return moves.filter(move => {
            const tempBoard = { ...currentBoard };
            tempBoard[move] = tempBoard[position];
            delete tempBoard[position];
            return !isKingInCheck(pieceColor, tempBoard);
        });
    }

    function generateAllLegalMovesForPlayer(playerColor, boardState) {
        let legalMoves = [];
        for (const pos in boardState) {
            if(boardState[pos].startsWith(playerColor)) {
                const moves = generateAllValidMovesForPiece(pos, boardState);
                legalMoves.push(...moves);
            }
        }
        return legalMoves;
    }

    // Generates all pseudo-legal moves for a piece (doesn't check for self-check)
    function generateMovesForPiece(position, currentBoard) {
        const piece = currentBoard[position];
        if (!piece) return [];
        const color = piece[0];
        const type = piece[1];
        
        const moves = [];
        const [file, rank] = [position[0], parseInt(position[1])];
        const fileIndex = files.indexOf(file);

        const addMove = (r, f, canCapture, mustCapture, canMoveEmpty) => {
            if (r >= 1 && r <= 8 && f >= 0 && f < 8) {
                const targetPos = `${files[f]}${r}`;
                const targetPiece = currentBoard[targetPos];
                if (targetPiece) {
                    if (canCapture && !targetPiece.startsWith(color)) moves.push(targetPos);
                } else {
                    if (!mustCapture && canMoveEmpty) moves.push(targetPos);
                }
                return !targetPiece; // Return true to continue sliding
            }
            return false;
        };

        const addSlidingMoves = (directions) => {
            directions.forEach(([dr, df]) => {
                let r = rank + dr, f = fileIndex + df;
                while (addMove(r, f, true, false, true)) {
                    r += dr; f += df;
                }
            });
        };

        switch(type) {
            case 'P':
                const dir = color === 'w' ? 1 : -1;
                const startRank = color === 'w' ? 2 : 7;
                // Forward one
                if (!currentBoard[`${file}${rank + dir}`]) {
                    addMove(rank + dir, fileIndex, false, false, true);
                    // Forward two
                    if (rank === startRank && !currentBoard[`${file}${rank + 2 * dir}`]) {
                        addMove(rank + 2 * dir, fileIndex, false, false, true);
                    }
                }
                // Captures
                [-1, 1].forEach(df => {
                    const targetPos = `${files[fileIndex + df]}${rank + dir}`;
                    if (currentBoard[targetPos] && !currentBoard[targetPos].startsWith(color)) {
                        addMove(rank + dir, fileIndex + df, true, true, false);
                    }
                    // En Passant
                    if (targetPos === enPassantTarget) {
                        addMove(rank + dir, fileIndex + df, true, true, true);
                    }
                });
                break;
            case 'N':
                [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]].forEach(([dr, df]) => {
                    addMove(rank + dr, fileIndex + df, true, false, true);
                });
                break;
            case 'B': addSlidingMoves([[1,1], [1,-1], [-1,1], [-1,-1]]); break;
            case 'R': addSlidingMoves([[1,0], [-1,0], [0,1], [0,-1]]); break;
            case 'Q': addSlidingMoves([[1,1], [1,-1], [-1,1], [-1,-1], [1,0], [-1,0], [0,1], [0,-1]]); break;
            case 'K':
                [[1,1], [1,-1], [-1,1], [-1,-1], [1,0], [-1,0], [0,1], [0,-1]].forEach(([dr, df]) => {
                    addMove(rank + dr, fileIndex + df, true, false, true);
                });
                // Castling
                if (castlingRights[color]?.k && !currentBoard[`f${rank}`] && !currentBoard[`g${rank}`] &&
                    !isSquareAttacked(`e${rank}`, color === 'w' ? 'b' : 'w', currentBoard) &&
                    !isSquareAttacked(`f${rank}`, color === 'w' ? 'b' : 'w', currentBoard)) {
                    moves.push(`g${rank}`);
                }
                if (castlingRights[color]?.q && !currentBoard[`d${rank}`] && !currentBoard[`c${rank}`] && !currentBoard[`b${rank}`] &&
                    !isSquareAttacked(`e${rank}`, color === 'w' ? 'b' : 'w', currentBoard) &&
                    !isSquareAttacked(`d${rank}`, color === 'w' ? 'b' : 'w', currentBoard)) {
                    moves.push(`c${rank}`);
                }
                break;
        }
        return moves;
    }

    // --- EVENT LISTENERS ---
    resetButton.addEventListener('click', initializeBoard);

    // --- START GAME ---
    initializeBoard();
});