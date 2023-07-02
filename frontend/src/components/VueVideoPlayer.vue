<template>
  <div>
    <video-player :options="playerOptions" ref="videoPlayer" on-ended="this.onEnded"></video-player>
  </div>
</template>

<script>
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

export default {
  name: 'VueVideoPlayer',
  components: {
    VideoPlayer,
  },
  props: {
    s3PublicUrl: {
      type: String,
      required: true,
    },
    onEnded: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      playerOptions: {
        autoplay: true,
        sources: [
          {
            src: this.s3PublicUrl,
            type: 'video/mp4',
          },
        ],
      },
    }
  },
  mounted() {
    this.$refs.videoPlayer.player.play()
  },
}
</script>
