// Using this tutorial to get a general idea of what I'm doing https://youtu.be/Z4KgaYlth0k?si=GhtGsP_xppartx_e
import React, { useState } from 'react';

/* General logic explanation: Display 3 full red hearts, and keep track of the health (is done in other file)
change display according to that health value */
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