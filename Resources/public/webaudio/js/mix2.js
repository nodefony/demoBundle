require("./excanvas.js");
require("./jquery.knob.js");
require("./bootstrap-slider.js");
require("./bootstrap-slider.js");

require("../css/bootstrap-slider.css");
require("../css/wai.css");

module.exports = (function () {
  const drawSpectrum = function (myAudioAnalyser) {
    const canvas = $(this).get(0);
    const ctx = canvas.getContext("2d");
    const {width} = canvas;
    const {height} = canvas;
    const bar_width = 10;
    ctx.clearRect(0, 0, width, height);
    const freqByteData = new Uint8Array(myAudioAnalyser.frequencyBinCount);
    myAudioAnalyser.getByteFrequencyData(freqByteData);
    const barCount = Math.round(width / bar_width);
    for (let i = 0; i < barCount; i++) {
      const magnitude = freqByteData[i];
      // some values need adjusting to fit on the canvas
      ctx.fillStyle = "rgb(150,50,250)";
      ctx.fillRect(bar_width * i, height, bar_width - 2, -magnitude + 60);
    }
  };

  /*
   *
   *
   *	Class Design UI mixer
   *
   */
  const mixerUi = class mixerUi {
    constructor (container) {
      this.container = container;
      this.buildStruct();
    }

    buildStruct () {
      this.container.append("<div class=\"table mix-table\">\
					<div class=\"table-row\">\
						<div class=\"table-cell\">\
							<div class=\"table\">\
								<div class=\"table-row tracks\">\
									\
								</div>\
							</div>\
						</div>\
						<div class=\"table-cell w-80 b-l\">\
							<div class=\"table\">\
								<div class=\"table-row masterTrack\" style=\"overflow: auto;\"></div>\
							</div>\
						</div>\
					</div>\
				</div>");

      this.tracksContainer = this.container.find(".tracks");
      this.masterTracksContainer = this.container.find(".masterTrack");
    }

    addTrack (track, name, container) {
      container ||= this.tracksContainer;
      if (track.mediaType === "stream") {
        if (track.media.videotracks.length >= 1) {
          track.mediaType = "video";
        } else {
          track.mediaType = "audio";
        }
      }

      const content = $(`\
			<div class="table-cell" id="${name || track.settings.name}">\
				<div class="table">\
					<div class="table-row title">\
						<div class="table-cell w-70">${name || track.settings.name}</div>\
					</div>\
					<div class="table-row play">\
						<div class="table-cell w-70 mute">\
							<div class="h-50 m-t-10 m-b-10 text-center full-width">\
							<i class="fa fa-pause"></i>\
							</div>\
						</div>\
					</div>\
					<div class="table-row mediaType">\
						<div class="table-cell w-70 mute">\
							<div id="view" class="h-50 m-t-10 m-b-10 text-center full-width tagMediaType">\
								${track.mediaType == "video" ? "<video />" : "<audio /><i class=\"fa fa-music\"></i>"}\
							</div>\
						</div>\
					</div>\
					<div class="table-row spectrum">\
						<div class="table-cell w-70 mute">\
							<div id="view" class="h-50 m-t-10 m-b-10 text-center full-width">\
								${track.settings.analyser ? "<canvas />" : ""}\
							</div>\
						</div>\
					</div>\
					<div class="table-row pitch">\
						<div class="table-cell w-70 mute">\
							<div class="h-50 m-t-10 m-b-10 text-center full-width">\
								<div class="switch">\
									<input type="checkbox">\
									<label></label>\
								</div>\
							</div>\
						</div>\
					</div>\
					<div class="table-row pitch">\
						<div class="table-cell w-70 panner">\
							<div class="h-50 m-t-10 m-b-10 text-center full-width">\
								${track.settings.panner ? "<input type=\"text\" class=\"knob\" />" : ""}\
							</div>\
						</div>\
					</div>\
					<div class="table-row volume">\
						<div class="table-cell w-70 slider relative">\
							<input type="text" class="bootSlider" />\
						</div>\
					</div>\
				</div>\
			</div>`);

      container.append(content);

      if (track.mediaType === "element") {
        content.find(".tagMediaType").empty()
          .append(track.media);
      }

      content.find(".play i.fa").click(function () {
        if ($(this).hasClass("fa-play")) {
          $(this).removeClass("fa-play");
          $(this).addClass("fa-pause");
          if (track.pause) {
            track.pause();
          }

          if (track.mediaType === "video") {
            content.find("video").get(0)
              .pause();
          }
          if (track.settings.analyser) {
            clearTimeout(track.intervalSpectrumId);
            delete track.intervalSpectrumId;
          }
        } else {
          $(this).removeClass("fa-pause");
          $(this).addClass("fa-play");
          if (track.play) {
            track.play(0);
          }

          if (track.mediaType === "video") {
            content.find("video").get(0)
              .play();
          }

          if (track.settings.analyser) {
            track.intervalSpectrumId = setInterval(() => {
              drawSpectrum.call(content.find(".spectrum canvas"), track.audioNodes.analyser);
            }, 30);
          }
        }
      });

      content.find(".mute input[type=checkbox]")
        .attr("checked", track.muted)
        .on("click", (ev) => {
          if (ev.currentTarget.checked) {
            track.mute();
          } else {
            track.unmute();
          }
        });

      if (track.settings.panner) {
        content.find(".panner .knob").attr("value", track.audioNodes.panner.pan.value * 50 + 50)
          .knob({
            width: "70px",
            height: "80px",
            step: 10,
            angleOffset: -125,
            angleArc: 250,
            thickness: 0.5,
            cursor: 50,
            displayInput: false,
            change (value) {
              const val = Number((value / 50 - 1).toFixed(1));
              track.audioNodes.panner.pan.value = val;
            }
          });
      }

      content.find(".volume input.bootSlider").slider({
        reversed: true,
        min: 0,
        max: 100,
        step: 10,
        orientation: "vertical",
        value: track.getGain() * 100
      })
        .change((ev) => {
          track.setGain(ev.value.newValue / 100);
        });

      this.container.css({
        width: $(".mix-table").width(),
        "margin-left": -$(".mix-table").width() / 2
      });

      switch (true) {
      case track.media instanceof stage.media.mediaStream:
        var tag = content.find(track.mediaType == "video" ? "video" : "audio");
        track.media.attachMediaStream(tag.get(0));
        tag.prop("muted", true);
        break;
      case track.mediaType === "video":
        var tag = content.find(track.mediaType);
        tag.get(0).src = track.urlStream;
        tag.prop("muted", true);
        break;
      case track.mediaType === "audio":
        // track.play(0, true);
        break;
      case track.mediaType === "audioNode":
        // track.play(0, true);
        break;
      case track.mediaType === "domElement":
        // console.log(track.media)
        break;
      }
    }
  };

  /*
   *
   *	Class Mix
   *
   */
  const dtmfRef = {
    "1": [697, 1209],
    "2": [697, 1336],
    "3": [697, 1477],
    "4": [770, 1209],
    "5": [770, 1336],
    "6": [770, 1477],
    "7": [852, 1209],
    "8": [852, 1336],
    "9": [852, 1477],
    "#": [941, 1209],
    "0": [941, 1336],
    "*": [941, 1477]
  };

  const mix = class mix extends stage.Service {
    constructor (kernel) {
      super("MIXER", kernel.container);
      this.mediaMix = null;
    }

    build (container) {
      // create mediamix
      this.mediaMix = new stage.media.mediaMix({
        onReadyTrack: (mix, track) => {
          this.logger(`TRACK READY : ${track.name}`, "INFO");
          this.ui.addTrack(track);
        }
      });

      this.ui = new mixerUi(container);

      this.ui.addTrack(this.mediaMix.masterBus, "MASTER", this.ui.masterTracksContainer);
    }

    start () {
      this.ring = this.addTrack("AJAX WAV", "/demo-bundle/webaudio/music/marimba.wav");
      this.addTrack("AJAX MP3 ", "/demo-bundle/webaudio/music/Chico_Buarque.mp3");
      this.addTrack("AJAX webm", "/demo-bundle/webaudio/music/oceans-clip.webm");

      const domEle = $("<video src='/demo-bundle/webaudio/music/oceans-clip.webm' />");
      this.addTrack("DOM ELEMENT", domEle.get(0));

      this.LA = this.build440();
      this.dtmf = this.buildDtmf();

      // GET USER MEDIA
      this.localMedia = new stage.media.mediaStream();

      this.localMedia.getUserMedia(
        {
          audio: true,
          video: true
        },
        (mediaStream) => {
          this.addTrack("STREAM WEBCAM", mediaStream);
        },
        (e) => {
          console.log(e);
        }
      );
    }

    addTrack (name, media) {
      const track = this.mediaMix.createTrack(media, {
        name,
        gain: true,
        panner: true,
        filter: false,
        analyser: true
      });
    }

    buildDtmf () {
      const obj = {};
      for (const dtmf in dtmfRef) {
        const os1 = this.mediaMix.createOscillator();
        const os2 = this.mediaMix.createOscillator();
        const merger = this.mediaMix.createChannelMerger(2);
        os1.type = "sine";
        os1.frequency.value = dtmfRef[dtmf][0];
        os2.type = "sine";
        os2.frequency.value = dtmfRef[dtmf][1];
        os1.connect(merger, 0, 0);
        os2.connect(merger, 0, 1);
        os1.start(0);
        os2.start(0);
        const track = this.addTrack(`DTMF ${dtmf}`, merger);
        obj[dtmf] = track;
      }
      return obj;
    }

    build440 () {
      // LA 440
      const os = this.mediaMix.createOscillator();
      os.type = "sine";
      os.frequency.value = 440;
      // os.start(0);
      return this.addTrack("LA 440", os);
    }

    playRinging (timeBlink, time) {
      this.LA.play(0);
      if (timeBlink) {
        var blink = timeBlink;
      } else {
        var blink = 1500;
      }
      if (time) {
        var ti = time;
      } else {
        var ti = 10000;
      }
      const interval = setInterval(() => {
        if (this.LA.muted) {
          this.LA.unmute();
        } else {
          this.LA.mute();
        }
      }, blink);
      setTimeout(() => {
        clearInterval(interval);
        this.LA.pause(0);
      }, ti);
    }

    playDtmf (key, duration) {
      const touch = `${key}`;
      if (touch in this.dtmf) {
        this.dtmf[touch].play(0);
        setTimeout(() => {
          this.dtmf[touch].pause();
        }, duration || 500);
      }
    }

    playRing (duration) {
      this.ring.play(0, true);
      setTimeout(() => {
        this.ring.pause();
      }, duration || 10000);
    }
  };
  return mix;
}());
