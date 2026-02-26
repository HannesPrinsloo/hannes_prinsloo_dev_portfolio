import type { GameVolatileState } from './types';
import { GAME_CONSTANTS } from './constants';
import { GamePhase } from '../../../store/useGameStore';
import { GAME_ASSETS } from './assets';

export function renderGame(
    ctx: CanvasRenderingContext2D,
    state: GameVolatileState,
    phase: GamePhase,
    score: number
) {
    // Clear Canvas
    ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);

    // Neo-Brutalist Sky fallback (Paper)
    ctx.fillStyle = '#f4f4f0'; // bg-paper
    ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);

    // Parallax Background Image
    const bg = GAME_ASSETS.environment.background;
    if (bg.complete && bg.naturalWidth > 0) {
        const bgWidth = bg.width;
        // Adjust speed for parallax effect (0.5x speed)
        const parallaxOffset = (state.backgroundOffset * 0.5) % bgWidth;

        // Draw primary image
        ctx.drawImage(bg, parallaxOffset, 0, bgWidth, GAME_CONSTANTS.CANVAS_HEIGHT);
        // Draw secondary image right next to it
        ctx.drawImage(bg, parallaxOffset + bgWidth, 0, bgWidth, GAME_CONSTANTS.CANVAS_HEIGHT);
    }

    // Neo-Brutalist Ground Line
    ctx.strokeStyle = '#1A1A1A'; // ink
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GAME_CONSTANTS.GROUND_Y);
    ctx.lineTo(GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.GROUND_Y);
    ctx.stroke();

    ctx.save();
    // Offset for horizontal hit effects (not currently used)
    // ctx.translate(state.camera.offsetX, 0);

    // Draw Obstacles (Slimes)
    for (const obs of state.obstacles) {
        // We use the two walk frames to animate the slimes sliding
        const slimeImg = obs.frameX === 0 ? GAME_ASSETS.enemy.slimeWalkA : GAME_ASSETS.enemy.slimeWalkB;
        ctx.drawImage(
            slimeImg,
            0, 0, slimeImg.width, slimeImg.height, // Source
            obs.x, obs.y - 12, obs.width, obs.height + 12 // Dest: slightly taller to maintain aspect ratio without floating
        );
    }

    // Draw Player
    if (phase === GamePhase.CUTSCENE && state.cutscenePhase >= 3) {
        // Player is happy/hit frame used as "success" pose for now
        ctx.drawImage(GAME_ASSETS.player.hit, state.player.x, state.player.y - 30, state.player.width + 20, state.player.height + 30);
    } else if (state.player.isJumping) {
        // Jump pose
        ctx.drawImage(GAME_ASSETS.player.jump, state.player.x, state.player.y - 30, state.player.width + 20, state.player.height + 30);
    } else {
        const runImg = state.player.frameX === 0 ? GAME_ASSETS.player.walkA : GAME_ASSETS.player.walkB;
        ctx.drawImage(runImg, state.player.x, state.player.y - 30, state.player.width + 20, state.player.height + 30);
    }

    // Draw Executive (in Cutscene)
    if (phase === GamePhase.CUTSCENE) {
        ctx.drawImage(
            GAME_ASSETS.npc.executive,
            state.executiveX, GAME_CONSTANTS.GROUND_Y - 90, 60, 90 // scaled appropriately
        );
    }

    // UI Overlays
    ctx.fillStyle = '#1A1A1A'; // ink
    ctx.font = 'bold 20px monospace';
    ctx.fillText(` SCORE: ${Math.floor(score)}`, 20, 30);

    // Timer progress bar
    ctx.fillStyle = '#f4f4f0'; // bg-paper
    ctx.fillRect(GAME_CONSTANTS.CANVAS_WIDTH - 220, 10, 200, 24);

    ctx.fillStyle = '#CCFF00'; // acid
    const progress = Math.min(1, state.survivalTimer / GAME_CONSTANTS.SURVIVAL_TIME);
    ctx.fillRect(GAME_CONSTANTS.CANVAS_WIDTH - 220, 10, 200 * progress, 24);

    ctx.strokeStyle = '#1A1A1A'; // ink
    ctx.lineWidth = 3;
    ctx.strokeRect(GAME_CONSTANTS.CANVAS_WIDTH - 220, 10, 200, 24);

    if (phase === GamePhase.START_MENU) {
        ctx.fillStyle = 'rgba(244, 244, 240, 0.9)'; // paper with opacity
        ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        ctx.fillStyle = '#1A1A1A'; // ink
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DEV RUNNER', GAME_CONSTANTS.CANVAS_WIDTH / 2, GAME_CONSTANTS.CANVAS_HEIGHT / 2 - 20);
        ctx.font = '20px monospace';
        ctx.fillText('Press SPACE to Start & Jump', GAME_CONSTANTS.CANVAS_WIDTH / 2, GAME_CONSTANTS.CANVAS_HEIGHT / 2 + 30);
        ctx.textAlign = 'left'; // reset
    }

    if (phase === GamePhase.GAME_OVER) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        ctx.fillStyle = '#1A1A1A'; // ink
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CRASHED!', GAME_CONSTANTS.CANVAS_WIDTH / 2, GAME_CONSTANTS.CANVAS_HEIGHT / 2 - 20);
        ctx.font = '20px monospace';
        ctx.fillText('Press SPACE to Restart', GAME_CONSTANTS.CANVAS_WIDTH / 2, GAME_CONSTANTS.CANVAS_HEIGHT / 2 + 30);
        ctx.textAlign = 'left'; // reset
    }
}
