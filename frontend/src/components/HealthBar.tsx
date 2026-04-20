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