export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Player extends Rect {
    vy: number; // vertical velocity
    isJumping: boolean;
    frameX: number;
    frameTimer: number;
}

export interface Obstacle extends Rect {
    passed: boolean; // to check if score should be incremented
    frameX: number;
    frameTimer: number;
}

export interface GameVolatileState {
    player: Player;
    obstacles: Obstacle[];
    backgroundOffset: number;
    speedMultiplier: number; // For transition/cutscene slowing down
    lastFrameTime: number;
    survivalTimer: number; // time survived in ms
    spawnTimer: number; // time since last spawn in ms

    // Cutscene specific animation states
    cutscenePhase: number;
    executiveX: number;

    // Input state
    keys: Set<string>;
}
