import AppDataSource from '../src/data-source';

const command = process.argv[2];
const validCommands = ['show', 'run', 'revert', 'generate'];

if (!command || !validCommands.includes(command)) {
  console.error(
    `Usage: ts-node scripts/migration.ts <${validCommands.join('|')}>`,
  );
  process.exit(1);
}

async function main() {
  await AppDataSource.initialize();

  switch (command) {
    case 'show': {
      const migrations = await AppDataSource.showMigrations();
      console.log(
        migrations ? 'Pending migrations exist' : 'No pending migrations',
      );
      break;
    }
    case 'run': {
      const result = await AppDataSource.runMigrations();
      console.log(`Executed ${result.length} migration(s)`);
      result.forEach((m) => console.log(` - ${m.name}`));
      break;
    }
    case 'revert': {
      await AppDataSource.undoLastMigration();
      console.log('Last migration reverted');
      break;
    }
    case 'generate': {
      console.log(
        'Use: pnpm exec typeorm-ts-node-commonjs -d src/data-source.ts migration:generate src/migrations/<name>',
      );
      break;
    }
  }

  await AppDataSource.destroy();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
