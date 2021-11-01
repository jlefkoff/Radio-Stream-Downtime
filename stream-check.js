const Ffmpeg = require('fluent-ffmpeg');

const STREAM_URL = 'http://129.10.161.130:8000/';
const VOLUME_THRESHOLD = -50; // volume threshold

getMeanVolume(STREAM_URL, function(meanVolume){
    if (meanVolume <= VOLUME_THRESHOLD) {
      console.log('WE HAVE A PROBLEM! VOLUME IS TOO LOW!');
    } else {
      console.log('ALL GOOD!');
    }
});
function getMeanVolume(streamUrl, callback) {
  new Ffmpeg({ source: streamUrl })
    .withAudioFilter('volumedetect')
    .addOption('-f', 'null')
    .addOption('-t', '10') // duration
    .noVideo()
    .on('start', (ffmpegCommand) => {
      console.log('Output the ffmpeg command ', ffmpegCommand);
    })
    .on('end', (stdout, stderr) => {
      // find the mean_volume in the output
      const meanVolumeRegex = stderr.match(/mean_volume:(\s-\d\d.\d\sdB)/);
    //   const meanVolumeRegex = stderr.match(/mean_volume:\s(-?[0–9]\d*(\.\d+)?)/);

      // return the mean volume
      if (meanVolumeRegex) {
        const meanVolume = parseFloat(meanVolumeRegex[1]);
        return callback(meanVolume);
      }

      // if the stream is not available
      if (stderr.match(/Server returned 404 Not Found/)) {
        return callback(false);
      }
    })
    .saveToFile('/dev/null');
}
