import type { GameVolatileState } from './types';
import { GAME_CONSTANTS } from './constants';
import { checkAABBCollision } from './physics';
import { GamePhase, useGameStore } from '../../../store/useGameStore';
import { audioEngine } from './audioEngine';

export function createInitialState(): GameVolatileState {
    return {
        player: {
            x: GAME_CONSTANTS.PLAYER_START_X,
            y: GAME_CONSTANTS.GROUND_Y - GAME_CONSTANTS.PLAYER_HEIGHT,
            width: GAME_CONSTANTS.PLAYER_WIDTH,
            height: GAME_CONSTANTS.PLAYER_HEIGHT,
            vy: 0,
            isJumping: false,
            frameX: 0,
            frameTimer: 0,
        },
        obstacles: [],
        backgroundOffset: 0,
        speedMultiplier: 1.0,
        lastFrameTime: performance.now(),
        survivalTimer: 0,
        spawnTimer: 0,
        cutscenePhase: 0,
        executiveX: GAME_CONSTANTS.CANVAS_WIDTH + 100,
        keys: new Set<string>(),
    };
}

export function updatePhysics(volatileState: GameVolatileState, phase: GamePhase, dtMs: number) {
    const dt = dtMs / 1000; // seconds
    const { player, obstacles } = volatileState;

    if (phase === GamePhase.START_MENU || phase === GamePhase.GAME_OVER) {
        // Background might still pan slowly or stop, but no physics updates.
        return;
    }

    // Jumping Input
    if (volatileState.keys.has(' ') || volatileState.keys.has('ArrowUp')) {
        if (!player.isJumping) {
            player.vy = GAME_CONSTANTS.JUMP_VELOCITY;
            player.isJumping = true;
            if (!useGameStore.getState().isMuted) {
                audioEngine.playJumpSound();
            }
        }
    }

    // Apply Gravity
    if (player.isJumping) {
        player.vy += GAME_CONSTANTS.GRAVITY * dt;
        player.y += player.vy * dt;

        const groundLimit = GAME_CONSTANTS.GROUND_Y - player.height;
        if (player.y >= groundLimit) {
            player.y = groundLimit;
            player.vy = 0;
            player.isJumping = false;
        }
    }

    // Player Animation
    if (!player.isJumping) {
        // Only animate run if moving (speedMultiplier > 0 or in cutscene phase 1 where x expands)
        if (volatileState.speedMultiplier > 0 || volatileState.cutscenePhase === 1) {
            player.frameTimer += dtMs;
            if (player.frameTimer > 150) { // toggle every 150ms
                player.frameX = (player.frameX === 0) ? 1 : 0;
                player.frameTimer = 0;
            }
        }
    } else {
        player.frameX = 0; // Reset for jumping
    }

    // Horizontal Movement (Background layer / Obstacles translation)
    volatileState.backgroundOffset -= (GAME_CONSTANTS.BASE_SPEED * volatileState.speedMultiplier) * dt;
    if (volatileState.backgroundOffset <= -GAME_CONSTANTS.CANVAS_WIDTH) {
        volatileState.backgroundOffset = 0;
    }

    if (phase === GamePhase.PLAYING) {
        // Survival timer
        volatileState.survivalTimer += dtMs;
        if (volatileState.survivalTimer >= GAME_CONSTANTS.SURVIVAL_TIME) {
            // Reached cutscene
            useGameStore.getState().setGamePhase(GamePhase.TRANSITION);
        }

        // Spawn Obstacles
        volatileState.spawnTimer -= dtMs;
        if (volatileState.spawnTimer <= 0) {
            obstacles.push({
                x: GAME_CONSTANTS.CANVAS_WIDTH + 50,
                y: GAME_CONSTANTS.GROUND_Y - GAME_CONSTANTS.OBSTACLE_HEIGHT,
                width: GAME_CONSTANTS.OBSTACLE_WIDTH,
                height: GAME_CONSTANTS.OBSTACLE_HEIGHT,
                passed: false,
                frameX: 0,
                frameTimer: 0,
            });
            // randomize next spawn
            volatileState.spawnTimer = GAME_CONSTANTS.OBSTACLE_SPAWN_MIN + Math.random() * (GAME_CONSTANTS.OBSTACLE_SPAWN_MAX - GAME_CONSTANTS.OBSTACLE_SPAWN_MIN);
        }
    }

    // Update Obstacles and Check For Collisions
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= (GAME_CONSTANTS.BASE_SPEED * volatileState.speedMultiplier) * dt;

        // Animate Obstacle
        if (volatileState.speedMultiplier > 0) {
            obs.frameTimer += dtMs;
            if (obs.frameTimer > 200) {
                obs.frameX = (obs.frameX === 0) ? 1 : 0;
                obs.frameTimer = 0;
            }
        }

        // Check collision only when PLAYING
        if (phase === GamePhase.PLAYING) {
            if (checkAABBCollision(player, obs, GAME_CONSTANTS.HITBOX_SHRINK)) {
                useGameStore.getState().setGamePhase(GamePhase.GAME_OVER);
                if (!useGameStore.getState().isMuted) {
                    audioEngine.playCrashSound();
                }
                return; // stop updates immediately
            }
        }

        // Score point
        if (!obs.passed && obs.x + obs.width < player.x) {
            obs.passed = true;
            if (phase === GamePhase.PLAYING) {
                useGameStore.getState().incrementScore(10);
            }
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < -100) {
            obstacles.splice(i, 1);
        }
    }

    if (phase === GamePhase.TRANSITION) {
        // Decelerate the game speed multiplier down to 0
        volatileState.speedMultiplier = Math.max(0, volatileState.speedMultiplier - (dt * 0.5)); // decelerates over ~2 seconds
        if (volatileState.speedMultiplier === 0 && obstacles.length === 0) {
            // Proceed to cutscene officially when everything is stopped and offscreen
            useGameStore.getState().setGamePhase(GamePhase.CUTSCENE);
            volatileState.cutscenePhase = 1;
        }
    }

    if (phase === GamePhase.CUTSCENE) {
        if (volatileState.cutscenePhase === 1) {
            // Phase 1: Move Player to center right
            volatileState.player.x += dt * 100;
            if (volatileState.player.x >= GAME_CONSTANTS.CANVAS_WIDTH / 2) {
                volatileState.cutscenePhase = 2;
            }
        } else if (volatileState.cutscenePhase === 2) {
            // Phase 2: Executive walks in from right
            volatileState.executiveX -= dt * 100;
            if (volatileState.executiveX <= volatileState.player.x + 80) { // arbitrary distance
                volatileState.cutscenePhase = 3; // Handshake!
            }
        }
    }
}
