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
    "@root/(.*)": "<rootDir>/$1",
    "@modules/(.*)": "<rootDir>/modules/$1",
    "@resources/(.*)": "<rootDir>/modules/resources/$1",
    "@portals/(.*)": "<rootDir>/modules/portals/$1",
    "@scrapers/(.*)": "<rootDir>/modules/scrapers/$1",
    "@utils/(.*)": "<rootDir>/modules/utils/$1",
    "@tests/(.*)": "<rootDir>/tests/$1",
  },
};
