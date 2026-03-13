module.exports = (mouse, reading, scroll, face) => {
  return 0.35 * mouse + 0.25 * reading + 0.2 * scroll + 0.2 * face;
};
