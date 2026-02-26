export const GAME_ASSETS = {
    player: {
        walkA: new Image(),
        walkB: new Image(),
        jump: new Image(),
        hit: new Image()
    },
    enemy: {
        slimeWalkA: new Image(),
        slimeWalkB: new Image()
    },
    environment: {
        background: new Image()
    },
    npc: {
        executive: new Image()
    }
};

let assetsLoaded = false;

export function loadGameAssets(onComplete: () => void) {
    if (assetsLoaded) {
        onComplete();
        return;
    }

    const imagePaths = [
        { img: GAME_ASSETS.player.walkA, src: '/assets/game/player/walk_a.png' },
        { img: GAME_ASSETS.player.walkB, src: '/assets/game/player/walk_b.png' },
        { img: GAME_ASSETS.player.jump, src: '/assets/game/player/jump.png' },
        { img: GAME_ASSETS.player.hit, src: '/assets/game/player/hit.png' },
        { img: GAME_ASSETS.enemy.slimeWalkA, src: '/assets/game/enemies/slime_walk_a.png' },
        { img: GAME_ASSETS.enemy.slimeWalkB, src: '/assets/game/enemies/slime_walk_b.png' },
        { img: GAME_ASSETS.environment.background, src: '/assets/game/background.png' },
        { img: GAME_ASSETS.npc.executive, src: '/assets/game/npcs/executive.png' }
    ];

    let loadedCount = 0;

    const checkDone = () => {
        loadedCount++;
        if (loadedCount === imagePaths.length) {
            assetsLoaded = true;
            onComplete();
        }
    };

    imagePaths.forEach(item => {
        item.img.onload = checkDone;
        item.img.onerror = checkDone; // Prevent freezing if 1 misses
        item.img.src = item.src;
    });
}
