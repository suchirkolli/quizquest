// Using this tutorial to get a general idea of how to make a health bar https://youtu.be/Z4KgaYlth0k?si=GhtGsP_xppartx_e
interface HealthBarHearts {
  healthNumber: number;
}

export default function Healthbar({ healthNumber }: HealthBarHearts) {
  if (healthNumber === 3) {
    return (
      <span>
        <span>❤️</span>
        <span>❤️</span>
        <span>❤️</span>
      </span>
    );
  } else if (healthNumber === 2) {
    return (
      <span>
        <span>❤️</span>
        <span>❤️</span>
        <span>💀</span>
      </span>
    );
  } else if (healthNumber === 1) {
    return (
      <span>
        <span>❤️</span>
        <span>💀</span>
        <span>💀</span>
      </span>
    );
  } else {
    return (
      <span>
        <span>💀</span>
        <span>💀</span>
        <span>💀</span>
      </span>
    );
  }
}