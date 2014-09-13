function Track(){
	var events = [];
	var startTime;
	var isRecording = false;
	var isPlaying = false;

	return{
		record: record,
		stop: stop,
		play: play,
		add: add
	}

	function record(){
		startTime = new Date();
		events = [];
		isRecording = true;
	}

	function add(func){
		if(isRecording){
			events.push({func: func,delay: new Date() - startTime});
		}
	}

	function play(){
		for (var i = 0; i < events.length; i++) {
			setTimeout(events[i].func, events[i].delay);
		};
	}

	function stop(){
		if (isRecording){
			isRecording = false;
		}
	}
}

function bindAudioInput(element, key, audio, addTrackEvent){
	var keyDown = false;

	Mousetrap.bind(key, function() { onKeyDown(); });
	Mousetrap.bind(key, function() { onKeyUp(); }, 'keyup');

	element.addEventListener('touchstart', onKeyDown);
	element.addEventListener('mousedown', onKeyDown);
	element.addEventListener('touchend', onKeyUp);
	element.addEventListener('mouseup', onKeyUp);

	function onKeyDown(){
		if (!keyDown){
			keyDown = true;
			audio.play();

			if (addTrackEvent){
				addTrackEvent(audio.play);
			}
		}
	}

	function onKeyUp(){
		if (keyDown){
			keyDown = false;
			audio.stop();

			if (addTrackEvent){
				addTrackEvent(audio.stop);
			}
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