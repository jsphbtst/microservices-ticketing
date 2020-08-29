module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: [
    "<rootDir>/src/routes"
  ],
  globals: {
    "ts-jest": {
      babelConfig: true,
      compiler: "ttypescript",
      tsConfig: "jest.tsconfig.json"
    }
  },
  setupFilesAfterEnv: [
    "./src/test/setup.ts"
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
  moduleDirectories: [
    ".",
    "node_modules"
  ]
}
