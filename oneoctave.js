function createNote(audioCtx, sound, element, key){


	var source = audioCtx.createBufferSource();
	var buffer = null;
	var keyDown = false;

	Mousetrap.bind(key, function() { onKeyDown(); });
	Mousetrap.bind(key, function() { onKeyUp(); }, 'keyup');

	element.addEventListener('touchstart', function(){ play();});
	element.addEventListener('mousedown', function(){ play();});
	element.addEventListener('touchend', function(){ stop();});
	element.addEventListener('mouseup', function(){ stop();});
	

	function play(){
		source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(audioCtx.destination);
		source.start(0);
	}

	function stop(){
		source.stop(0);
	}

	function onKeyDown(){
		if (!keyDown){
			keyDown = true;
			play();
		}
	}

	function onKeyUp(){
		if (keyDown){
			keyDown = false;
			stop();
		}
	}

	function decodeAudioData(){
			var deferred = Q.defer(),
			request = new XMLHttpRequest();

			request.open('GET', sound, true);
			request.responseType='arraybuffer';

			request.onload = function(){
				var audioData = request.response;
				audioCtx.decodeAudioData(audioData, function(b){
					buffer = b;
					deferred.resolve(b);
				},
				function(e){
					deferred.reject("Error with decoding audio data: " + e.err);
				});
			}

			request.send();

			return deferred.promise;
		}

	return {
		 decodeAudioData: decodeAudioData
	};
}