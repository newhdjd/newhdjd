
## 1. Architecture Design
纯前端应用，使用Firebase Realtime Database实现实时数据同步。

```mermaid
graph TD
    A[HTML/CSS/JS Frontend] --&gt; B[Firebase Realtime Database]
    B --&gt; A
    C[Player 1] --&gt; A
    D[Player 2] --&gt; A
```

## 2. Technology Description
- Frontend: Vanilla JavaScript + HTML5 + CSS3
- Backend: Firebase Realtime Database (for real-time sync)
- Deployment: GitHub Pages

## 3. File Structure
| File | Purpose |
|------|---------|
| /index.html | Main game page with all UI |
| /style.css | Styling and animations |
| /script.js | Game logic and Firebase integration |
| /firebase-config.js | Firebase configuration |

## 4. Game Logic
### 4.1 Board Representation
```javascript
// 15x15 board, 0 = empty, 1 = black, 2 = white
const board = Array(15).fill(null).map(() =&gt; Array(15).fill(0));
```

### 4.2 Win Detection
Check 4 directions for 5 consecutive pieces:
- Horizontal
- Vertical
- Diagonal (top-left to bottom-right)
- Diagonal (top-right to bottom-left)

## 5. Firebase Data Structure
```json
{
  "rooms": {
    "room1": {
      "players": {
        "black": "player1",
        "white": "player2"
      },
      "board": [
        [0, 0, 0, ...],
        ...
      ],
      "currentTurn": "black",
      "gameOver": false,
      "winner": null,
      "moves": [],
      "chat": [
        {"user": "player1", "message": "Hello!", "timestamp": 1234567890}
      ]
    }
  }
}
```

## 6. Core Functions
| Function | Description |
|----------|-------------|
| `initGame()` | Initialize game board and Firebase listeners |
| `placePiece(row, col)` | Place a piece on the board |
| `checkWin(row, col, player)` | Check if current move results in a win |
| `createRoom(roomName)` | Create a new game room |
| `joinRoom(roomId)` | Join an existing game room |
| `sendMessage(text)` | Send chat message |
| `restartGame()` | Reset the board for a new game |
