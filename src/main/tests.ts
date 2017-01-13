/**
 * run the given tests and call the callback if successfull
 */
function runTests(callback: () => void) {
  console.log('Running tests');

  // TODO test zip
  // TODO test various typescript and modern functions
  // TODO test css properties?
  // TODO test webaudio api

  function arrayBufferToBase64( buffer: ArrayBuffer ): string {
      let binary = '';
      let bytes = new Uint8Array( buffer );
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return window.btoa( binary );
  }

  // let xhr = new XMLHttpRequest();
  // xhr.open('GET', 'songs/test_audio/beat1.wav');
  // xhr.responseType = 'arraybuffer';
  // xhr.onload = function(){
  //   let f = xhr.response;
  //
  //   var t0 = performance.now();
  //   let src = arrayBufferToBase64(f);
  //   console.log(src.substring(0,100));
  //   let begin = 'data:audio/mp3;base64,';
  //
  //   let t1 = performance.now();
  //   console.log("Call to buffer took " + (t1 - t0) + " milliseconds.")
  //
  //   new Howl({
  //     src: [begin + src],
  //     sprite: {
  //       test: [0, 500, true]
  //     },
  //     onload: function() {
  //       console.log(this._sprite['test']);
  //       t1 = performance.now();
  //       console.log("Call to loadsound took " + (t1 - t0) + " milliseconds.")
  //     }
  //   })
  // };
  // xhr.send();

  console.log('Tests successful');
  callback();
}
