// Using this tutorial to get a general idea of how to make a health bar https://youtu.be/Z4KgaYlth0k?si=GhtGsP_xppartx_e
import React, { useState } from 'react';

/* General logic explanation: Display 3 full red hearts, and keep track of the health on a scale of 3-0
subtract 1 each time an incorrect option is given, and change boolean values according to the health number
change the front end dispay of the hearts based on the health number. red heart = true, X = false */
interface HealthBarHearts {
    healthNumber: number;
}
export default function Healthbar({healthNumber}: HealthBarHearts) {
    <span> Health:</span>
        if (healthNumber === 3) {
            return (
                <span>
                    <span>❤️</span>
                    <span>❤️</span>
                    <span>❤️</span>
                </span>
            );
        }
        else if (healthNumber === 2) {
            return (
                <span>
                    <span>❤️</span>
                    <span>❤️</span>
                    <span>💀</span>
                </span>
            );
        }
        else if (healthNumber === 1) {
            return (
                <span>
                    <span>❤️</span>
                    <span>💀</span>
                    <span>💀</span>
                </span>
            );
        }
            else {
                return (
                    <span>
                    <span>💀</span>
                    <span>💀</span>
                    <span>💀</span>
                    </span>
                );
            }
        
}