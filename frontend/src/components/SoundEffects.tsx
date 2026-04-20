// Tutorial referenced https://youtu.be/U1T_J6Odoqg?si=A2p-NjaDJzxMZZmg
// Used Claude for a simple template 

export const BGM1 = () => {
    const audio = new Audio('/QQAudio/BGM1.mp3');
    audio.loop = true;
    return audio;
};

export const BGM2 = () => {
    const audio = new Audio('/QQAudio/BGM2.mp3');
    audio.loop = true;
    return audio;
};

export const CorrectAnswer = () => {
    const audio = new Audio('/QQAudio/CorrectAnswer.mp3');
    audio.play();
};

export const Ouch = () => {
    const audio = new Audio('/QQAudio/Ouch.mp3');
    audio.play();
};

export const Powerup = () => {
    const audio = new Audio('/QQAudio/Powerup.mp3');
    return audio;
};

export const QuestStart = () => {
    const audio = new Audio('/QQAudio/QuestStart.mp3');
    return audio;
};

export const QuestFinish = () => {
    const audio = new Audio('/QQAudio/QuestFinish.mp3');
    audio.play();
};

export const QuestLost = () => {
    const audio = new Audio('/QQAudio/QuestLost.mp3');
    audio.play();
};

export const Click = () => {
    const audio = new Audio('/QQAudio/Select.mp3');
    return audio;

};

export const WrongAnswer = () => {
    const audio = new Audio('/QQAudio/WrongAnswer.mp3');
    return audio;
};

// powerups
export const Fiftyfifty = () => {
    const audio = new Audio('/QQAudio/5050.mp3');
    audio.play();
};
export const FreezeSFX = () => {
    const audio = new Audio('/QQAudio/Freeze.mp3');
    audio.play();
};
export const Shield = () => {
    const audio = new Audio('/QQAudio/Shield.mp3');
    audio.play();
};


