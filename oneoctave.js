var audioCtx = new (window.AudioContext || windows.webkitAudioContext)();
window.onload = init;

function init(){
	var C4 = createAudio(audioCtx, 'Piano.ff.C4.mp3');
	var D4 = createAudio(audioCtx, 'Piano.ff.D4.mp3');
	var E4 = createAudio(audioCtx, 'Piano.ff.E4.mp3');
	var F4 = createAudio(audioCtx, 'Piano.ff.F4.mp3');
	var G4 = createAudio(audioCtx, 'Piano.ff.G4.mp3');
	var A4 = createAudio(audioCtx, 'Piano.ff.A4.mp3');
	var B4 = createAudio(audioCtx, 'Piano.ff.B4.mp3');
	var C5 = createAudio(audioCtx, 'Piano.ff.C5.mp3');

	C4.decodeAudioData()
	.then(D4.decodeAudioData())
	.then(E4.decodeAudioData())
	.then(F4.decodeAudioData())
	.then(G4.decodeAudioData())
	.then(A4.decodeAudioData())
	.then(B4.decodeAudioData())
	.then(C5.decodeAudioData());

	var track = Track();
	bindControls(track);

	bindAudioInput(document.getElementById('C4'), 'a', C4, track.add);
	bindAudioInput(document.getElementById('D4'), 's', D4, track.add);
	bindAudioInput(document.getElementById('E4'), 'd', E4, track.add);
	bindAudioInput(document.getElementById('F4'), 'f', F4, track.add);
	bindAudioInput(document.getElementById('G4'), 'j', G4, track.add);
	bindAudioInput(document.getElementById('A4'), 'k', A4, track.add);
	bindAudioInput(document.getElementById('B4'), 'l', B4, track.add);
	bindAudioInput(document.getElementById('C5'), ';', C5, track.add);
}

function Track(){
	var events = [];
	var startTime;
	var isRecording = false;
	var timeoutIds = [];

	var t = {
		record: record,
		stop: stop,
		play: play,
		add: add,
		onFinishedPlaying: null
	}

	return t;

	function record(){
		startTime = new Date();
		events = [];
		timeoutIds = [];
		isRecording = true;
	}

	function add(func){
		if(isRecording){
			events.push({func: func,delay: new Date() - startTime});
		}
	}

	function play(){
		isRecording = false;
		for (var i = 0; i < events.length; i++) {
		 timeoutIds.push(setTimeout(events[i].func, events[i].delay));
		};

		var totalPlayTime = events[events.length - 1].delay;
		if (t.onFinishedPlaying){
			timeoutIds.push(setTimeout(t.onFinishedPlaying, totalPlayTime));
		}
	}

	function stop(){
		for (var i = 0; i < timeoutIds.length; i++) {
			clearTimeout(timeoutIds[i]);
		};
	}
}

function bindControls(track){
	var play = document.getElementById('Play');
	play.addEventListener('touchstart', playTrack);
	play.addEventListener('mousedown', playTrack);
	var stop = document.getElementById('Stop')
	stop.addEventListener('touchstart', stopTrack);
	stop.addEventListener('mousedown', stopTrack);
	stop.style.display = 'none';
	var record = document.getElementById('Record');
	record.addEventListener('touchstart', recordTrack);
	record.addEventListener('mousedown', recordTrack);
	
	track.onFinishedPlaying = function(){
		showPlay();
	}

	function playTrack(){
		showStop();
		stopRecording();
		track.play();
	}

	function stopTrack(){
		showPlay();
		track.stop();
	}

	function recordTrack(){
		track.record();
		record.style.backgroundColor = 'red';
	}

	function showPlay(){
		play.style.display = 'inline-block';
		stop.style.display = 'none';
	}

	function showStop(){
		play.style.display = 'none';
		stop.style.display = 'inline-block';
	}

	function stopRecording(){
		record.style.backgroundColor = '#F78543';
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