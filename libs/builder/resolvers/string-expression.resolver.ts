/**
 * Run expression and return result
 *
 * @param {string} expression - expression to run
 * @returns {T} result of expression
 * @template T
 */
export function stringExpressionResolver<T>(expression: string): T {
  return new Function('return ' + expression)();
}
