import '@testing-library/jest-dom';

// 模拟 crypto.randomUUID
if (!globalThis.crypto) {
  globalThis.crypto = {};
}
if (!globalThis.crypto.randomUUID) {
  let counter = 0;
  globalThis.crypto.randomUUID = () => {
    counter += 1;
    return `00000000-0000-0000-0000-${String(counter).padStart(12, '0')}`;
  };
}
