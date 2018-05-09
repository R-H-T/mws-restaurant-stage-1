/**
 * A promised sleep =)
 * @param {Number} ms Milliseconds to sleep.
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default sleep;
