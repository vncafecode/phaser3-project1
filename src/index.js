import Phaser from 'phaser';
import * as Assets from './assets/index.js';

const gameViewWidth = 800;
const gameViewHeight = 600;
const gravity = 300;

let platforms;
let player;
let cursors;
let stars;
let bombs;
let score = 0;
let scoreText;
let gameOver = false;
let screenCenterX;
let screenCenterY;

class MyGame extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        this.load.image(Assets.Sky.key, Assets.Sky.url);
        this.load.image(Assets.Ground.key, Assets.Ground.url);
        this.load.image(Assets.Star.key, Assets.Star.url);
        this.load.image(Assets.Bomb.key, Assets.Bomb.url);

        this.load.spritesheet(Assets.Dude.key, Assets.Dude.url, { frameWidth: 32, frameHeight: 42 });
    }

    create() {
        this.spawnEnvironment();
        this.spawnStar();
        this.spawnPlayer();
        this.spawnBomb();

        this.createAnimations();

        this.createPhysics();

        cursors = this.input.keyboard.createCursorKeys();

        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    }

    update() {
        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-490);
        }
    }

    collectStar(player, star) {
        star.disableBody(true, true);

        score += 10;
        scoreText.setText(`Score: ${score}`);

        if (stars.countActive(true) % 3 === 0) {
            if (stars.countActive(true) === 0) {
                stars.children.iterate(child => {
                    child.enableBody(true, child.x, child.y - 20, true, true);
                });
            }

            let x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
            let bomb = bombs.create(x, 16, Assets.Bomb.key);
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    hitBomb(player) {
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');

        screenCenterX = this.cameras.main.width / 2;
        screenCenterY = this.cameras.main.height / 2;
        this.add.text(screenCenterX, screenCenterY, 'Gameover !!!', { fontSize: '48px', fill: 'crimson' }).setOrigin(0.5);
    }

    spawnStar() {
        let heightFromGround = 50;

        stars = this.physics.add.group({
            key: Assets.Star.key,
            repeat: 3,
            setXY: { x: 12, y: 250 - 16 - heightFromGround, stepX: 70 }
        });

        stars.create(420, 400 - 16 - heightFromGround, Assets.Star.key);
        stars.create(490, 400 - 16 - heightFromGround, Assets.Star.key);
        stars.create(560, 400 - 16 - heightFromGround, Assets.Star.key);
        stars.create(630, 400 - 16 - heightFromGround, Assets.Star.key);
        stars.create(700, 400 - 16 - heightFromGround, Assets.Star.key);
        stars.create(770, 400 - 16 - heightFromGround, Assets.Star.key);

        stars.create(570, 220 - 16 - heightFromGround, Assets.Star.key);
        stars.create(640, 220 - 16 - heightFromGround, Assets.Star.key);
        stars.create(710, 220 - 16 - heightFromGround, Assets.Star.key);
        stars.create(780, 220 - 16 - heightFromGround, Assets.Star.key);

        stars.children.iterate(child => {
            child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.2));
        });
    }

    spawnPlayer() {
        player = this.physics.add.sprite(100, 450, Assets.Dude.key);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        player.body.setGravityY(300);
    }

    spawnEnvironment() {
        this.add.image(gameViewWidth / 2, gameViewHeight / 2, Assets.Sky.key);

        platforms = this.physics.add.staticGroup();
        platforms.create(400, 568, Assets.Ground.key).setScale(2).refreshBody();
        platforms.create(600, 400, Assets.Ground.key);
        platforms.create(50, 250, Assets.Ground.key);
        platforms.create(750, 220, Assets.Ground.key);
    }

    spawnBomb() {
        bombs = this.physics.add.group();
    }

    createAnimations() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(Assets.Dude.key, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: Assets.Dude.key, frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(Assets.Dude.key, { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    createPhysics() {
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);
        this.physics.add.overlap(player, stars, this.collectStar, null, this);
        this.physics.add.overlap(player, bombs, this.hitBomb, null, this);
    }
}

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: gameViewWidth,
    height: gameViewHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
            debug: false
        }
    },
    scene: MyGame
};

new Phaser.Game(config);
