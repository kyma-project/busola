import {
  ErrorType,
  ErrResponse,
  MessageChunk,
} from 'components/KymaCompanion/components/Chat/Message/Message';

// export function retry(fn, handleSuccess, handleError, retries, timegap) {
//   let finished = false;
//   for (let i = 0; i < retries; i++) {
//     const handleErrWrapper = (errResponse: ErrResponse) => {
//       console.log('Got status code', errResponse.statusCode);
//       errResponse.message =
//         errResponse.type === ErrorType.NOT_FATAL
//           ? errResponse.message +
//             `. Response status code was ${
//               errResponse.statusCode
//             } and it wasn't ok. Retrying ${i + 1}/${retries}`
//           : errResponse.message;
//       handleError(errResponse);
//       console.log('2: Finished handling the error');
//     };
//     const handleChatResponseWrapper = (chunk: MessageChunk) => {
//       handleSuccess(chunk);
//       finished = true;
//       console.log('2: Finished reading the answer');
//     };
//     await fn();
//
//     console.log('3: Fetch Done. Finished:', finished);
//     if (!finished) {
//       await new Promise(resolve => setTimeout(resolve, retries));
//     } else {
//       console.log('DONE');
//       break;
//     }
//   }
// }
