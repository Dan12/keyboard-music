/**
 * Handles application errors
 * @param message jQuery element to load the modules onto
 * @param errorObj optional object connected to the error message
 */
function collectErrorMessage(message: string, errorObj?: any) {
  console.log(message);
  if (errorObj) {
    console.log(errorObj);
  }

  let err = new Error();
  console.log(err.stack);
}

function collectWarningMessage(message: string) {
  // console.log(message);
}
