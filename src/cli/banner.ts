import chalk from 'chalk';
import figlet from 'figlet';

export const printBanner = () => {
  console.log(
    chalk.cyanBright(
      figlet.textSync('Commitra', {
        font: 'Standard',
        horizontalLayout: 'fitted',
      })
    )
  );
  console.log(
    chalk.gray('🧠  Commit Smart. Build Better.\n')
  );
};
