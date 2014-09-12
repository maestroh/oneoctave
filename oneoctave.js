function bindInput(element, key, audio){
	var keyDown = false;

	Mousetrap.bind(key, function() { onKeyDown(); });
	Mousetrap.bind(key, function() { onKeyUp(); }, 'keyup');

	element.addEventListener('touchstart', audio.play);
	element.addEventListener('mousedown', audio.play);
	element.addEventListener('touchend', audio.stop);
	element.addEventListener('mouseup', audio.stop);

	function onKeyDown(){
		if (!keyDown){
			keyDown = true;
			audio.play();
		}
	}

	function onKeyUp(){
		if (keyDown){
			keyDown = false;
			audio.stop();
		}
	}
}

function createAudio(audioCtx, sound){
	var source = audioCtx.createBufferSource();
	var buffer = null;

	return {
		play: play,
		stop: stop,
		decodeAudioData: decodeAudioData
	};

	function play(){
		source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(audioCtx.destination);
		source.start(0);
	}

	function stop(){
		source.stop(0);
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

	
}