export const GAME_CONSTANTS = {
    GRAVITY: 2000,            // pixels per second squared
    JUMP_VELOCITY: -800,      // pixels per second (negative is up)
    BASE_SPEED: 400,          // pixels per second (background / obstacles sliding left)
    OBSTACLE_SPAWN_MIN: 1000, // min ms between spawns
    OBSTACLE_SPAWN_MAX: 2500, // max ms between spawns
    SURVIVAL_TIME: 15000,     // survive 15 seconds to reach cutscene (for testing)

    GROUND_Y: 320,            // The Y coordinate where the ground is drawn
    PLAYER_START_X: 100,      // Fixed X position for the player

    PLAYER_WIDTH: 40,
    PLAYER_HEIGHT: 60,

    OBSTACLE_WIDTH: 40,
    OBSTACLE_HEIGHT: 40,

    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 400,

    HITBOX_SHRINK: 5,         // forgiving hitbox
};
