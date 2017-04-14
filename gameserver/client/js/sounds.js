var playlist = ["candlepower", "are_you_you", ]

var soundtrack = new Howl({
    src: ['static/sounds/candlepower.mp3'],
    autoplay: false,
    loop: true,
    html5: true,
    volume: 0.5,
});

var background = new Howl({
    src: ['static/sounds/engine.mp3'],
    autoplay: true,
    loop: true,
    html5: true,
    volume: 0.2,
});

var onSelectSound = new Howl({
    src: ['static/sounds/can_tick.wav'],
    html5: true,
    volume: 0.2

})

var onLaunchSound = new Howl({
    src: ['static/sounds/launch.wav'],
    html5: true,
    volume: 0.5
})

var shipLandSound = new Howl({
    src: ['static/sounds/synth_kick.wav'],
    html5: true,
    volume: 0.2

})
