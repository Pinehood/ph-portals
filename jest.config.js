module.exports = {
  moduleFileExtensions: ["js", "ts"],
  rootDir: "src",
  testRegex: ".spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "@modules/(.*)": "<rootDir>/modules/$1",
    "@portals/(.*)": "<rootDir>/modules/portals/$1",
    "@resources/(.*)": "<rootDir>/resources/$1",
    "@root/(.*)": "<rootDir>/$1",
    "@scrapers/(.*)": "<rootDir>/modules/scrapers/$1",
    "@tests/(.*)": "<rootDir>/tests/$1",
    "@utils/(.*)": "<rootDir>/modules/utils/$1",
  },
};
