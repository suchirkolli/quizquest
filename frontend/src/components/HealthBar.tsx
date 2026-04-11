// Using this tutorial to get a general idea of how to make a health bar https://youtu.be/Z4KgaYlth0k?si=GhtGsP_xppartx_e
import React, { useState } from 'react';

/* General logic explanation: Display 3 full red hearts, and keep track of the health on a scale of 3-0
subtract 1 each time an incorrect option is given, and change boolean values according to the health number
change the front end dispay of the hearts based on the health number. red heart = true, X = false */
interface HealthBarHearts {
    heart1: boolean;
    heart2: boolean;
    heart3: boolean;
}
export default function Healthbar({heart1, heart2, heart3}: HealthBarHearts) {
    const healthNumber = 3;
    return (<div>
        <span>{heart1 ? '❤️' : 'X'}</span> // if true then heart, if false then X
        <span>{heart2 ? '❤️' : 'X'}</span>
        <span>{heart3 ? '❤️' : 'X'}</span>
    </div>
);
}