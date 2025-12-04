import { FamilySize } from '../entities/Family';

const SMALL_WORDS = [
  'boo', 'eek', 'fear', 'dark', 'mist', 'fog', 'cold', 'dead', 'tomb', 'bone',
  'howl', 'moon', 'doom', 'evil', 'soul', 'crypt', 'shade', 'ghost', 'haunt',
];

const MEDIUM_WORDS = [
  'shadow', 'spirit', 'phantom', 'specter', 'wraith', 'zombie', 'vampire',
  'monster', 'creature', 'haunted', 'cursed', 'spooky', 'creepy', 'ghastly',
  'macabre', 'sinister', 'eerie', 'chilling',
];

const LARGE_WORDS = [
  'supernatural', 'poltergeist', 'apparition', 'graveyard', 'cemetery',
  'frightening', 'terrifying', 'bloodcurdling', 'nightmarish', 'paranormal',
  'possession', 'exorcism', 'necromancer', 'abomination',
];

export class WordDictionary {
  private usedWords: Set<string> = new Set();

  getWordForSize(size: FamilySize): string {
    let wordList: string[];
    
    switch (size) {
      case 'small':
        wordList = SMALL_WORDS;
        break;
      case 'medium':
        wordList = MEDIUM_WORDS;
        break;
      case 'large':
        wordList = LARGE_WORDS;
        break;
    }

    // Filter out recently used words
    const availableWords = wordList.filter(w => !this.usedWords.has(w));
    
    // If all words used, reset
    if (availableWords.length === 0) {
      this.usedWords.clear();
      return wordList[Math.floor(Math.random() * wordList.length)];
    }

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    this.usedWords.add(word);
    
    // Clear used words after using half the dictionary
    if (this.usedWords.size > wordList.length / 2) {
      this.usedWords.clear();
    }

    return word;
  }

  reset(): void {
    this.usedWords.clear();
  }
}
