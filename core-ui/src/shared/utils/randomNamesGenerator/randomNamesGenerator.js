import { adjectives, nouns } from 'shared/utils/randomNamesGenerator/words';

export function randomNamesGenerator() {
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  return (
    adjectives[getRandomInt(0, adjectives.length + 1)] +
    '-' +
    nouns[getRandomInt(0, nouns.length + 1)]
  ).toLowerCase();
}
