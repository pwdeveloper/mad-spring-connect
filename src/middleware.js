// @flow

/**
 * Middleware is a function which takes a Promise and 
 * returns a new promise. What happens in the middle is
 * what the middleware actually does.
 * 
 * There are a couple of rules to define your own middleware:
 * 
 *   1. You must keep the chain alive, so you must either then or catch
 *      or do both with the incoming promise.
 *   2. When doing a 'catch' you must return a rejected promise.
 *  
 * @example
 * ```js
 * function displayError(promise) {
 *   return promise.catch((error) => {
 *     if (error.response.status === 400) {
 *       window.alert(error.message);
 *     }
 *  
 *     // Keep the chain alive.
 *     return Promise.reject(error);
 *   });
 * } 
 * ```
 */
export type Middleware = (Promise<*>) => Promise<*>

/**
 * Represents an error which arose from handling a Response.
 * 
 * @export
 * @class ErrorWithResponse
 * @extends {Error}
 */
export class ErrorWithResponse extends Error {
  response: Response;

  constructor(response: Response) {
    super(response.statusText);

    this.response = response;
  }
}

/**
 * Takes a Promise which resolves to a Response and returns a Promise which
 * either resolves back to the Response in case of 2xx status code, 
 * or rejects with an ErrorWithResponse in case of a non 2xx status code.
 * 
 * In other words checkStatus creates a fork in the road. All 2xx
 * responses will end up in the 'then' chain, and all non 2xx responses
 * will end up in the 'catch' chains.
 * 
 * @export
 * @param {Response} response https://developer.mozilla.org/en-US/docs/Web/API/Response
 * @returns {Response} The response if it was in the 2xx range.
 * @throws {ErrorWithResponse} An ErrorWithResponse instance.
 */
export function checkStatus(promise: Promise<Response>): Promise<Response> {
  return promise.then((response: Response) => {
    const status = response.status;
    
    if (status >= 200 && status <= 299) {
      return response;
    } else {
      return Promise.reject(new ErrorWithResponse(response));
    }
  });
}

/**
 * Takes a Promise which resolves to a Response and returns a Promise
 * which resolves to the JSON representation of the Response.
 * 
 * @param {Promise<Response>} Promise resolving to a Response
 * @return {Promise<JSON>} the JSON representation of the response body.
 * @throws {Error} An Error indicating that the JSON could not be parsed. 
 */
export function parseJSON(promise: Promise<Response>): Promise<JSON> {
  return promise.then((response: Response) => {
    return response.json();
  });
}