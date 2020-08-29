module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: [
		'<rootDir>/src/routes',
		'<rootDir>/src/models',
		'<rootDir>/src/nats-events'
	],
	globals: {
		'ts-jest': {
			babelConfig: true,
			compiler: 'ttypescript',
			tsConfig: 'jest.tsconfig.json'
		}
	},
	setupFilesAfterEnv: ['./src/test/setup.ts'],
	coveragePathIgnorePatterns: ['/node_modules/'],
	moduleDirectories: ['.', 'node_modules']
}
