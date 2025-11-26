import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Assets will be loaded here
  }

  create() {
    // Display placeholder text
    this.add
      .text(640, 360, 'Claude Run', {
        fontSize: '64px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 440, 'Press SPACE to start', {
        fontSize: '24px',
        color: '#888888',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // Listen for space key
    this.input.keyboard?.on('keydown-SPACE', () => {
      console.log('Game starting...');
    });
  }

  update(_time: number, _delta: number) {
    // Game loop logic will go here
  }
}
