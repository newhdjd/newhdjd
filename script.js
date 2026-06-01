
const BOARD_SIZE = 15;
const CELL_SIZE = 36;
const PADDING = 20;
const PIECE_RADIUS = 15;

let board = [];
let currentPlayer = 'black';
let gameOver = false;
let moveHistory = [];
let winningLine = [];
let canvas, ctx;

function init() {
    createParticles();
    initBoard();
    initCanvas();
    initEventListeners();
    drawBoard();
    updateTurnIndicator();
}

function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i &lt; 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

function initBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() =&gt; Array(BOARD_SIZE).fill(0));
    currentPlayer = 'black';
    gameOver = false;
    moveHistory = [];
    winningLine = [];
}

function initCanvas() {
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    
    const size = (BOARD_SIZE - 1) * CELL_SIZE + PADDING * 2;
    canvas.width = size;
    canvas.height = size;
}

function initEventListeners() {
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('undo-btn').addEventListener('click', undoMove);
    document.getElementById('play-again-btn').addEventListener('click', restartGame);
    
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) =&gt; {
        if (e.key === 'Enter') sendMessage();
    });
}

function handleClick(e) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.round((x - PADDING) / CELL_SIZE);
    const row = Math.round((y - PADDING) / CELL_SIZE);
    
    if (row &gt;= 0 &amp;&amp; row &lt; BOARD_SIZE &amp;&amp; col &gt;= 0 &amp;&amp; col &lt; BOARD_SIZE) {
        if (board[row][col] === 0) {
            placePiece(row, col);
        }
    }
}

let hoverPos = null;

function handleMouseMove(e) {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.round((x - PADDING) / CELL_SIZE);
    const row = Math.round((y - PADDING) / CELL_SIZE);
    
    if (row &gt;= 0 &amp;&amp; row &lt; BOARD_SIZE &amp;&amp; col &gt;= 0 &amp;&amp; col &lt; BOARD_SIZE &amp;&amp; board[row][col] === 0) {
        hoverPos = { row, col };
    } else {
        hoverPos = null;
    }
    
    drawBoard();
}

function placePiece(row, col) {
    const playerValue = currentPlayer === 'black' ? 1 : 2;
    board[row][col] = playerValue;
    moveHistory.push({ row, col, player: currentPlayer });
    
    drawBoard();
    updateMoveCount();
    
    if (checkWin(row, col, playerValue)) {
        gameOver = true;
        showGameOver();
        addSystemMessage(`${currentPlayer === 'black' ? '黑棋' : '白棋'}获胜！`);
    } else if (moveHistory.length === BOARD_SIZE * BOARD_SIZE) {
        gameOver = true;
        showGameOver(true);
        addSystemMessage('平局！');
    } else {
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        updateTurnIndicator();
    }
}

function checkWin(row, col, player) {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
        let count = 1;
        const line = [{ row, col }];
        
        for (let i = 1; i &lt; 5; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            if (newRow &gt;= 0 &amp;&amp; newRow &lt; BOARD_SIZE &amp;&amp; newCol &gt;= 0 &amp;&amp; newCol &lt; BOARD_SIZE &amp;&amp; board[newRow][newCol] === player) {
                count++;
                line.push({ row: newRow, col: newCol });
            } else {
                break;
            }
        }
        
        for (let i = 1; i &lt; 5; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            if (newRow &gt;= 0 &amp;&amp; newRow &lt; BOARD_SIZE &amp;&amp; newCol &gt;= 0 &amp;&amp; newCol &lt; BOARD_SIZE &amp;&amp; board[newRow][newCol] === player) {
                count++;
                line.push({ row: newRow, col: newCol });
            } else {
                break;
            }
        }
        
        if (count &gt;= 5) {
            winningLine = line;
            return true;
        }
    }
    
    return false;
}

function drawBoard() {
    const size = (BOARD_SIZE - 1) * CELL_SIZE + PADDING * 2;
    ctx.clearRect(0, 0, size, size);
    
    ctx.fillStyle = '#dcb35c';
    ctx.fillRect(0, 0, size, size);
    
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 1;
    
    for (let i = 0; i &lt; BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(PADDING, PADDING + i * CELL_SIZE);
        ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, PADDING + i * CELL_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(PADDING + i * CELL_SIZE, PADDING);
        ctx.lineTo(PADDING + i * CELL_SIZE, PADDING + (BOARD_SIZE - 1) * CELL_SIZE);
        ctx.stroke();
    }
    
    const starPoints = [
        [3, 3], [3, 11], [7, 7], [11, 3], [11, 11]
    ];
    
    ctx.fillStyle = '#8b6914';
    for (const [row, col] of starPoints) {
        ctx.beginPath();
        ctx.arc(PADDING + col * CELL_SIZE, PADDING + row * CELL_SIZE, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    if (hoverPos &amp;&amp; !gameOver) {
        const x = PADDING + hoverPos.col * CELL_SIZE;
        const y = PADDING + hoverPos.row * CELL_SIZE;
        ctx.globalAlpha = 0.3;
        drawPiece(x, y, currentPlayer);
        ctx.globalAlpha = 1;
    }
    
    for (let row = 0; row &lt; BOARD_SIZE; row++) {
        for (let col = 0; col &lt; BOARD_SIZE; col++) {
            if (board[row][col] !== 0) {
                const x = PADDING + col * CELL_SIZE;
                const y = PADDING + row * CELL_SIZE;
                const player = board[row][col] === 1 ? 'black' : 'white';
                drawPiece(x, y, player);
                
                if (moveHistory.length &gt; 0) {
                    const lastMove = moveHistory[moveHistory.length - 1];
                    if (lastMove.row === row &amp;&amp; lastMove.col === col) {
                        drawLastMoveIndicator(x, y);
                    }
                }
            }
        }
    }
    
    if (winningLine.length &gt; 0) {
        drawWinningLine();
    }
}

function drawPiece(x, y, player) {
    const gradient = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, PIECE_RADIUS);
    
    if (player === 'black') {
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(1, '#000');
    } else {
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
    }
    
    ctx.beginPath();
    ctx.arc(x, y, PIECE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    if (player === 'white') {
        ctx.strokeStyle = '#bbb';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawLastMoveIndicator(x, y) {
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
}

function drawWinningLine() {
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.7;
    
    ctx.beginPath();
    for (let i = 0; i &lt; winningLine.length; i++) {
        const x = PADDING + winningLine[i].col * CELL_SIZE;
        const y = PADDING + winningLine[i].row * CELL_SIZE;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function updateTurnIndicator() {
    const turnBlack = document.getElementById('turn-black');
    const turnWhite = document.getElementById('turn-white');
    const statusText = document.querySelector('.status-text');
    
    turnBlack.classList.toggle('active', currentPlayer === 'black');
    turnWhite.classList.toggle('active', currentPlayer === 'white');
    
    statusText.textContent = currentPlayer === 'black' ? '黑棋回合' : '白棋回合';
}

function updateMoveCount() {
    document.getElementById('move-count').textContent = moveHistory.length;
}

function showGameOver(isDraw = false) {
    const overlay = document.getElementById('board-overlay');
    const winnerText = document.getElementById('winner-text');
    
    if (isDraw) {
        winnerText.textContent = '平局！';
    } else {
        winnerText.textContent = currentPlayer === 'black' ? '黑棋获胜！' : '白棋获胜！';
    }
    
    overlay.classList.add('active');
}

function hideGameOver() {
    document.getElementById('board-overlay').classList.remove('active');
}

function restartGame() {
    initBoard();
    hideGameOver();
    drawBoard();
    updateTurnIndicator();
    updateMoveCount();
    addSystemMessage('游戏重新开始！黑棋先行');
}

function undoMove() {
    if (moveHistory.length === 0 || gameOver) return;
    
    const lastMove = moveHistory.pop();
    board[lastMove.row][lastMove.col] = 0;
    currentPlayer = lastMove.player;
    
    drawBoard();
    updateTurnIndicator();
    updateMoveCount();
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    
    if (text) {
        addChatMessage(text, currentPlayer);
        input.value = '';
    }
}

function addChatMessage(text, player) {
    const messages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${player}`;
    messageDiv.innerHTML = `&lt;p&gt;${escapeHtml(text)}&lt;/p&gt;`;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function addSystemMessage(text) {
    const messages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message system';
    messageDiv.innerHTML = `&lt;p&gt;${text}&lt;/p&gt;`;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
